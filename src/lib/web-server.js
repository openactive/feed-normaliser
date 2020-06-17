import express from 'express'
import Settings from './settings.js';

const web_server_app = express()

web_server_app.get('/', (req, res) => {
    res.json(
        { "open_active": "https://github.com/openactive/conformance-services" }
    );
});

async function start_web_server() {
    web_server_app.listen(Settings.webServerPort, () => { console.log("started http://locahost:" + Settings.webServerPort); } );
}

export default start_web_server;
