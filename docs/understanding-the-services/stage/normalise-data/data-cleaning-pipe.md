# Data cleaning pipe

The Cleaning pipe should run after the Normalisation pipes but before the Enhancement pipes, and operates on the NormalisedEvents rather than the raw data.

The reason we do this as a separate pipe at the end, on the NormalisedEvents, is so we don't waste energy validating and fixing raw data that doesn't actually get used at the end. It's a tradeoff though, because in some cases we end up with several (to hundreds) of NormalisedEvents derived from fewer raw data objects, in which case it would actually be less work to clean up the raw data first. This is something that should be evaluated for efficiency in the future.

It:

* removes null or empty fields
* moves invalid attributes (from the top level data) behind an `invalidAttributes` property
    * invalid attributes on nested objects are not affected
* expand certain objects like images, organiser, programme and activity

Because we can't guarantee the validation stage has been run when this pipe is run, it runs the validator itself and uses these results for the cleanup, rather than using the validation results from the database.

Data cleaning tasks that happen outside of this pipe, as part of the normalisation pipes are:

* Fixing the `@context` value (to be an array that *at least* contains the correct OA context URL)
* Ensuring `id` and `type` are behind `@id` and `@type` properties

This is because these need to happen even if the cleaning pipe is disabled.