#!/usr/bin/env node
import PublisherFeedStats from '../lib/publisher-feed-stats.js';

/*
Usage:
$ node update-publisher-feed-stats.js [publisherID]

If no publisherID specified all publishers will be updated
*/

(async() => {
  if (process.argv[2]){
    await PublisherFeedStats.update(Number(process.argv[2]));
  } else {
    await PublisherFeedStats.updateAll();
  }

  process.exit(0);
})();