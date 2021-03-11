#!/usr/bin/env node
import { clean_up_database }  from '../lib/database.js';
import Utils from '../lib/utils.js';
import Settings from '../lib/settings.js';

console.log("WARNING: Clean up will delete data older than "+Settings.maxDataAgeDays+" days ctrl+c to abort");
if (process.argv[2] && process.argv[2] == "all"){
  console.log("This will include data not yet marked as DELETED by publishers");
}

(async() => {
  for (let i=3; i != 0; i--){
    await Utils.sleep('clean_up', 1);
    console.log(i);
  }

  if (process.argv[2] && process.argv[2] == "all"){
    await clean_up_database(false);
  } else {
    await clean_up_database(true);
  }

  console.log("Clean up complete");
  process.exit(0);
})();

