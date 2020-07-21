#!/usr/bin/env node
import download_raw_all_publisher_feeds from '../lib/download-raw.js';
import Settings from '../lib/settings.js';
import tls from 'tls';

tls.DEFAULT_MIN_VERSION = Settings.tlsDefaultMinimumVersion;

download_raw_all_publisher_feeds();

