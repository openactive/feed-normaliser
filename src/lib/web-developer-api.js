import { database_pool } from './database.js';

let defaultPageSize = 10;
class  WebDeveloperApi {

  static async getLatestEventsForAge(min, max, page) {
    const client = await database_pool.connect();

    if (!page){
      page = 0;
    } else {
      /* page 1 = page 0 */
      page = page -1;
      if (page < 0){
        page = 0;
      }
    }

    if (!min){
      min = 0;
    }

    if (!max){
      max = 9999;
    }

    const sqlQuery = `
     SELECT data FROM normalised_data
      WHERE data_deleted = FALSE AND
      ((data->'superEvent'->'ageRange'->'minValue')::int = $1 AND
      (data->'superEvent'->'ageRange'->'maxValue')::int = $2)
      ORDER BY updated_at DESC
      LIMIT $3
      OFFSET $4
    `;

    let res;

    try {
      res = await client.query(sqlQuery, [min, max, defaultPageSize, (defaultPageSize * page)]);
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

export default WebDeveloperApi;
