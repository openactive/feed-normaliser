# Normalisation pipes

There are several pipes to carry out normalisation on the various different opportunity data types. The logic for each of them, as well as common processes, are outlined here.

## Data cleanup

Tasks that need to occur at some point in all or most pipes are available as functions on the Pipe class.

* `fixContext`: Makes the `@context` value always a list, containing at least the correct OA context, followed by other contexts if they were set. Corrects common mistypings of the OA and OA Beta contexts.
* `fixId`: Sets the `@id` field to the value of `id` if `@id` wasn't present, and removes `id`.
* `fixType`: Sets the `@type` field to the value of `type` if `@type` wasn't present, and removes `type`.
* `fixInvalidData`: Removes properties with empty or null values. Moves properties not in the OA or beta specs to behind an `invalidAttributes` property.
* `expandObjects`: Transforms logo, programme and activity objects which are strings into valid objects.
* `addProvenanceInformation`: Adds an object with `feedUrl`, `publisherName` and `derivedFrom` properties.
* `doCleanup`: Runs all of the above.

They all mainuplate the `rawData` object of the pipe that is running directly.

\(TODO\) `fixId` and `fixType` operate recursively on embedded objects of all types, and each embedded object in an array value.

\(TODO\) `expandObjects` also looks for logo, programme and activity in embedded `subEvent`s, `superEvent`, `event` and `facilityUse`.

## Normalise Event pipe

This pipe will generate normalised events from raw data with the following types:

* `Event` (or its `subEvents` if relevent)
* `OnDemandEvent` (or its `subEvents` if relevent)
* `ScheduledSession`
* `CourseInstanceSubEvent`
* `SessionSeries` so long as it has `subEvent` with one of the above types
* `EventSeries` so long as it has `subEvent` with one of the above types
* `CourseInstance` so long as it has `subEvent` with one of the above types
* `HeadlineEvent` so long as it has `subEvent` with one of the above types

1. If object has Event, OnDemandEvent, ScheduledSession, CourseInstanceSubEvent type:
   * Do data cleanup
   * Check for a `superEvent`
     * If so, merge data from `superEvent`
   * Generate NormalisedEvent

2. Else if object has a `subEvent`:
   * Get subEvents which have Event, OnDemandEvent, ScheduledSession types
   * If so, do data cleanup
   * For each subEvent:
     * Merge data from parent
     * Generate NormalisedEvent

## Normalise Slot pipe

This pipe will generate normalised events from raw data objects with the following types:

* `FacilityUse`
* `IndividualFacilityUse`
* `Slot` (todo)

1. If object has Slot type:
   * Do data cleanup
   * Get `facilityUse` and merge data from it
   * Generate NormalisedEvent
2. If object has IndividiualFacilityUse type:
   * Do data cleanup
   * If object has `aggregateFacilityUse`:
     * Get FacilityUse
     * Merge FU and IFU
     * Go to 4
3. If object has FacilityUse type:
   * If object has `individualFacilityUse`:
     * For each IndividualFacilityUse
       * Generate event with data from FU and IFU
       * Go to 4
4. Get array of values from `event`
   * For each event:
     * (need cleanup)
     * Merge data from parent
     * Generate NormalisedEvent

## Normalise Schedule pipe

This pipe will generate normalised events from any raw data object with an `eventSchedule` property.

1. If object has an `eventSchedule` property:
   * Do data cleanup
   * Generate events from schedule two weeks hence
   * For each generated event:
     * Merge data from parent
     * use scheduledEventType for type
     * Generate NormalisedEvent

## Fetching referenced objects

Events are often related to each other using `subEvent`, `superEvent`, `facilityUse` or `event` relationships. Sometimes the whole related object is embedded in the parent; in this case we can just process the data that's there.

In the cases of `superEvent` and `facilityUse`, the related object may exist in another feed, and the value of the property is a URL. Eg:

```json
"superEvent": "https://opportunities.example/event/1"
```

In theory all feeds that use this form of referencing events should only ever be referring to fully fledged URIs, and not identifier strings. Once we've pulled the URI for the children out of the relevent property value, we can look it up in the database. The URI should appear in the `data_id` field of the `raw_data` table. Then we continue to process it as if it was nested.

The properties that relate events to one another each have inverse versions. Eg. `subEvent` is the inverse of `superEvent`. In the case where we have fetched an event by reference and the referenced event contains the inverse property to the one we followed to fetch it, we assume there is nothing extra to be gained by following or processing this - and to avoid getting stuck in an infinite loop - we just remove it from the final Normalised Event.

That is to say, if we start with:

```json
{
    "@id": "/event1",
    "subEvent": [
        "/subeventA", "/subeventB"
    ]
}
```

So we fetch `/subeventA`:

```json
{
    "@id": "/subeventA",
    "superEvent": "/event1"
}
```

Then we just drop the `superEvent` property entirely.

