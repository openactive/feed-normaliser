import { database_pool } from './database.js';
import PipeLine from './pipeline.js';
import pipes from './pipes/index.js';


async function normalise_data_all_publisher_feeds() {
  const client = await database_pool.connect();
    try {
        const res_find_publisher_feeds = await client.query('SELECT * FROM publisher_feed');
        for (var idx in res_find_publisher_feeds.rows) {
            // Not await - we want the event loop of Node to run all feeds at once
            normalise_data_publisher_feed(res_find_publisher_feeds.rows[idx], pipes);
        }
    } catch(error) {
        console.error("ERROR normalise_data_all_publisher_feeds");
        console.error(data);
        console.error(error);

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release()
    }

}

async function store_normalised_callback(raw_data_id, normalised_events) {

    const client = await database_pool.connect();
    try {
        await client.query('BEGIN');

        for (const normalised_event of normalised_events) {

            const query_data = [
                raw_data_id,
                normalised_event.id(),
                normalised_event.data
            ];

            await client.query(
                'INSERT INTO normalised_data (raw_data_id, data_id, data_deleted, data) ' +
                'VALUES ($1, $2, \'t\', $3) ' +
                'ON CONFLICT (data_id) DO UPDATE SET ' +
                'raw_data_id=$1, data_id=$2, data=$3, updated_at=(now() at time zone \'utc\'), data_deleted=\'f\''  ,
                query_data
            );

        }

        await client.query(
            'UPDATE raw_data SET normalised=\'t\' WHERE id=$1'  ,
            [raw_data_id]
        );

        await client.query('COMMIT');

    } catch(error) {
        await client.query('ROLLBACK');
        console.error("ERROR download_raw_all_publisher_feeds");
        console.error(raw_data_id);
        console.error(normalised_events);
        console.error(error);

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release()
    }

}

async function normalise_data_publisher_feed(publisher_feed, pipes_to_call) {

    console.log("normalise_data_feed " + publisher_feed.id)

    const client = await database_pool.connect();
    try {
        while(true) {
            const res_find_raw_data = await client.query('SELECT * FROM raw_data WHERE publisher_feed_id=$1 AND normalised = \'f\' ORDER BY updated_at ASC LIMIT 10',[publisher_feed.id]);
            if (res_find_raw_data.rows.length == 0) {
                break;
            }
            for (var raw_data of res_find_raw_data.rows) {
                if (raw_data.deleted) {
                    // TODO
                    // In this case, can we always assume we should mark as deleted all normalised_data that comes from this raw data object?
                    // If so, this should be a second call back. This should be an easy SQL UPDATE to run.
                } else {
                    const pipeLine = new PipeLine(raw_data, pipes_to_call, store_normalised_callback);
                    await pipeLine.run();
                }
            }
        }
    } catch(error) {
        console.error("ERROR normalise_data_publisher_feed");
        console.error(publisher_feed);
        console.error(error);
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release()
    }


}

export {
  normalise_data_all_publisher_feeds,
  normalise_data_publisher_feed,
};

export default normalise_data_all_publisher_feeds;
