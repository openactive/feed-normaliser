#!/usr/bin/env node
import spider from '../lib/spider.js';
import download_raw_all_publisher_feeds from '../lib/download-raw.js';
import Settings from '../lib/settings.js';
import tls from 'tls';
import Sentry from '@sentry/node';
import Utils from '../lib/utils.js';

tls.DEFAULT_MIN_VERSION = Settings.tlsDefaultMinimumVersion;

/* This heroku worker is intended as to be scheduled */

if (process.env.SENTRY_DSN){
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

(async() => {
  while(true){
    try {
      console.log("-- Starting spider --");
      await spider(Settings.spiderDataCatalogStartURL);
      console.log("-- Done spider --");

      console.log("-- Starting download raw data --");
      await download_raw_all_publisher_feeds();

    } catch (error) {
      console.log("An unrecoverable error occurred:");
      console.log(error);
    } finally {

      console.log("Sleeping zzzz");
      await Utils.sleep("Heroku", 60*60*Settings.herokuWorkerMinimumCycleHours);

    }

  }
})();
