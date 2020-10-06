import pg from 'pg';
import migrations from "postgres-migrations"
import Settings from './settings.js';


const database_pool = new pg.Pool({
      connectionString: Settings.postgresURL,
      ssl: Settings.postgresSSL,
});

async function migrate_database() {
    var client;
    try {
        client = await database_pool.connect();
        await migrations.migrate({client}, "./src/lib/database-migrations");
    } finally {
        await client.end();
    }
}


async function delete_database() {
    var client;
    try {
        client = await database_pool.connect();
        await client.query('DROP TABLE IF EXISTS download_raw_errors CASCADE');
        await client.query('DROP TABLE IF EXISTS spider_data_catalog_error CASCADE');
        await client.query('DROP TABLE IF EXISTS normalised_data_profile_results CASCADE');
        await client.query('DROP TABLE IF EXISTS normalised_data CASCADE');
        await client.query('DROP TABLE IF EXISTS raw_data CASCADE');
        await client.query('DROP TABLE IF EXISTS publisher_feed CASCADE');
        await client.query('DROP TABLE IF EXISTS publisher CASCADE');
        await client.query('DROP TABLE IF EXISTS migrations CASCADE');
    } finally {
        await client.end();
    }
}

/* Remove old and stale items from the database */
async function clean_up_database() {
    let client;

    client = await database_pool.connect();
    try {
        /* Current date - max days
         * The DB driver doesn't seem to parse sql version of this:
         * select count(id) from raw_data where updated_at > (date (now() at time zone 'utc') - integer '14')
         */
        const date = new Date();
        date.setHours(-1* (date.getHours() + (Settings.maxDataAgeDays * 24)));
        await client.query("DELETE FROM raw_data WHERE updated_at < $1 AND data_deleted=TRUE", [date]);
    } finally {
        await client.end();
    }
}

export {
  database_pool,
  migrate_database,
  delete_database,
  clean_up_database,
};

export default migrate_database;