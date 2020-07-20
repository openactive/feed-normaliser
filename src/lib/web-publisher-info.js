import { database_pool } from './database.js';

class  PublisherInfo {
  static async getInfo(publisherId) {

    const client = await database_pool.connect();

    const publisherSqlQuery = `
     SELECT
        name,
        url
      FROM publisher
      WHERE id=$1 LIMIT 1
    `;

    const publisherFeedsSqlQuery = `
     SELECT
        name,
        url
      FROM publisher_feed
      WHERE publisher_id=$1
    `;

    let publisherInfo = {}

    try {
      const resPublisher = await client.query(publisherSqlQuery, [publisherId]);
      const resFeeds = await client.query(publisherFeedsSqlQuery, [publisherId]);

      publisherInfo = resPublisher.rows[0];

      if (publisherInfo){
        publisherInfo.feeds = resFeeds.rows;
      }
    } catch(err){
      console.warn(err);
      publisherInfo = false;
    } finally {
      client.release();
    }

    return publisherInfo;
  }
}

export default PublisherInfo;
