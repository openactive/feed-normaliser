import { database_pool } from './database.js';

class feedInfo {
  static async getErrors(publisherId, feedId) {

    const client = await database_pool.connect();

    const feedErrorsSqlQuery = `
     SELECT
        raw_data.id as "csDataId",
        raw_data.validation_results
      FROM raw_data
      LEFT JOIN publisher_feed ON raw_data.publisher_feed_id=publisher_feed.id
      WHERE
       publisher_feed.publisher_id=$1 AND
       raw_data.publisher_feed_id=$2 AND
       raw_data.validation_passed = FALSE AND
       raw_data.validation_done = TRUE
    `;

    try {
      const resFeedErrors = await client.query(feedErrorsSqlQuery, [publisherId, feedId]);
      return resFeedErrors.rows;
    } catch(err){
      console.warn(err);
      return false;
    } finally {
      client.release();
    }
  }
}

export default feedInfo;
