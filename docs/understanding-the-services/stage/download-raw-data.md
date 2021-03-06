# Harvesting

The tool will download source data from all feed end points and store it in the `raw_data` table.

It will only download new data when re-run. It stores state of how far it got in `raw_next_url` column of `publisher_feed` table.

[Deletes](https://www.w3.org/2017/08/realtime-paged-data-exchange/#deleted-items) are soft deletes, marked by the `data_deleted` column in the table.

To run this:

`$ node ./src/bin/download-raw.js`

It can be stopped at any time and it will not leave the database in a bad state. Only records being processed at that particular moment in time would be lost.

When restarted it will pick up where it left off.

## Errors

Any errors encountered during this stage will be stored in the `download_raw_errors` table.

* `url` - Where the error occurred
* `error` - What the error was
* `publisher_feed_id` - The publisher feed we were fetching when we had an error
* `error_at` - What date and time the error occurred

## Clear out work already done \(Database storage\)

Before doing this, you will:

* need to [clear out all Normalised Profile data](profile-normalised-data.md)
* need to [Totally delete all normalised data from the database](normalise-data/)

Run the SQL:

```text
DELETE FROM raw_data;
DELETE FROM download_raw_errors;
UPDATE publisher_feed SET raw_next_url=NULL;
```

## To only download a limited set of raw data

You may want to do this to avoid processing too much data. Or to debug a problem that occurs with a specific publisher's data, you may want to get data for that publisher only.

### Stop the process early

The process can be forcibly stopped at any point and the database will not be in a bad state. It will contain most work done up to the point you stop it.

### Edit the SQL query that determines data to download

If you only want to get data for some or one publisher feed, you can edit the SQL statement in `src/lib/download-raw.js`.

In the `download_raw_all_publisher_feeds` function there is a `SELECT` statement - simply add a `WHERE` clause and an appropriate filter.

