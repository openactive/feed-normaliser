import Ajv from 'ajv';
import fs from 'fs';

async function apply_data_profile(data, data_profile_name) {

    // ---------------------- Load Data Profile Info
    if (!fs.existsSync('data-profiles/'+data_profile_name+'/Event.json')) {
        return {
            "done": false,
            "error": "Data Profile Does Not Exist"
        };
    }

    var out = {
            "done": true,
            "results": []
        };

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

};

export default apply_data_profile;
