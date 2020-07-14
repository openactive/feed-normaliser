import Ajv from 'ajv';
import fs from 'fs';
import Utils from "./utils.js";

async function apply_data_profile(data, data_profile_name) {

    // ---------------------- Load Data Profile Info
    if (!(await does_data_profile_exist(data_profile_name))) {
        return {
            "done": false,
            "error": "Data Profile Does Not Exist"
        };
    }

    return {
            "done": true,
            "results": (await apply_data_profile_to_item_of_data(data, data_profile_name))
        };

    /**
    var ajv = new Ajv();

    const json_schema_string = await fs.promises.readFile('data-profiles/'+data_profile_name+'/Event.json', "utf8");
    const json_schema = JSON.parse(json_schema_string);

    var validate = await ajv.compile(json_schema);
    var valid = await validate(data);
    out.results = validate.errors;

    const sub_json_schema_string = await fs.promises.readFile('data-profiles/'+data_profile_name+'/Place.json', "utf8");
    const sub_json_schema = JSON.parse(sub_json_schema_string);

    var validate_sub = await ajv.compile(sub_json_schema);
    var valid_sub = await validate_sub(data.location);
    for(var r of validate_sub.errors) {
        r.dataPath = "location" + r.dataPath;
        out.results.push(r);
    }


    return out;
    **/

};

async function apply_data_profile_to_item_of_data(data, data_profile_name) {

    let errors = []

    // Step 1: Look for embedded data and separate out
    let embedded_datas = []
    for(var key in data) {
        var key_type = data[key]['@type'];
        console.log(key_type);
        if (key_type && (await does_data_profile_schema_exist(data_profile_name, key_type))) {
            embedded_datas.push({
                'key': key,
                'data': data[key]
            });
            delete data[key];
        }
    }

    // Step 2: Validate the main item
    let type = data['@type'];
    if (await(does_data_profile_schema_exist(data_profile_name, type))) {

        const json_schema_string = await fs.promises.readFile('conformance-profiles/'+data_profile_name+'/'+type+'.json', "utf8");
        const json_schema = await JSON.parse(json_schema_string);

        var validate = await getAjvValidate(data_profile_name, type);
        var valid = await validate(data);
        if (!valid) {
            for(var r of validate.errors) {
                errors.push(r);
            }
        }
        
    }


    // Step 3: For each bit of embeded data, call recursvively and collect errors
    for(var embedded_data of embedded_datas) {
        const embedded_errors = await apply_data_profile_to_item_of_data(embedded_data['data'], data_profile_name);
        for(var embedded_error of embedded_errors) {
            embedded_error['dataPath'] = embedded_data['key'] + '/' + embedded_error['dataPath'];
            errors.push(embedded_error);
        }
    }


    // Step 4: Return results
    return errors;



}

async function getAjvValidate(data_profile_name, type) {
    // we will assume  data_profile_name and type exists and you've already checked that with other functions
    const ajv = new Ajv({allErrors: true});
    // TODO load from an absolute path, not a relative one
    const file_names = fs.readdirSync('conformance-profiles/'+data_profile_name);
    for(var file_name of file_names) {
        if (file_name != 'data-profile.json' && file_name.substring(file_name.length - 5) == '.json' && file_name != type+'.json') {
        const json_schema_string = await fs.promises.readFile('conformance-profiles/'+data_profile_name+'/'+file_name, "utf8");
        const json_schema = await JSON.parse(json_schema_string);
        await ajv.addSchema(json_schema);
      }
    };
    const type_json_schema_string = await fs.promises.readFile('conformance-profiles/'+data_profile_name+'/'+type+'.json', "utf8");
    const type_json_schema = await JSON.parse(type_json_schema_string);
    return await ajv.compile(type_json_schema);
}

async function does_data_profile_exist(data_profile_name) {
    // TODO load from an absolute path, not a relative one
    return await fs.existsSync('conformance-profiles/'+data_profile_name+'/data-profile.json');
}

async function does_data_profile_schema_exist(data_profile_name, schema_name) {
    // TODO load from an absolute path, not a relative one
    return await fs.existsSync('conformance-profiles/'+data_profile_name+'/'+schema_name+'.json');
}

export default apply_data_profile;
