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
        console.error(error);

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release()
    }

}

async function store_deleted_callback(raw_data_id) {

    const client = await database_pool.connect();
    try {

        // TODO
        // In this case, can we always assume we should mark as deleted all normalised_data that comes from this raw data object?
        // If so, this should be an easy SQL UPDATE to run.
        // UPDATE normalised_data SET data_deleted='t', data=NULL , updated=NOW WHERE raw_data_id=$1
        // UPDATE normalised_data SET data_deleted='t', data=NULL , updated=NOW WHERE raw_data_parent_id=$1

        // But we do want to mark the fact that we have processed this raw_data item, so we don't want try to process it again
        await client.query(
            'UPDATE raw_data SET normalised=\'t\' WHERE id=$1'  ,
            [raw_data_id]
        );

    } catch(error) {
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

async function store_normalised_callback(raw_data_id, normalised_events) {

    const client = await database_pool.connect();

    try {
        await client.query('BEGIN');

        for (const normalised_event of normalised_events) {

            const query_data = [
                raw_data_id,
                normalised_event.id(),
                normalised_event.data,
                normalised_event.kind,
                normalised_event.parentId
            ];

            const res = await client.query(
                'INSERT INTO normalised_data (raw_data_id, data_id, data_deleted, data, data_kind, raw_data_parent_id) ' +
                'VALUES ($1, $2, \'f\', $3, $4, $5) ' +
                'ON CONFLICT (data_id) DO UPDATE SET ' +
                'raw_data_id=$1, data_id=$2, data=$3, data_kind=$4, raw_data_parent_id=$5, updated_at=(now() at time zone \'utc\'), data_deleted=\'f\''  +
                'RETURNING id',
                query_data
            );

            // Because we have updated the data, the results of the profile checks are now stale. Delete them so we recalculate.
            // (We only need to do this on UPDATE not INSERT but we can't tell the difference).
            await client.query('DELETE FROM normalised_data_profile_results WHERE normalised_data_id=$1', [res.rows[0].id])

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

    console.log("normalise_data_feed " + publisher_feed.id);

    while(true) {

        let rows = []

        // Step 1 - load data to process
        // we open and make sure we CLOSE the database connection after this, so the DB connection is not held open when processing in an unneeded manner
        const client = await database_pool.connect();
        try {
            const res_find_raw_data = await client.query('SELECT * FROM raw_data WHERE publisher_feed_id=$1 AND normalised = \'f\' ORDER BY updated_at ASC LIMIT 10',[publisher_feed.id]);
            if (res_find_raw_data.rows.length == 0) {
                break;
            }
            // Make sure we just store raw data and no database cursors, etc
            for (var raw_data of res_find_raw_data.rows) {
                rows.push(raw_data)
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

        // Step 2 - process each item of data we got
        try {
            for (var raw_data of rows) {
                console.log("Running "+raw_data.id + " from " + publisher_feed.id);
                if (raw_data.data_deleted) {
                    await store_deleted_callback(raw_data.id);
                } else {
                    const pipeLine = new PipeLine(raw_data, pipes_to_call, store_normalised_callback);
                    await pipeLine.run();
                }
            }
        } catch(error) {
            console.error("ERROR normalise_data_publisher_feed");
            console.error(publisher_feed);
            console.error(error);
        }

    }

}

export {
  normalise_data_all_publisher_feeds,
  normalise_data_publisher_feed,
};

export default normalise_data_all_publisher_feeds;
