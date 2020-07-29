# Dev hosting with Docker

The Dockerfile and docker-compose are configured for development purposes only, not intended for use in production.

## Setup

Run:

`$ docker-compose build`

Then to migrate databases:

`$ docker-compose run app node /home/app/src/bin/migrate-database.js`

## Run commands or NPM

To run any of the other app commands:

```text
$ docker-compose run -l openactive-conformance-services-type=run -w /home/app app node ./src/bin/spider-data-catalog.js
$ docker-compose run -l openactive-conformance-services-type=run -w /home/app app node ./src/bin/download-raw.js
// etc.
```

For NPM:

```text
$ docker-compose run -l openactive-conformance-services-type=run -w /home/app app npm install
// etc.
```

## Database

To access the database with psql:

```text
$ docker-compose exec postgres psql -U app -h postgres
$ // (password is 'app')
```

Database will persist between container restarts/rebuilds.

## Run Webserver

Run

`$ docker-compose run -l openactive-conformance-services-type=run -w /home/app -p 3000:3000 app npm run start-webserver-dev`

The API should be available at "localhost:3000".

It will reload automatically when you make changes.

It will stay attached to the console and any output will be visible.

Use CTRL+C to stop it.

## Tests

To set up, open a database console and run:

`app=# create database test;`

Then run database tests at any time with:

`$ docker-compose run -l openactive-conformance-services-type=run -w /home/app -e DATABASE_URL="postgres://app:app@postgres:5432/test" app npm run test`

## Cleaning up Docker

Because we label containers when we run things, we can clean up old containers with:

`$ docker container prune --filter label=openactive-conformance-services-type=run`

