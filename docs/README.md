# Open Active Conformance Services

Various tools for harvesting and normalising OpenActive Opportunity feeds to a common representation

See the [docs](/docs/) folder for more information.

## Quick Start

### Configuration

Environment variable

`DATABASE_URL=postgres://user:pass@host:port/database`



### Install

```
$ npm install
$ npm run migrate
```

[Installation docs](/docs/requirements-and-install.md)


### Data tools

* `$ node ./src/bin/spider-data-catalog.js` [Fetch feeds](/docs/stage/spider-data-catalog.md)
* `$ node ./src/bin/download-raw.js` [Download raw data](/docs/stage/download-raw-data.md)
* `$ node ./src/bin/validate-raw-data.js` [Validate Raw data](/docs/stage/validate-raw-data.md)
* `$ node ./src/bin/normalise-data.js` [Create normalised version of raw data](/docs/stage/normalise-data.md)
* `$ node ./src/bin/profile-normalised-data.js` [Profile normalised data](/docs/stage/profile-normalised-data.md)


### Webserver

* `$ npm run start-webserver` Runs webserver providing JSON output of certain data for use by [status](https://github.com/openactive/conformance-status-page)