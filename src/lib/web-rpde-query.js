import Settings from './settings.js';
import { database_pool } from './database.js';




class rpde_query {
  constructor(afterTimestamp, afterId, limit) {
    this.afterTimestamp = parseInt(afterTimestamp) > 0 ? parseInt(afterTimestamp) : null;
    this.afterId = afterId;
    this.limit = parseInt(limit) > 0 ? parseInt(limit) : Settings.rpdeDefaultLimit;
    this.nextAfterTimestamp = null;
    this.nextAfterId = null;
    this.rows = []
    this.dontServeDataUntilSecondsOld = Settings.rpdeDontServeDataUntilSecondsOld;
  }

  async run() {
    // ----- Build SQL
    // Postgres will compare by microseconds if we let it. To make sure paging work correctly, we must compare by seconds only. Hence "extract(epoch" stuff.
    let sql = "SELECT * FROM normalised_data ";
    // This is to deal with the race condition described at https://developer.openactive.io/publishing-data/data-feeds/implementing-rpde-feeds#transactions-preventing-delayed-item-interleaving
    sql += " WHERE updated_at < ((now() at time zone 'utc') - interval '"+ this.dontServeDataUntilSecondsOld +" seconds') ";
    // Now if user has specified after, add those
    let params = [];
    if (this.afterTimestamp && this.afterId) {
       sql += " AND ( ( extract(epoch from updated_at)::int = $1 AND data_id > $2) OR (extract(epoch from updated_at)::int > $1)) ";
       params = [this.afterTimestamp, this.afterId];
    }
    // Finally order and limit
    sql += "ORDER BY extract(epoch from updated_at)::int ASC, data_id ASC LIMIT " + this.limit
    // ----- Run Query, store results
    const client = await database_pool.connect();
    try {
        const res = await client.query(sql, params);
        for (var database_data of res.rows) {
            const item = {
                "state": (database_data.data_deleted ? "deleted" : "updated"),
                "kind": database_data.data_kind,
                "id": database_data.data_id,
                "modified": database_data.updated_at,
            };
            if (!database_data.data_deleted) {
                item.data = database_data.data;
            }
            this.rows.push(item);
            this.nextAfterId = database_data.data_id;
            this.nextAfterTimestamp = database_data.updated_at;
        }
    } catch(error) {
        console.error("ERROR rpde_query->run");
        console.error(error);
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release()
    }

  }

  get_data() {
       return this.rows;
  }

  // This should be returned already URL encoded
  get_next_get_params_string() {
    if (this.nextAfterTimestamp && this.nextAfterId) {
        // In this case, we found some new data! Return the values from the last data item we found.
        return "afterTimestamp=" + encodeURIComponent(Math.round(this.nextAfterTimestamp.getTime() / 1000)) + "&afterId=" + encodeURIComponent(this.nextAfterId);
    } else if (this.afterTimestamp && this.afterId) {
        // We were passed some values, but found no new data. Return exactly the same values.
        return "afterTimestamp=" + encodeURIComponent(this.afterTimestamp) + "&afterId=" + encodeURIComponent(this.afterId);
    } else {
        // We were not passed any values, and there is no data is the database at all!
        return "";
    }
  }

}

export default rpde_query;
