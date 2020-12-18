# How-to: Get data from only some publishers

If you're debugging an issue with a particular publisher, or are building an application that only needs data from some publishers, or simply want to work with a smaller amount of data during development, then you can work with data from just a few \(or just one!\) publisher.

There are two ways to do this: deleting entries, or providing your own DataCatalog file.

## Delete entries

First, run this stage as normal.

Then from the `publisher` and `publisher_feed` database tables, delete the entries you don't want.

Then, run all other stages as normal.

Note: if you are running on Heroku, the worker will try to download the catalog again and put back the entries you just deleted. You will need to edit the `src/bin/heroku.js` file and take out the call to the `spider()` function.

## Provide your own Data Catalog file

This process starts with a [data catalog](https://openactive.io/data-catalogs/) file, and finds all publishers from there.

If you want to only process some publishers, you can provide your own data catalog file.

You will need to put it online somewhere and then change the `spiderDataCatalogStartURL` setting to your new URL. \(See `src/lib/settings.js` - you can also set an environmental variable\).

Then, run all other stages as normal.

