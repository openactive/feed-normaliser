# Spider Data Catalog

The tool will automatically discover all feed end points by starting at https://www.openactive.io/data-catalogs/data-catalog-collection.jsonld and working through DataCatalogs.

It will store the results of this in the `publisher` and `publisher_feed` tables.

To run this:

`$ node ./src/bin/spider-data-catalog.js`


## Errors

Any errors encountered during this stage will be stored in the `spider_data_catalog_error` table.

* `url` - Where the error occurred
* `error` - What the error was
* `found_via` - How we got to this URL. Which data catalogs did we go throught to find this URL?
* `error_at` - What date and time the error occurred
