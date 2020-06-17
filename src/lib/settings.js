const Settings = {
  "spiderDataCatalogStartURL": process.env.SPIDER_DATA_CATALOG_START_URL || 'https://www.openactive.io/data-catalogs/data-catalog-collection.jsonld',

  "postgresURL": process.env.DATABASE_URL || 'postgres://app:app@localhost:5432/app',

  // "PORT" as a env var name seems to match what Heroku wants: https://github.com/heroku/node-js-getting-started/blob/master/index.js#L3
  "webServerPort": process.env.PORT || 8000
}

export default Settings;
