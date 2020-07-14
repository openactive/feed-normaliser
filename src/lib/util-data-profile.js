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

    // ---------------------- Load Type Info
    var data_type = data['@type'];
    if (!(await does_data_profile_schema_exist(data_profile_name, data_type))) {
        return {
            "done": false,
            "error": "Type Does Not Exist " + data_type
        };
    }

    // ---------------------- Process
    var validate = await getAjvValidate(data_profile_name, data_type);
    var valid = await validate(data);

    return {
            "done": true,
            "results": validate.errors,
        };

};

async function getAjvValidate(data_profile_name, type) {
    // we will assume  data_profile_name and type exists and you've already checked that with other functions
    // TODO every time it's called, we load a lot from disk. Can we cache result anywhere in a "Thread"-safe manner?
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
