# Enhancement pipes

There are pipes which are run after the normalisation pipes to further improve the data. These may derive new data, that was not in the original source.

## Geo

For objects with a `location/address/postalCode` value, this pipe looks up the postcode on postcodes.io and, where not already present, adds:

* `location/address/addressCountry`
* `location/address/addressRegion`
* `location/address/addressLocality`
* `location/geo/longitude`
* `location/geo/latitutde`

## Activities

This pipes expands the value of the `activities` list using the official [OA Activity List](https://www.openactive.io/activity-list/activity-list.jsonld).

The OA Activity List is fetched once, indexed in a useful way, and cached. The URL for the list can be configured in `src/lib/settings.js`.

It leaves any activity with its own `inScheme` alone, but otherwise:

* If there are activities with no `id`/`@id`, but they have a label which is present in the Activity List, it fills in their ids
* It gets the `broader` activities for anything in the Activity List and adds them
* It searches the `name` and `description` of the event for labels from the Activity List and adds new activities if found

Any activity values that are either explicitly from another Activity List, or simply aren't present in the OA Activity List are retained (but made into valid objects with `@type: Concept` if not already).