import express from 'express'
import Settings from './settings.js';
import RPDEQuery from './web-rpde-query.js';
import PublisherStatus from './web-publisher-status.js';
import PublisherInfo from './web-publisher-info.js';

const web_server_app = express()

function internalServerError(res){
    return res.status(500).send({ message: "Internal Server Error"});
}

web_server_app.get('/', (req, res) => {
    res.json(
        { "open_active": "https://github.com/openactive/conformance-services" }
    );
});

web_server_app.get('/publishers/status', async (req, res) => {
    const latestInfo = await PublisherStatus.getLatestInfo();

    if (latestInfo === false){
        return internalServerError(res);
    }

    res.json(
      {
        "publishers": latestInfo,
      }
    );
});

web_server_app.get('/publisher/:publisherId', async (req, res) => {
    const publisherInfo = await PublisherInfo.getInfo(req.params.publisherId);
    if (publisherInfo === undefined){
        return res.status(404).send({ message: "Publisher Not Found"});
    }

    if (publisherInfo === false){
        return internalServerError(res);
    }

    res.json(publisherInfo);
});

web_server_app.get('/normalised_data/all', async (req, res) => {
    const query = new RPDEQuery(req.query.afterTimestamp, req.query.afterId, req.query.limit)
    const out = await query.run_and_get_api_response("/normalised_data/all");
    res.json(out);
});

async function start_web_server() {
    web_server_app.listen(Settings.webServerPort, () => { console.log("started http://localhost:" + Settings.webServerPort); } );
}

export default start_web_server;
