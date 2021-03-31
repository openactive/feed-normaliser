import assert from 'assert';
import { migrate_database, delete_database  }  from '../src/lib/database.js';
import { database_pool } from '../src/lib/database.js';
import { normalise_data_publisher_feed } from '../src/lib/normalise-data.js';
import TestPipe from '../src/lib/pipes/test-pipe.js';
import { store_raw_callback } from '../src/lib/download-raw.js';
import { validate_raw_data_all } from '../src/lib/validate-raw-data.js';
import { profile_normalised_data_all_for_profile } from '../src/lib/profile-normalised-data.js';
import { Utils } from '../src/lib/utils.js';


describe('normalise deleted raw data', function() {
    it('basic test', async function() {

        let client;
        await delete_database();
        await migrate_database();

        //--------------------------------------------------- Insert Some Raw Data
        client = await database_pool.connect();
        let publisher_feed;
        try {
            await client.query('DELETE FROM raw_data');
            await client.query('DELETE FROM publisher_feed');
            await client.query('DELETE FROM publisher');

            // Publisher
            const res_add_publisher = await client.query('INSERT INTO publisher (name, url) VALUES ($1, $2) RETURNING id', ["Test", "http://test.com"]);
            const publisher_id = res_add_publisher.rows[0].id;
            // Publisher Feed
            await client.query('INSERT INTO publisher_feed (publisher_id, name, url) VALUES ($1, $2, $3) RETURNING id', [publisher_id, "Things","http://test.com/things"]);
            const res_select_publisher_feed = await client.query('SELECT * FROM publisher_feed');
            publisher_feed = res_select_publisher_feed.rows[0];

        } catch(error) {
            console.error("ERROR in test");
            console.error(error);

        } finally {
            // Make sure to release the client before any error handling,
            // just in case the error handling itself throws an error.
            await client.release()
        }

        await store_raw_callback(
            publisher_feed,
            [
                {
                    'state': 'updated',
                    'kind': 'test',
                    'id': '573',
                    'modified':	'2020-07-22T16:04:25.957Z',
                    'data': {
                        "elephants": "cant go on the trampoline"
                    }
                }
            ],
            'http://test.com/things?more'
        );

        //--------------------------------------------------- Process!
        // Problem:  We need to make sure that this work actually happens before going to next stage;
        //           due to event loop this is a bit complex and explains some specific calls here
        // ----- Normalise
        // We are going to pass TestPipe because we want set number of normalised events out
        //
        await normalise_data_publisher_feed(publisher_feed, [TestPipe]);
        // ----- validate raw
        await validate_raw_data_all();
        // ----- Profile data
        await profile_normalised_data_all_for_profile("core");

        //--------------------------------------------------- Check Results
        client = await database_pool.connect();
        let r_raw_rows;
        let r_norm_rows;
        let r_profile_rows;
        try {
            // Raw?
            const r_raw = await client.query('SELECT * FROM raw_data');
            r_raw_rows = r_raw.rows;

            // Have normalised?
            const r_norm = await client.query('SELECT * FROM normalised_data ORDER BY id ASC');
            r_norm_rows = r_norm.rows;

            // Have Validation results
            const r_profile = await client.query('SELECT * FROM normalised_data_profile_results');
            r_profile_rows = r_profile.rows;
        } catch(error) {
            console.error("ERROR in test");
            console.error(error);
        } finally {
            // Make sure to release the client before any error handling,
            // just in case the error handling itself throws an error.
            await client.release()
        }

        // Raw?
        assert.equal(r_raw_rows.length,1);
        assert.equal(false, r_raw_rows[0].data_deleted);
        assert.equal(true, r_raw_rows[0].normalised);
        assert.equal(true, r_raw_rows[0].validation_done);

        // Have normalised?
        assert.equal(r_norm_rows.length,2);
        assert.equal(false, r_norm_rows[0].data_deleted)
        assert.equal(false, r_norm_rows[1].data_deleted)

        // Have Validation results
        assert.equal(r_profile_rows.length,2);

        //------------------------------------------ Now update the raw data

        await store_raw_callback(
            publisher_feed,
            [
                {
                    'state': 'updated',
                    'kind': 'test',
                    'id': '573',
                    'modified':	'2020-07-23T16:04:25.957Z',
                    'data': {
                        "elephants": "ok the little ones can"
                    }
                }
            ],
            'http://test.com/things?more'
        );

        //--------------------------------------------------- Check Results - all calculated things should be cleared!
        client = await database_pool.connect();
        let r_raw_rows_2;
        let r_norm_rows_2;
        let r_profile_rows_2;
        try {
            // Raw?
            const r_raw = await client.query('SELECT * FROM raw_data');
            r_raw_rows_2 = r_raw.rows;

            // Have normalised?
            const r_norm = await client.query('SELECT * FROM normalised_data ORDER BY id ASC');
            r_norm_rows_2 = r_norm.rows;

            // Have Validation results
            const r_profile = await client.query('SELECT * FROM normalised_data_profile_results');
            r_profile_rows_2 = r_profile.rows;
        } catch(error) {
            console.error("ERROR in test");
            console.error(error);
        } finally {
            // Make sure to release the client before any error handling,
            // just in case the error handling itself throws an error.
            await client.release()
        }

        // Raw?
        assert.equal(r_raw_rows_2.length,1);
        assert.equal(false, r_raw_rows_2[0].data_deleted);
        assert.equal(false, r_raw_rows_2[0].normalised);
        assert.equal(false, r_raw_rows_2[0].validation_done);

        // Have normalised?
        assert.equal(r_norm_rows_2.length,2);
        assert.equal(true, r_norm_rows_2[0].data_deleted)
        assert.equal(true, r_norm_rows_2[1].data_deleted)

        // Have Validation results
        assert.equal(r_profile_rows_2.length,0);

    });
});