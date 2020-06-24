import assert from 'assert';
import { migrate_database, delete_database  }  from '../src/lib/database.js';
import { database_pool } from '../src/lib/database.js';
import { normalise_data_publisher_feed } from '../src/lib/normalise-data.js';
import TestPipe from '../src/lib/pipes/test-pipe.js';

async function testNormaliseDeletedData() {

    let client;
    await delete_database();
    await migrate_database();

    //--------------------------------------------------- Insert Some Raw Data
    client = await database_pool.connect();
    let publisher_feed;
    try {
        // Publisher
        const res_add_publisher = await client.query('INSERT INTO publisher (name, url) VALUES ($1, $2) RETURNING id', ["Test", "http://test.com"]);
        const publisher_id = res_add_publisher.rows[0].id;
        // Publisher Feed
        const res_add_feed = await client.query('INSERT INTO publisher_feed (publisher_id, name, url) VALUES ($1, $2, $3) RETURNING id', [publisher_id, "Things","http://test.com/things"]);
        const publisher_feed_id = res_add_publisher.rows[0].id;
        const res_select_publisher_feed = await client.query('SELECT * FROM publisher_feed');
        publisher_feed = res_select_publisher_feed.rows[0];
        // Raw data
        const res_add_raw = await client.query('INSERT INTO raw_data (publisher_feed_id, data_id, data_deleted, data_kind, data_modified, data) VALUES ($1, $2, $3, $4, $5, $6)', [publisher_feed_id, "D1",true, "CATS", "1", null]);

    } catch(error) {
        console.error("ERROR in test");
        console.error(error);

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        await client.release()
    }

    //--------------------------------------------------- Process!
    // We are going to pass TestPipe but actually I think it makes no difference to this test
    await normalise_data_publisher_feed(publisher_feed, [TestPipe]);

    //--------------------------------------------------- Check Results
    client = await database_pool.connect();
    let results;
    try {
        const res_select_publisher_feed = await client.query('SELECT * FROM normalised_data ORDER BY id ASC');
        results = res_select_publisher_feed.rows;
    } catch(error) {
        console.error("ERROR in test");
        console.error(error);
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        await client.release()
    }

    assert.equal(results.length,0);

    // Raw data - is normalised flag set?
    client = await database_pool.connect();
    let results_raw_data;
    try {
        const res_select_raw_data = await client.query('SELECT * FROM raw_data');
        results_raw_data = res_select_raw_data.rows;
    } catch(error) {
        console.error("ERROR in test");
        console.error(error);
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        await client.release()
    }

    assert.equal(results_raw_data.length,1);
    assert.deepEqual(results_raw_data[0].normalised,true);

};


export {
  testNormaliseDeletedData,
};
