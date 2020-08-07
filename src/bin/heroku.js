#!/usr/bin/env node
import spider from '../lib/spider.js';
import download_raw_all_publisher_feeds from '../lib/download-raw.js';
import normalise_data_all_publisher_feeds from '../lib/normalise-data.js';
import validate_raw_data_all from '../lib/validate-raw-data.js';
import profile_normalised_data_all from '../lib/profile-normalised-data.js';
import PublisherFeedStats from '../lib/publisher-feed-stats.js';
import Settings from '../lib/settings.js';
import tls from 'tls';
import Utils from '../lib/utils.js';

tls.DEFAULT_MIN_VERSION = Settings.tlsDefaultMinimumVersion;

// This Script Runs on Heroku!

// Heroku will restart this script every 24-28ish hours: https://devcenter.heroku.com/articles/dynos#restarting
// This means we can start all our work processes and not worry about stopping them ourselves - Heroku will do that for us!
// So lets start all processes:


(async() => {
  console.log("-- Starting spider --");
  await spider(Settings.spiderDataCatalogStartURL);
  console.log("-- Done spider --");

  console.log("-- Starting download raw data --");
  await download_raw_all_publisher_feeds();
  console.log("-- Done download raw data --");

  console.log("-- Starting validate raw data --");
  await validate_raw_data_all();
  console.log("-- Done validate raw data --");

  console.log("-- Starting normalise raw data --");
  await normalise_data_all_publisher_feeds();
  console.log("-- Done normalise raw data --");

  console.log("-- Starting profile normalised data --");
  await profile_normalised_data_all();
  console.log("-- Done profile normalised data --");

  console.log("-- Starting updating feed stats --");
  await PublisherFeedStats.updateAll();
  console.log("-- Done updating feed stats --");


  // When a Heroku worker ends, Heroku starts a new one. https://devcenter.heroku.com/articles/dynos#restarting
  // When there is no work to be done, we don't want the worker to be constantly checking as the worker starts, ends, starts, ends, etc in a loop
  // So sleep, so that when there is no work to do we at least only check every X hours
  Utils.sleep("Heroku", 60*60*Settings.herokuWorkerMinimumCycleHours);


  process.exit(0);
})();