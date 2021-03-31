# Open Active Conformance Services

A suite of tools to discover, download, normalise, enhance and republish data that uses the OpenActive specification.

## Quick Start

### Prepare

Set up a Postgres database and user. Record the details.

These instructions assume Linux.

### Configuration

Set environment variable:

`DATABASE_URL=postgres://user:pass@host:port/database`

### Install

```text
$ npm install
$ npm run migrate
```

### Data tools

Run each of these in turn to run the full pipeline. See

* `$ node ./src/bin/spider-data-catalog.js` [Fetch feeds](understanding-the-services/stage/spider-data-catalog.md)
* `$ node ./src/bin/download-raw.js` [Download raw data](understanding-the-services/stage/download-raw-data.md)
* `$ node ./src/bin/validate-raw-data.js` [Validate Raw data](understanding-the-services/stage/validate-raw-data.md)
* `$ node ./src/bin/normalise-data.js` [Create normalised version of raw data](understanding-the-services/stage/normalise-data/)
* `$ node ./src/bin/profile-normalised-data.js` [Profile normalised data](understanding-the-services/stage/profile-normalised-data.md)  \(make sure the git submodule [conformance-profiles](https://github.com/openactive/conformance-profiles) is up to date before running this\)

### Webserver

* `$ npm run start-webserver` Runs webserver providing JSON output of certain data for use by [status](https://github.com/openactive/conformance-status-page)

## Running the tests

**Note : Tests are destructive to any existing data. Create a dedicated database before running them.**

To run the tests:

`$ DATABASE_URL=postgres://test:test@localhost/testing ./node_modules/mocha/bin/mocha`