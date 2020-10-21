# Generated Stats/Metrics

The executable `update-publisher-feed-stats.js` uses the `publisher-feed-stats` module to generate stats about the data in a particular publisher's feed.

It is recommended that `update-publisher-feed-stats.js` is run on scheduled basis of once per hour. The stats are stored in the `publisher_feed` table for quick retrieval (rather than generated on the fly).

## Validation Passing

Validation passing is the percentage of raw data items in a publisher's feed which are passing validation. The validator used is the OpenActive [data-model-validator](https://github.com/openactive/data-model-validator). This does not included items which are marked as deleted.

### Example

validation_result = (total_number_passing_validation / total_validated) * 100

## Normalised Data Profile Results

Profile results looks at the normalised data that is produced and validates it against the schemas that are listed in `settings.dataProfiles`, the default values are `core` `accessibility` and `socialrx`. The schemas are found in the `conformance-profiles` directory which is a git submodule of [conformance-profiles](https://github.com/openactive/conformance-profiles/).

This validation process produces a list of errors for each `normalised data` item. To generate a single value for each of the publisher feeds, all the errors are counted and the fraction of errors to the total `normalised data` with that the profile is calculated. This also does not include items marked as deleted.

### Example

core_result = round ((total_number_of_errors_for_core_data_0 + total_number_of_errors_for_core_data_1 + ...) / total_number_core_items_checked)