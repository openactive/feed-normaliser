# Normalisation

The tool will normalise raw data by passing it through a series of pipes. See the [Normalisation Overview](pipeline-overview.md) for more information.

After all pipes are called, the resulting normalised data is saved to the database, in the `normalised_data` table.

Deletes are soft deletes, marked by the `data_deleted` column in the table.

To run this:

`$ node ./src/bin/normalise-data.js`

It can be stopped at any time and it will not leave the database in a bad state. Only records being processed at that particular moment in time would be lost.

When restarted it will pick up where it left off.

## Errors

If an error occurs for a specific piece of normalised data, it can be found in the `normalisation_errors` column of the `normalised_data` table.

If an crash occurs in a pipe, it can be found in the `normalisation_errors` column of the `raw_data` table.

## Clear out work already done \(Database storage\)

There are 2 options here:

* Totally delete all normalised data from the database
* Soft-delete all normalised data from the database but leave behind meta data

Crucially the first option will "break" the RPDE feeds, because we will not send delete flags for any update data we sent previously. The second option will not do this but will not reduce database rows in use and will mean the RPDE feed may send many delete flags. Which option is best depends on your circumstances.

### Totally delete all normalised data from the database

Before doing this, you will need to [clear out all Normalised Profile data](../profile-normalised-data.md)

Run the SQL:

```text
DELETE FROM normalised_data;
UPDATE raw_data SET normalised=FALSE, normalisation_errors=NULL;
```

### Soft-delete all normalised data from the database but leave behind meta data

Before doing this, you will need to [clear out all Normalised Profile data](../profile-normalised-data.md)

Run the SQL:

```text
UPDATE normalised_data SET data_deleted=TRUE, data=NULL;
UPDATE raw_data SET normalised=FALSE;
```

## To only normalise a limited set of data

You may want to do this to avoid processing too much data. Or to debug a problem that occurs with a specific publisher's data, you may want to process data for that publisher only.

### Stop the process early

The process can be forcibly stopped at any point and the database will not be in a bad state. It will contain most work done up to the point you stop it.

### Edit the SQL query that determines data to normalise

If you only want to get data for some or one publisher feed, you can edit the SQL statement in `src/lib/normalise-data.js`.

In the `normalise_data_all_publisher_feeds` function there is a `SELECT` statement - simply add a `WHERE` clause and an appropriate filter.

