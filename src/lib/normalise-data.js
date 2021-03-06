import { database_pool } from './database.js';
import PipeLine from './pipeline.js';
import pipes from './pipes/index.js';
import Settings from './settings.js';


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

async function store_normalised(normalised, client) {

  for (const normalised_event of normalised.normalisedEvents) {

    const query_data = [
      normalised.rawDataId,
      normalised_event.id(),
      normalised_event.data,
      normalised_event.kind,
      normalised_event.parentId,
      (normalised_event.errors ? { 'errors': normalised_event.errors } : undefined)
    ];

    const res = await client.query(
      'INSERT INTO normalised_data (raw_data_id, data_id, data_deleted, data, data_kind, raw_data_parent_id, normalisation_errors) ' +
      'VALUES ($1, $2, \'f\', $3, $4, $5, $6) ' +
      'ON CONFLICT (data_id) DO UPDATE SET ' +
      'raw_data_id=$1, data_id=$2, data=$3, data_kind=$4, raw_data_parent_id=$5, normalisation_errors=$6, updated_at=(now() at time zone \'utc\'), data_deleted=\'f\'' +
      'RETURNING id',
      query_data
    );

    // Because we have updated the data, the results of the profile checks are now stale. Delete them so we recalculate.
    // (We only need to do this on UPDATE not INSERT but we can't tell the difference).
    // ( In theory, we shouldn't need to do this at all - when a raw data item is updated, that will delete all the normalised_data_profile_results too.
    //   But unless people start raising performance issues, lets be safe and just run a delete.)
    await client.query('DELETE FROM normalised_data_profile_results WHERE normalised_data_id=$1', [res.rows[0].id])

  }

  await client.query(
    'UPDATE raw_data SET normalised=TRUE, normalisation_errors=$2 WHERE id=$1',
    [normalised.rawDataId, (normalised.errors && normalised.errors.length > 0 ? { 'errors': normalised.errors } : undefined)]
  );

}

async function normalise_data_publisher_feed(publisher_feed, pipes_to_call) {

    console.log("normalise_data_feed " + publisher_feed.id);

    while(true) {

        let rows = []

        // Step 1 - load data to process
        // we open and make sure we CLOSE the database connection after this, so the DB connection is not held open when processing in an unneeded manner
        const client = await database_pool.connect();

        client.query("BEGIN");

        try {
            const res_find_raw_data = await client.query(
                'SELECT * FROM raw_data WHERE publisher_feed_id=$1 AND data_deleted=FALSE AND normalised=FALSE LIMIT '+ Settings.normaliseDataLoadWorkLimit + ' FOR UPDATE SKIP LOCKED',
                [publisher_feed.id]
            );
            if (res_find_raw_data.rows.length == 0) {
                break;
            }
            // Make sure we just store raw data and no database cursors, etc
            for (var raw_data of res_find_raw_data.rows) {
                rows.push(raw_data)
            }

            /* Step 2 run the raw data through our pipe line */
            for (var raw_data of rows) {
                console.log("Running "+raw_data.id + " from " + publisher_feed.id);
                const pipeLine = new PipeLine(raw_data, pipes_to_call);
                let normalised = await pipeLine.run();
                await store_normalised(normalised, client);
            }

            client.query("COMMIT");

        } catch(error) {
            console.error("ERROR normalise_data_publisher_feed");
            console.error(publisher_feed);
            console.error(error);
            client.query("ROLLBACK");
            break;
        } finally {
            // Make sure to release the client before any error handling,
            // just in case the error handling itself throws an error.
            client.release()
        }

    }

}

export {
  normalise_data_all_publisher_feeds,
  normalise_data_publisher_feed,
};

export default normalise_data_all_publisher_feeds;
