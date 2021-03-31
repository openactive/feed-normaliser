# Maintaining the database

## Migrating the data database

Migrations for the database schema can be applied using `migrate-database.js`

## Deleting old data

There is a utility called `clean-up-database.js` this will delete all data from the raw_data table that has been deleted by the publisher and is older than the current value in environment variable `MAX_DATA_AGE_DAYS`, by default this is set to 14 days.

The database is set up so that these deletes will cascade e.g. A normalised event item which is from a raw data item will be deleted if the raw data item is deleted.

It is recommended that `clean-up-database.js` is scheduled to run once a day.

To include data that has not been marked by it's publisher's RPDE feed as "DELETED" use `clean-up-database.js all`
