import fetch from 'node-fetch';
import md5 from 'md5';

import { database_pool } from './database.js';
import Utils from './utils.js';
import Settings from './settings.js';


async function download_raw_all_publisher_feeds() {

  const client = await database_pool.connect();
    try {
        const res_find_publisher_feeds = await client.query('SELECT * FROM publisher_feed');
        for (var idx in res_find_publisher_feeds.rows) {
            if (Settings.sleepWhileDownloadRawSeconds > 0) {
                await Utils.sleep("download_raw_all_publisher_feeds", Settings.sleepWhileDownloadRawSeconds);
            }
            // Not await - we want the event loop of Node to run all feeds at once
            download_raw_publisher_feed(res_find_publisher_feeds.rows[idx], store_raw_callback);
        }
    } catch(error) {
        console.error("ERROR download_raw_all_publisher_feeds");
        console.error(error);

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release()
    }

}


async function store_raw_callback(publisher_feed, data, nextURL) {

    const client = await database_pool.connect();
    try {
        await client.query('BEGIN');

        for (const activityItem of data) {

            const idFromData = Utils.getIdFromData(activityItem.data, publisher_feed.url);

            if (activityItem.state == 'updated' || activityItem.state == 'deleted'){

                const query_data = [
                    publisher_feed.id,
                    activityItem.id,
                    idFromData,
                    (activityItem.state == 'updated'?'f':'t'),
                    activityItem.kind,
                    activityItem.modified,
                    activityItem.data,
                    md5(activityItem.data ? JSON.stringify(activityItem.data) : 'NULL'),
                ];

                const existsRes = await client.query(
                    `SELECT id FROM raw_data WHERE data_hash=$1`,
                    /* MD5 hash */
                    [query_data[7]]
                );

                /* This allows us to bail out early before a possible unnecessary insert/update/conflict */
                if (existsRes.rows.length > 0) {
                    console.log("Skipping existing data:",  activityItem.id, publisher_feed.id);
                    continue;
                }

                const resRawDataRes = await client.query(
                    `INSERT INTO raw_data (publisher_feed_id, rpde_id, data_id, data_deleted, data_kind, data_modified, data, normalised, data_hash)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, $8)
                    ON CONFLICT (publisher_feed_id, rpde_id) DO UPDATE SET
                    data_id=$3, data_deleted=$4, data_modified=$6, data=$7, updated_at=(now() at time zone 'utc'),
                    normalised=FALSE, normalisation_errors=NULL, validation_done=FALSE, validation_passed=FALSE, validation_results=NULL
                    RETURNING id`,
                    query_data
                );

                console.log("Inserting new/updated data:", activityItem.id, publisher_feed.id, activityItem.state);

                // (We only need to do the following queries on UPDATE not INSERT but we can't tell the difference)

                // Because the raw data has changed, we need to remove all data that is build from that
                // setting validation columns above clears the raw data validation.

                const resRawDataId = resRawDataRes.rows[0].id;

                // But we also need to flag normalised data as deleted
                await client.query(
                    "UPDATE normalised_data SET data_deleted=TRUE, data=NULL, updated_at=(NOW() AT TIME ZONE 'utc') WHERE raw_data_id=$1 OR raw_data_parent_id=$1",
                    [resRawDataId]
                );

                // And remove any results from profiling that normalised data
                await client.query(
                    "DELETE FROM normalised_data_profile_results WHERE normalised_data_id IN (SELECT id FROM normalised_data WHERE raw_data_id=$1 OR raw_data_parent_id=$1)",
                    [resRawDataId]
                );

            } else {
                console.warn("Unknown raw data state type");
            }

        }

        await client.query(
            'UPDATE publisher_feed SET raw_next_url=$1 WHERE id=$2'  ,
            [nextURL, publisher_feed.id]
        );

        await client.query('COMMIT');

    } catch(error) {
        await client.query('ROLLBACK');
        console.error("ERROR download_raw_all_publisher_feeds");
        console.error(data);
        console.error(error);

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release()
    }
}



async function download_raw_publisher_feed(publisher_feed, callback) {

    /* Starting position url for this publisher */
    let nextURL = new URL(publisher_feed.raw_next_url ?  publisher_feed.raw_next_url : publisher_feed.url);

    /* Traverse all the pages available since our last run */
    while (true) {
        if (Settings.sleepWhileDownloadRawSeconds > 0) {
            await Utils.sleep("download_raw_publisher_feed", Settings.sleepWhileDownloadRawSeconds);
        }

        try {
          let res = await fetch(nextURL);
          // TODO If get rate limited, back off and try again soon
          if (!res.ok) {
            throw res.status + " - " + res.statusText;
          }

          let activitiesJson = await res.json();

          if (activitiesJson.items.length == 0) {
            break;
          }

          nextURL = Utils.makeNextURL(publisher_feed.url, activitiesJson.next);

          await callback(publisher_feed, activitiesJson.items, nextURL);

        } catch (er) {
          console.log(`Issue with publisher feed ${publisher_feed.id} - ${er}`);
          download_raw_error(nextURL, er, publisher_feed.id);
          break;
        }

      }

}


async function download_raw_error(url, error, publisher_feed_id) {
    const client = await database_pool.connect();
    try {
        await client.query(
            'INSERT INTO  download_raw_errors (url, error, publisher_feed_id) VALUES ($1, $2, $3)',
            [url, error, publisher_feed_id]
        );
    } catch(error) {
        console.error("ERROR download_raw_error");
        console.error(error);
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release()
    }
};


export {
  store_raw_callback,
  download_raw_all_publisher_feeds,
};

export default download_raw_all_publisher_feeds;