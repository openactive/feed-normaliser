# Download Raw Data

The tool will download raw data from all feed end points and store it in the `raw_data` table.

It will only download new data when re-run. It stores state of how far it got in `raw_next_url` column of `publisher_feed` table.

Deletes are soft deletes, marked by the `data_deleted` column in the table.

To run this:

`$ node ./src/bin/download-raw.js`


## Errors

Any errors encountered during this stage will be stored in the `download_raw_errors` table.

* `url` - Where the error occurred
* `error` - What the error was
* `publisher_feed_id` - The publisher feed we were fetching when we had an error
* `error_at` - What date and time the error occurred

## Clear out work already done (Database storage)

Before doing this, you will:

* [need to clear out all Normalised Profile data](profile-normalised-data.md)
* [need to Totally delete all normalised data from the database](normalise-data.md)

Run the SQL:

    DELETE FROM raw_data;
    DELETE FROM download_raw_errors;
    UPDATE publisher_feed SET raw_next_url=NULL;
    
