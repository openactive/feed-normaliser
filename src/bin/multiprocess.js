#!/usr/bin/env node
import spider from '../lib/spider.js';
import Settings from '../lib/settings.js';
import tls from 'tls';
import Utils from '../lib/utils.js';
import { database_pool } from '../lib/database.js';
import  { spawn }  from 'child_process';

tls.DEFAULT_MIN_VERSION = Settings.tlsDefaultMinimumVersion;


(async() => {

  console.log("-- Starting spider --");
  await spider(Settings.spiderDataCatalogStartURL);
  console.log("-- Done spider --");


  const client = await database_pool.connect();
  let publishers;

  if (process.argv[2]){
    publishers = await client.query('SELECT id FROM publisher ORDER BY ID DESC LIMIT $1', [process.argv[2]]);
  } else {
    publishers = await client.query('SELECT id FROM publisher');
  }

  /* 1 process per publisher */
  await runPublisherProcesses(publishers.rows);

  process.exit(0);
})();


async function runPublisherProcesses(publishers){
  let running = 0;
  const max = 4;

  for (let publisher of publishers) {
    while(running > max){
      await Utils.sleep("wait for space", 1);
    }

    console.log("Process started", publisher.id, running);
      running++;
      let process = spawn(`node`, ['./src/bin/multiprocess-process.js', publisher.id], { stdio: 'inherit', detached: false });
      process.on('close', (data) => {
        console.log('Process finished exit:', data);
        running--;
      });
  }
  return;
}