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

    const resPublisher = await client.query(publisherSqlQuery, [publisherId]);


    const publisherFeedsSqlQuery = `
     SELECT
        name,
        url
      FROM publisher_feed
      WHERE publisher_id=$1
    `;

    const resFeeds = await client.query(publisherFeedsSqlQuery, [publisherId]);

    client.release();

    let publisherInfo = {}

    publisherInfo = resPublisher.rows[0];
    publisherInfo.feeds = resFeeds.rows;

    return publisherInfo;
  }
}

export default PublisherInfo;
