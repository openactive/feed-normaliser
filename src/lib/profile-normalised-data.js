import { database_pool } from './database.js';
import Settings from './settings.js';
import apply_data_profile from './util-data-profile.js';



async function profile_normalised_data_all() {
    for(var profile_name of Settings.dataProfiles) {
        // not await - run each profile at once
        profile_normalised_data_all_for_profile(profile_name);
    };
}

async function profile_normalised_data_all_for_profile(profile_name) {

    const select_sql = 'SELECT normalised_data.* FROM normalised_data '+
        'LEFT JOIN normalised_data_profile_results '+
        'ON normalised_data_profile_results.normalised_data_id = normalised_data.id AND normalised_data_profile_results.profile_name=$1 '+
        'WHERE normalised_data_profile_results.normalised_data_id IS NULL AND normalised_data.data_deleted=FALSE '+
        'ORDER BY normalised_data.updated_at ASC LIMIT 10';

    while(true) {

        let rows = []

        // Step 1 - load data to process
        // we open and make sure we CLOSE the database connection after this, so the DB connection is not held open when processing in an unneeded manner
        const client = await database_pool.connect();
        try {
            const res_find_raw_data = await client.query(select_sql, [profile_name]);
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
        } finally {
            client.release()
        }

        // Step 2 - process each item of data we got
        for (var raw_data of rows) {
            await profile_normalised_data_for_item_for_profile(raw_data, profile_name);
        }

    }

}

async function profile_normalised_data_for_item_for_profile(normalised_data, profile_name) {

    //console.log("Profiling Normalised Data id "+ normalised_data.id + " for Profile " + profile_name);

    const results = await apply_data_profile(normalised_data.data, profile_name);

    const client = await database_pool.connect();
    try {
        if (results.done) {
            await client.query(
                "INSERT INTO normalised_data_profile_results (normalised_data_id, profile_name, checked, results) VALUES ($1, $2, TRUE, $3)",
                [normalised_data.id, profile_name, JSON.stringify(results.results)]
            );
        } else {
            await client.query(
                "INSERT INTO normalised_data_profile_results (normalised_data_id, profile_name, checked, error_checking_message) VALUES ($1, $2, FALSE, $3)",
                [normalised_data.id, profile_name, results.error]
            );
        }
    } catch(error) {
        console.error("ERROR profile_normalised_data_for_item_for_profile");
        console.error(error);
    } finally {
        client.release()
    }

}


export {
  profile_normalised_data_all,
};

export default profile_normalised_data_all;
