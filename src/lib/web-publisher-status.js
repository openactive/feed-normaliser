import { database_pool } from './database.js';

class PublisherStatus {
  static async getLatestInfo() {
    const client = await database_pool.connect();
    const res = await client.query("SELECT name, url from publisher");
    client.release();

    return res.rows;
  }
}

export default PublisherStatus;
