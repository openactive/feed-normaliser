import path from 'path';

const Settings = {
  "spiderDataCatalogStartURL": process.env.SPIDER_DATA_CATALOG_START_URL || 'https://www.openactive.io/data-catalogs/data-catalog-collection.jsonld',

  "postgresURL": process.env.DATABASE_URL || 'postgres://app:app@localhost:5432/app',

  // "PORT" as a env var name seems to match what Heroku wants: https://github.com/heroku/node-js-getting-started/blob/master/index.js#L3
  "webServerPort": process.env.PORT || 8000,

  "rpdeDefaultLimit": 500,

  // This is to deal with the race condition described at https://developer.openactive.io/publishing-data/data-feeds/implementing-rpde-feeds#transactions-preventing-delayed-item-interleaving
  "rpdeDontServeDataUntilSecondsOld": 5,

  // sleep is a crude solution to avoid rate limiting
  "sleepWhileSpiderDataCatalogSeconds": 2,
  "sleepWhileDownloadRawSeconds": 1,

  // this is in cwd() and not /tmp so it works well on Heroku
  "dataModelValidatorRemoteJsonCachePath": path.join(process.cwd(), 'dataModelValidatorRemoteJsonCache'),

  // context URLs
  "contextUrl": "https://openactive.io/",
  "betaContextUrl": "https://openactive.io/ns-beta/",
  "contextJsonld": "https://www.openactive.io/ns/oa.jsonld",
  "betaContextJsonld": "https://www.openactive.io/ns-beta/oa.jsonld",

  // TLS Setting
  // Some publishers may only support older versions
  "tlsDefaultMinimumVersion": "TLSv1",

  "herokuWorkerMinimumCycleHours": 6,

  "dataProfiles": ["core", "accessibility", "socialrx"]

}

export default Settings;
