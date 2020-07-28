import { database_pool } from './database.js';

class PublisherStatus {
  static async getLatestInfo() {
    const client = await database_pool.connect();
    const publisherSqlQuery = `
     SELECT
        publisher.id as "csPublisherId",
        publisher.name,
        publisher.url,
        publisher.data->'publisher'->'logo'->'url' as "logoUrl",
        publisher.data->'license' as license,
        COUNT(publisher_feed.id) as "feedCount"
      FROM publisher
      LEFT JOIN publisher_feed on publisher.id=publisher_feed.publisher_id
      GROUP BY publisher.id
      ORDER BY publisher.name
    `;

    let res;

    try {
      res = await client.query(publisherSqlQuery);
    } catch (err) {
      console.warn(err);
    } finally {
      client.release();
    }

    if (res){
      return res.rows;
    } else {
      return false;
    }
  }
}

export default PublisherStatus;
