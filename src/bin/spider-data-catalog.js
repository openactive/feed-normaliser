#!/usr/bin/env node
import spider from '../lib/spider.js';
import Settings from '../lib/settings.js';
import tls from 'tls';

tls.DEFAULT_MIN_VERSION = Settings.tlsDefaultMinimumVersion;

spider(Settings.spiderDataCatalogStartURL);

