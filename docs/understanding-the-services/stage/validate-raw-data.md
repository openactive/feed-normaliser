# Validation

This will validate the raw data using the [standard library](https://github.com/openactive/conformance-services/tree/b7204679bf73fb142557be8698afdd461af44de6/openactive/data-model-validator/README.md).

It will only pay attention to errors of `severity` == `failure`. All other errors of lesser severity are discarded.

It will save the results back in the database in the`raw_data` table.

* `validation_done`- Boolean; has this data been validated?
* `validation_results`  - JSON - contains details of the errors, if there were any.
* `validation_passed` - Boolean; did validation pass?

  Although this can be calculated by checking `validation_done` and the JSON in `validation_results` , storing this this makes it very easy to calculate statistics.

Every time a piece of raw data is updated or deleted by a publisher's RPDE feed, these variables are reset. In this way the validation results in those columns:

* Are always for the latest data.
* Will be recalculated every time a piece of data changes.

To run this:

`$ node ./src/bin/validate-raw-data.js`

It can be stopped at any time and it will not leave the database in a bad state. Only records being processed at that particular moment in time would be lost.

When restarted it will pick up where it left off.

## Clear out work already done \(Database storage\)

To clear out all work already done, you can run the SQL:

```text
UPDATE raw_data SET validation_done=FALSE, validation_passed=FALSE, validation_results=NULL;
```

This will leave all raw data still in the database, but will clear all data around validating that data.

## To only validate a limited set of data

### Stop the process early

The process can be forcibly stopped at any point and the database will not be in a bad state. It will contain most work done up to the point you stop it.

