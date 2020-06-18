import express from 'express'
import Settings from './settings.js';
import RPDEQuery from './web-rpde-query.js';

const web_server_app = express()

web_server_app.get('/', (req, res) => {
    res.json(
        { "open_active": "https://github.com/openactive/conformance-services" }
    );
});

web_server_app.get('/normalised_data/all', async (req, res) => {
    const query = new RPDEQuery(req.query.afterTimestamp, req.query.afterId, req.query.limit)
    await query.run();
    res.json(
        {
            "next": "/normalised_data/all?" + query.get_next_get_params_string(),
            "items": query.get_data()
        }
    );
});

async function start_web_server() {
    web_server_app.listen(Settings.webServerPort, () => { console.log("started http://locahost:" + Settings.webServerPort); } );
}

export default start_web_server;
