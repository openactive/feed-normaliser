import { database_pool } from './database.js';

class PublisherStatus {
  static async getLatestInfo() {
    const client = await database_pool.connect();
    const sqlQuery = `
     SELECT
        name,
        url,
        data->'publisher'->'logo'->'url' as "logoUrl",
        data->'license' as license
      FROM publisher
    `;

    const res = await client.query(sqlQuery);
    client.release();

    return res.rows;
  }
}

export default PublisherStatus;
