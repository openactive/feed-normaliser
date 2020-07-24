import { database_pool } from './database.js';

class  NormalisedDataInfo {
  static async getInfo(data_id) {

    const normalised_data_sql_query = `
     SELECT
        *
      FROM normalised_data
      WHERE data_id=$1 LIMIT 1
    `;

    const client = await database_pool.connect();

    let out;

    try {
      const res_normalised_data = await client.query(normalised_data_sql_query, [data_id]);
      if (res_normalised_data.rows.length == 1){
        const normalised_data = res_normalised_data.rows[0];
        out = {
            'id': normalised_data.data_id,
            'deleted': normalised_data.data_deleted,
            'data': normalised_data.data,
            'updated_at': normalised_data.updated_at,
            'kind': normalised_data.data_kind
        };

        out['raw_data'] = await this.get_raw_data_info(normalised_data.raw_data_id, client);

        if (normalised_data.raw_data_parent_id) {
            out['parent_raw_data'] = await this.get_raw_data_info(normalised_data.raw_data_parent_id, client);
        } else {
            out['parent_raw_data'] = null;
        }

      } else {
        out = undefined;
      }

    } catch(err){
      console.warn(err);
      out = false;
    } finally {
      client.release();
    }

    return out;
  }

  static async get_raw_data_info(raw_data_id, client) {


    const raw_data_sql_query = `
     SELECT
        *
      FROM raw_data
      WHERE id=$1
    `;

    const publisher_feed_sql_query = `
     SELECT
        *
      FROM publisher_feed
      WHERE id=$1
    `;

    const publisher_sql_query = `
     SELECT
        *
      FROM publisher
      WHERE id=$1
    `;

    const res_raw_data = await client.query(raw_data_sql_query, [raw_data_id]);
    const raw_data = res_raw_data.rows[0];

    let out = {
        'rpde_id': raw_data.rpde_id,
        'data_id': raw_data.data_id,
        'kind': raw_data.data_kind,
        'data': raw_data.data,
        'validation': {
            'done': raw_data.validation_done
        }
    };

    if (raw_data.validation_done) {
        out['validation']['results'] =  raw_data.validation_results;
    }

    const res_publisher_feed = await client.query(publisher_feed_sql_query, [raw_data.publisher_feed_id]);
    const publisher_feed = res_publisher_feed.rows[0];

    out['feed'] = {
        'name': publisher_feed.name,
        'url': publisher_feed.url
    }

    const res_feed = await client.query(publisher_sql_query, [publisher_feed.publisher_id]);
    const feed = res_feed.rows[0];

    out['feed']['publisher'] = {
        'name': feed.name,
        'url': feed.url
    }

    return out
  }
}

export default NormalisedDataInfo;
