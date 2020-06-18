# Open Active Conformance Services

Various tools for harvesting and normalising OpenActive Opportunity feeds to a common representation

These tools are developed and tested using `node` version `13.9`

## Install

`$ npm install`

## Database connection

The supported database server is Postgresql.

The database connection can be specified using the environment variable `DATABASE_URL`

`$ export DATABASE_URL=postgres://user:pass@host:port/database`

The default value is `postgres://app:app@localhost:5432/app`. See src/lib/settings.py.

## Stages

### Migrate database

The tool will automatically set up the Postgres database structure.

`$ node ./src/bin/migrate-database.js`

### Spider Data Catalog

The tool will automatically discover all feed end points by starting at https://www.openactive.io/data-catalogs/data-catalog-collection.jsonld and working through DataCatalogs.

It will store the results of this in the `publisher` and `publisher_feed` tables.

To run this:

`$ node ./src/bin/spider-data-catalog.js`

### Download Raw Data

The tool will download raw data from all feed end points and store it in the `raw_data` table.

It will only download new data when re-run. It stores state of how far it got in `raw_next_url` column of `publisher_feed` table.

Deletes are soft deletes, marked by the `data_deleted` column in the table.

To run this:

`$ node ./src/bin/download-raw.js`

### Normalise Data

The tool will normalise raw data by passing it through a series of pipes.

Pipes are called in the order defined in `src/lib/pipes/index.js` and are called once for each bit of raw data.

Before the first pipe is called, there is an array of normalised data which is empty.
Each pipe has access to the original data and the normalised data created so far.
Each pipe can delete, edit or create normalised data as it wants.
After all pipe are called, whatever normalised data is left is saved to the database.

The normalised data is stored in the `normalised_data` table.

Deletes are soft deletes, marked by the `data_deleted` column in the table.

To run this:

`$ node ./src/bin/normalise-data.js`

### Provide APIs

There is a webserver that provides data as API's.

To run this:

`$ node ./src/bin/web-server.js`

RPDE APIs are meant to be called directly by users. They are:

* `/normalised_data/all` - call to get all processed data in system. 

## Docker for development

The Dockerfile and docker-compose are configured for development purposes only, not intended for use in production.

Run:

`$ docker-compose build`

Then to migrate databases:

`$ docker-compose run app node /home/app/src/bin/migrate-database.js`

And any of the other app commands:

```
$ docker-compose run app node /home/app/src/bin/spider-data-catalog.js
$ docker-compose run app node /home/app/src/bin/download-raw.js
// etc.
```

To access the database with psql:

```
$ docker-compose exec postgres psql -U app -h postgres
$ // (password is 'app')
```

Database will persist between container restarts/rebuilds.

The web application starts with `docker-compose up -d`. The API should be available at "localhost:3000".