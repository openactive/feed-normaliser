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
        id as "csFeedId",
        name,
        url,
        stats
      FROM publisher_feed
      WHERE publisher_id=$1
      ORDER BY name
    `;

    let publisherInfo = {}

    try {
      const resFeeds = await client.query(publisherFeedsSqlQuery, [publisherId]);
      const resPublisher = await client.query(publisherSqlQuery, [publisherId]);

      publisherInfo.name = resPublisher.rows[0].name;
      publisherInfo.url = resPublisher.rows[0].url;
      publisherInfo.feeds = resFeeds.rows;
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
