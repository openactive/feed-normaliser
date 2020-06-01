import fetch from 'node-fetch';
import { database_pool } from './database.js';
import Utils from './utils.js';

async function download_raw_all_publisher_feeds() {

  const client = await database_pool.connect();
    try {
        const res_find_publisher_feeds = await client.query('SELECT * FROM publisher_feed');
        for (var idx in res_find_publisher_feeds.rows) {
            // Not await - we want the event loop of Node to run all feeds at once
            download_raw_publisher_feed(res_find_publisher_feeds.rows[idx], store_raw_callback);
        }
    } catch(error) {
        console.error("ERROR download_raw_all_publisher_feeds");
        console.error(data);
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

            if (activityItem.state == 'updated' || activityItem.state == 'deleted'){

                const query_data = [
                    publisher_feed.id,
                    activityItem.id,
                    (activityItem.state == 'updated'?'f':'t'),
                    activityItem.kind,
                    activityItem.modified,
                    activityItem.data
                ];

                await client.query(
                    'INSERT INTO raw_data (publisher_feed_id, data_id, data_deleted, data_kind, data_modified, data, normalised) ' +
                    'VALUES ($1, $2, $3, $4, $5, $6, \'f\') ' +
                    'ON CONFLICT (publisher_feed_id, data_id) DO UPDATE SET ' +
                    'data_deleted=$3, data_modified=$5, data=$6, updated_at=(now() at time zone \'utc\'), normalised=\'f\''  ,
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
        /* Sleep - avoid hitting publisher's api too hard */
        await Utils.sleep("oa-rpde-page-iter", 1);

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
          break;
        }

      }

}



export {
  download_raw_all_publisher_feeds,
};

export default download_raw_all_publisher_feeds;