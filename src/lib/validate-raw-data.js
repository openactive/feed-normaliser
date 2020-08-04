import { database_pool } from './database.js';
import validator from '@openactive/data-model-validator';
import Settings from './settings.js';
import fs from 'fs';

const validate_options = {
    loadRemoteJson: true,
    remoteJsonCachePath: Settings.dataModelValidatorRemoteJsonCachePath,
};

async function set_up_for_validation() {
    if (!fs.existsSync(validate_options.remoteJsonCachePath)) {
         await fs.promises.mkdir(validate_options.remoteJsonCachePath, {recursive:true});
    }
}

/*
 * TODO This will run only one check at a time - add something so it runs several at once!
 * But I want to discuss with others best way to do that first
 */
async function validate_raw_data_all() {

    await set_up_for_validation();

    while(true) {

        let rows = []

        // Step 1 - load data to process
        // we open and make sure we CLOSE the database connection after this, so the DB connection is not held open when processing in an unneeded manner
        const client = await database_pool.connect();
        try {
            const res_find_raw_data = await client.query(
                'SELECT * FROM raw_data WHERE validation_done = \'f\' AND data_deleted=\'f\' ORDER BY updated_at ASC LIMIT '+Settings.validateRawDataLoadWorkLimit
            );
            if (res_find_raw_data.rows.length == 0) {
                break;
            }
            // Make sure we just store raw data and no database cursors, etc
            for (var raw_data of res_find_raw_data.rows) {
                rows.push(raw_data)
            }
        } catch(error) {
            console.error("ERROR validate_raw_data_all");
            console.error(error);
            break;
        } finally {
            // Make sure to release the client before any error handling,
            // just in case the error handling itself throws an error.
            client.release()
        }


        // Step 2 - process each item of data we got
        for (var raw_data of rows) {
            await validate_raw_data(raw_data);
        }



    }

}

async function validate_raw_data(raw_data) {


    const client = await database_pool.connect();
    try {
        const result = await validator.validate(raw_data.data, validate_options);
        const result_filtered = result.filter(r => r.severity === "failure");

        await client.query(
            'UPDATE raw_data SET validation_done= \'t\', validation_results=$1, validation_passed=$2 WHERE id=$3',
            [JSON.stringify(result_filtered), (result_filtered.length == 0),  raw_data.id]
        );
    } catch(error) {
        console.error("ERROR validate_raw_data");
        console.error(raw_data.id);
        console.error(error);
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release()
    }

}


export {
  validate_raw_data_all,
};

export default validate_raw_data_all;
