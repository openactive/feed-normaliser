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


export {
  database_pool,
  migrate_database,
};

export default migrate_database;