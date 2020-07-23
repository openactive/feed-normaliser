# Validate Raw Data

This will validate the raw data using the standard https://github.com/openactive/data-model-validator library.

It will only pay attention to errors of `severity` == `failure`. All other errors of lesser severity are just discarded.

It will save the results back in the database in the`raw_data` table. 

* `validation_done`- Boolean; has this data been validated?
* `validation_results`  - JSON - contains details on the errors, if there were any.
* `validation_passed` - Boolean; did validation pass? 
   Technically this can be calculated by checking `validation_done` and the JSON in `validation_results` but this makes it very easy to calculate statistics.

Every time a piece of raw data is updated or deleted by a publisher's RPDE feed, these variables are reset. In this way the validation results in those columns:

* Are always for the latest data.
* Will be recalculated every time a piece of data changes.

To run this:

`$ node ./src/bin/validate-raw-data.js`

## Clear out work already done (Database storage)

To clear out all work already done, you can run the SQL:

    UPDATE raw_data SET validation_done=FALSE, validation_passed=FALSE, validation_results=NULL;

This will leave all raw data still in the database, but will clear all data around validating that data.

