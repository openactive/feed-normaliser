#!/usr/bin/env node
import PublisherFeedStats from '../lib/publisher-feed-stats.js';
import Settings from '../lib/settings.js';
import tls from 'tls';
import Sentry from '@sentry/node';


tls.DEFAULT_MIN_VERSION = Settings.tlsDefaultMinimumVersion;

/* This heroku worker is intended as to be scheduled */

if (process.env.SENTRY_DSN){
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

console.log("-- Updating feed stats --");
PublisherFeedStats.updateAll();