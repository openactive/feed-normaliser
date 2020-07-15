#!/usr/bin/env node
import spider from '../lib/spider.js';
import Settings from '../lib/settings.js';

spider(Settings.spiderDataCatalogStartURL);

