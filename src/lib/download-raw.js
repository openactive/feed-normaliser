import fetch from 'node-fetch';
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
                    activityItem.data
                ];

                await client.query(
                    'INSERT INTO raw_data (publisher_feed_id, rpde_id, data_id, data_deleted, data_kind, data_modified, data, normalised) ' +
                    'VALUES ($1, $2, $3, $4, $5, $6, $7, \'f\') ' +
                    'ON CONFLICT (publisher_feed_id, rpde_id) DO UPDATE SET ' +
                    'data_id=$3, data_deleted=$4, data_modified=$6, data=$7, updated_at=(now() at time zone \'utc\'), normalised=\'f\', validation_done=\'f\', validation_passed=\'f\', validation_results=NULL'  ,
                    query_data
                );

            } else {
                // TODO
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
  download_raw_all_publisher_feeds,
};

export default download_raw_all_publisher_feeds;