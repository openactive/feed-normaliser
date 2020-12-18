# Spidering

The Spidering stage will automatically discover all feed end points by starting at [https://www.openactive.io/data-catalogs/data-catalog-collection.jsonld](https://www.openactive.io/data-catalogs/data-catalog-collection.jsonld) \(hard-coded\) and working through DataCatalogs.

It will store the results of this in the `publisher` and `publisher_feed` tables.

To run this:

`$ node ./src/bin/spider-data-catalog.js`

It can be stopped at any time and it will not leave the database in a bad state. Only records being processed at that particular moment in time would be lost.

When restarted, it will always start at the beginning again; there's no way to pause it.

## Errors

Any errors encountered during this stage will be stored in the `spider_data_catalog_error` table.

* `url` - Where the error occurred
* `error` - What the error was
* `found_via` - How we got to this URL. Which data catalogs did we go through to find this URL?
* `error_at` - What date and time the error occurred

## Starting Over \(development\)

Note: these instructions remove all data relating to this application from the database. If you've not got any other data in the database and you're comfortable removing and recreating the database, then that's likely to be quicker. If not, however, then proceed.

Before doing this, if you've run other stage of the pipeline, you will:

* need to [clear out all Normalised Profile data](profile-normalised-data.md)
* need to [Totally delete all normalised data from the database](normalise-data/)
* need to [clear out all raw data](download-raw-data.md)

Then, run the SQL:

```text
DELETE FROM publisher_feed;
DELETE FROM publisher;
DELETE FROM spider_data_catalog_error;
```

