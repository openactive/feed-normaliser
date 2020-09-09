# How-to: deduplicate events

When events are published by feed aggregators as well as the original publisher, and we consume all of these, we may end up with duplicates. Similarly one publisher may publish multiple feeds with different ways of aggregating events, eg. as `EventSeries` types with sub events, as well as another feed with the events at the top level, which results in duplicates. This application _does not currently deduplicate events_ but this page contains some guidance about how to do that in case it is needed in the future.

## The easy way

Not all publishers include the `@id` or `id` field, but for those that do deduplicating becomes a lot easier. Any objects with the same values in `@id` or `id` represent the same event. The value of either of these fields should be an HTTP URI, and therefore globally unique.

In the case of data republished by an aggregator, check if they include the URL of the original feed in metadata somewhere. If you have access to this, you can match events on the value of the `identifier` field in combination with the original feed URL. `identifier` is a string and may not be globally unique across _all_ feeds, but should be unique _within_ a single feed.

_**Warning**: Updates may come from different publishers at different frequencies, so be sure to compare the `modified` field in the original RPDE data to know which is the most recent of two copies of events with matching IDs_

## Matching on other fields

In the absence of identifiers, we can use some heuristics to find event duplicates. Important fields for this are:

* `name`
* `@type` / `type`
* `startDate`, `endDate`, `duration`
* values in a `schedule` object
* values in the `location` object
* objects in the `organizer`, `contributor` or `leader` fields
* objects in the `offers` list
* objects in a `subEvent` / `event` / `individualFacilityUse` list
* the value of the `superEvent` / `facilityUse` / `aggregateFacilityUse` field

Fields which may serve to deduplicate events that are otherwise identical according to all of the above fields (in other words events with the same name, happening at the same time and in the same place) are:

* `ageRange`
* `genderRestriction`
* `isCoached`
* `accessibilityInformation`
* `level`
* `meetingPoint`
* `maxiumumUses`

### Fields not to match on

The `activity` and `programme` fields can be particularly varied, and publishers use them in different ways. There is a standard list of values that are expected to be in `activity` but publishers may use their own list, or simply use strings. Some publishers put a lot of detail here, and others the bare minimum. It's probably better to explicitly exclude these fields when matching.

In the case of `Slot` events, we see publishers producing updates for the same Slot as spots are taken up, as shown by the `remainingUses` field. This field should not be used for deduplication, and in cases where an object is identical besides this field, the one with the most recent RPDE `modified` date should be used (see warning above).

The `eventStatus` field is not a good candidate for matching on. Events that are identical besides the value of the `eventStatus` are likely to be the same event where one is a later update indicating cancellation or rescheduling.

Note that aggregators (like this one!) may apply their own processing steps to data before republishing, so the values of some fields may be different from the original. In particular, consider the `location` field may be expanded or normalised, so taking a subset of the values from the `location` object - like just the place name and postcode - could be more accurate.

Depending on the data you are dealing with, you may or may not choose to match on `beta` fields or terms from other vocabularies.

## Hashing the data

For faster matching, it makes sense to hash the data for events for comparison, rather than matching on a field-by-field basis. First, make use of the notes above to decide which fields to include for the hash, and which to ignore. You may also want to apply some basic normalisation, such as lowercasing text fields and applying consistent date formats. Finally, you want consistent JSON syntax where variations are possible, eg:

* use `@id` and `@type` instead of `id` and `type`
* make sure the value of `@context` is correct (eg. some publishers mistype it, use `http` instead of `https`, etc)
* when a field can be a single item or a list, make it always a list
* sort the fields into consistent order for all objects in the data, including nested ones
* you *may* want to drop fields from the `beta` or other external vocabularies (and adjust the `@context` value accordingly)

## When to deduplicate

In terms of this particular pipeline, we could attempt to deduplicate events either before or after the normalisation process.

Deduplicating _before_ normalisation, ie. on the raw data downloaded from the feeds, has the advantage of only having to do the work of generating normalised data for unique events; reducing the number of events to run through the validation and normalisation pipes could improve overall performance. There also tend to be fewer raw data events than normalised events due to the expansion of schedules and the extraction of sub events.

Deduplicating _after_ normalisation, ie. on the normalised events themselves, means you are dealing with a flat event hierarchy (no schedules, parent/child events, etc) and a consistent set of event types, as well as having already applied some of the normalisation rules described in [hashing the data](#hashing-the-data), as well as our own known and predictable processing on locations and activity tags (though note - these still depend on consistent input for consistent output).

As ever, there are tradeoffs to be made in terms of overhead of implementing these rules and time taken for additional processing compared to the impact on accuracy of deduplication. It may make sense to use some, but not all, of the suggestions here.