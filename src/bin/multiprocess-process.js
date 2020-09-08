#!/usr/bin/env node
import Settings from '../lib/settings.js';
import tls from 'tls';
import { downloadPublisherFeedRawData } from '../lib/download-raw.js';
import { validateRawDataForPublisher } from '../lib/validate-raw-data.js';
import { normaliseDataForPublisher } from '../lib/normalise-data.js';

tls.DEFAULT_MIN_VERSION = Settings.tlsDefaultMinimumVersion;

(async() => {

  const publisher = process.argv[2];

  console.log("Running", publisher, process.argv);

  console.log("downloading", publisher, new Date());
  await downloadPublisherFeedRawData(publisher);
  console.log("validating", publisher, new Date());
  await validateRawDataForPublisher(publisher);
  console.log("normalising", publisher, new Date());
  await normaliseDataForPublisher(publisher);

  /* TODO
 - profile normalised data step
 - update stats
 */

  process.exit(0);
})();