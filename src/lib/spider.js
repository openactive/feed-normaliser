import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { database_pool } from './database.js';
import Settings from './settings.js';
import Utils from './utils.js';

async function spider(start_url) {


    spider_data_catalog(start_url, []);


}


async function spider_data_catalog(url, url_history) {
    try {
        let res = await fetch(url);
        if (!res.ok) {
            throw res.status + " - " + res.statusText;
        }
        let json = await res.json();
        let new_url_history = [...url_history];
        new_url_history.push(url);

        if ('hasPart' in json && Array.isArray(json['hasPart'])) {
            for (var idx in json['hasPart']) {
                if (Settings.sleepWhileSpiderDataCatalogSeconds > 0) {
                    await Utils.sleep("spider_data_catalog", Settings.sleepWhileSpiderDataCatalogSeconds);
                }
                // not await - we want several spidering operations to run at once.
                spider_data_catalog(json['hasPart'][idx], new_url_history);
            }
        }

        if ('dataset' in json && Array.isArray(json['dataset'])) {
            for (var idx in json['dataset']) {
                if (Settings.sleepWhileSpiderDataCatalogSeconds > 0) {
                    await Utils.sleep("spider_data_catalog", Settings.sleepWhileSpiderDataCatalogSeconds);
                }
                // not await - we want several spidering operations to run at once.
                spider_data_set(json['dataset'][idx], new_url_history);
            }
        }
    } catch(error) {
        console.error("ERROR spider_data_catalog");
        console.error(url_history);
        console.error(url);
        console.error(error);
    }

}

async function spider_data_set(url, url_history) {
    try {

        let res = await fetch(url);
        if (!res.ok) {
            throw res.status + " - " + res.statusText;
        }
        let text = await res.text();
        let $ = await cheerio.load(text);
        let json_ld = $('script[type="application/ld+json"]').html();
        let json = JSON.parse(json_ld);

        let out = {
            'url': json['url'],
            'name': json['name'],
            'data': json,
            'data_urls': []
        }

         if ('distribution' in json && Array.isArray(json['distribution'])) {
            for (var idx in json['distribution']) {
                out['data_urls'].push({'name':json['distribution'][idx]['name'], 'url':json['distribution'][idx]['contentUrl']});
            }
        }

        await write_publisher(out);
    } catch(error) {
        console.error("ERROR spider_data_set");
        console.error(url_history);
        console.error(url);
        console.error(error);
    }
}

async function write_publisher(data) {
    const client = await database_pool.connect();
    try {
        // Publisher
        const res_find_publisher = await client.query('SELECT * FROM publisher WHERE url = $1', [data.url]);
        let publisher_id;
        if (res_find_publisher.rowCount == 0) {
            const res_add_publisher = await client.query(
                'INSERT INTO publisher (name, url, data) VALUES ($1, $2, $3) RETURNING id',
                [data.name, data.url, data.data]
            );
            publisher_id = res_add_publisher.rows[0].id;
        } else {
            publisher_id = res_find_publisher.rows[0].id;
            const res_add_publisher = await client.query(
                'UPDATE publisher SET name=$1, url=$2, data=$3 WHERE id=$4',
                [data.name, data.url, data.data, publisher_id]
            );
        }
        // TODO store url_history for debugging purposes to
        // Publisher Feed
        for (var idx in data.data_urls) {
            const res_find_feed = await client.query('SELECT * FROM publisher_feed WHERE url = $1', [data.data_urls[idx].url]);
            if (res_find_feed.rowCount == 0) {
                const res_add_feed = await client.query('INSERT INTO publisher_feed (publisher_id, name, url) VALUES ($1, $2, $3) RETURNING id', [publisher_id, data.data_urls[idx].name, data.data_urls[idx].url]);
            }
        }

    } catch(error) {
        console.error("ERROR write_publisher");
        console.error(data);
        console.error(error);

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release()
    }

};

export {
  spider,
  spider_data_catalog,
  spider_data_set,
};

export default spider;