#!/usr/bin/env node
import { clean_up_database }  from '../lib/database.js';
import Utils from '../lib/utils.js';
import Settings from '../lib/settings.js';

console.log("WARNING: Clean up will delete data older than "+Settings.maxDataAgeDays+" ctrl+c to abort");

(async() => {
  for (let i=3; i != 0; i--){
    await Utils.sleep('clean_up', 1);
    console.log(i);
  }


  await clean_up_database();
  console.log("Clean up complete");
  process.exit(0);
})();

