#!/usr/bin/env node
import spider from '../lib/spider.js';
import download_raw_all_publisher_feeds from '../lib/download-raw.js';
import Settings from '../lib/settings.js';
import tls from 'tls';
import Sentry from '@sentry/node';


tls.DEFAULT_MIN_VERSION = Settings.tlsDefaultMinimumVersion;

/* This heroku worker is intended as to be scheduled */

if (process.env.SENTRY_DSN){
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

(async() => {

  console.log("-- Starting spider --");
  await spider(Settings.spiderDataCatalogStartURL);
  console.log("-- Done spider --");

  console.log("-- Starting download raw data --");
  await download_raw_all_publisher_feeds();
  console.log("-- Done download raw data --");

  process.exit(0);
})();