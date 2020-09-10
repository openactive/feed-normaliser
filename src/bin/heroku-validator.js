#!/usr/bin/env node
import validate_raw_data_all from '../lib/validate-raw-data.js';
import Settings from '../lib/settings.js';
import tls from 'tls';
import Utils from '../lib/utils.js';
import Sentry from '@sentry/node';


tls.DEFAULT_MIN_VERSION = Settings.tlsDefaultMinimumVersion;

if (process.env.SENTRY_DSN){
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

console.log("-- Starting validate raw data --");
validate_raw_data_all();

Utils.sleep("Heroku", 60*60*Settings.herokuWorkerMinimumCycleHours);