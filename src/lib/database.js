import pg from 'pg';
import migrations from "postgres-migrations"
import Settings from './settings.js';


const database_pool = new pg.Pool({
      connectionString: Settings.postgresURL,
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

export {
  database_pool,
  migrate_database,
  delete_database,
};

export default migrate_database;