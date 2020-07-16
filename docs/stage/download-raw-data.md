# Download Raw Data

The tool will download raw data from all feed end points and store it in the `raw_data` table.

It will only download new data when re-run. It stores state of how far it got in `raw_next_url` column of `publisher_feed` table.

Deletes are soft deletes, marked by the `data_deleted` column in the table.

To run this:

`$ node ./src/bin/download-raw.js`
