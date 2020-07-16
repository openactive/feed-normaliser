# Spider Data Catalog

The tool will automatically discover all feed end points by starting at https://www.openactive.io/data-catalogs/data-catalog-collection.jsonld and working through DataCatalogs.

It will store the results of this in the `publisher` and `publisher_feed` tables.

To run this:

`$ node ./src/bin/spider-data-catalog.js`
