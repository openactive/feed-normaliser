# Requirements and Install

## Node

These tools are developed and tested using `node` version `13.9`

## Install

`$ npm install`

## Database connection

The supported database server is Postgres.

The database connection can be specified using the environment variable `DATABASE_URL`

`$ export DATABASE_URL=postgres://user:pass@host:port/database`

The default value is `postgres://app:app@localhost:5432/app`. See src/lib/settings.py.

## Migrate database

The tool will automatically set up the Postgres database structure.

`$ node ./src/bin/migrate-database.js`


## Configuration tweaks

The validation, normalise data and profile normalised data processes run on defined chunks of data called Load Limits. This is in order to scale the service to the available memory.
To set these values use the following environment variables.

* `NORMALISE_LOAD_LIMIT` (default: 1000)
* `PROFILE_NORMALISED_LOAD_LIMIT` (default: 1000)
* `VALIDATOR_LOAD_LIMIT` (default: 1000)