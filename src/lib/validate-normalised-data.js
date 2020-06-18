import { database_pool } from './database.js';
import validator from '@openactive/data-model-validator';

// TODO This will run only one check at a time - add something so it runs several at once!
async function validate_normalised_data_all() {

    const client = await database_pool.connect();
    try {
        //while(true) {
            const res_find_normalised_data = await client.query('SELECT * FROM normalised_data WHERE validation_done = \'f\' AND data_deleted=\'f\' ORDER BY updated_at ASC LIMIT 10');
            //if (res_find_normalised_data.rows.length == 0) {
                //break;
            //}
            for (var normalised_data of res_find_normalised_data.rows) {
                await validate_normalised_data(normalised_data);
            }
        //}
    } catch(error) {
        console.error("ERROR validate_normalised_data_all");
        console.error(error);
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release()
    }

}

async function validate_normalised_data(normalised_data) {

    const result = await validator.validate(normalised_data.data);

    const client = await database_pool.connect();
    try {
        await client.query('UPDATE normalised_data SET validation_done= \'t\', validation_results=$1  WHERE id=$2', [JSON.stringify(result), normalised_data.id]);
    } catch(error) {
        console.error("ERROR validate_normalised_data");
        console.error(normalised_data.id);
        console.error(error);
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release()
    }

}


export {
  validate_normalised_data_all,
};

export default validate_normalised_data_all;
