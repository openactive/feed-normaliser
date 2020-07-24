# HTTP APIs

There is a webserver that provides data as API's.

To run this:

`$ npm run start-webserver`

or start in developer mode (auto reloads on changes)

`$ npm run start-webserver-dev`

RPDE APIs are meant to be called directly by users. They are:

* `/normalised_data/all` - call to get all processed data in system.

Publisher status information:

* `/publishers/status`

Normalised data - if you have a piece of normalised data and you want to see the raw data that generated it, you can call:

* `/normalised_data/item_by_id/<ID>`
