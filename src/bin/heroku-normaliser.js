#!/usr/bin/env node
import normalise_data_all_publisher_feeds from '../lib/normalise-data.js';
import profile_normalised_data_all from '../lib/profile-normalised-data.js';
import Settings from '../lib/settings.js';
import tls from 'tls';
import Sentry from '@sentry/node';
import Utils from '../lib/utils.js';

tls.DEFAULT_MIN_VERSION = Settings.tlsDefaultMinimumVersion;


if (process.env.SENTRY_DSN){
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

(async() => {
  while(true){
    try {
      console.log("-- Starting normalise raw data --");
      await normalise_data_all_publisher_feeds();

      console.log("-- Starting profile normalised data --");
      await profile_normalised_data_all();
    } catch (error){
      console.log("An unrecoverable exception occurred:");
      console.log(error);
    } finally {

      console.log("Sleeping zzzz");
      await Utils.sleep("Heroku", 60*60*Settings.herokuWorkerMinimumCycleHours);

    }

  }
})();