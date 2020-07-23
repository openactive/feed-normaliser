# Normalise Data

The tool will normalise raw data by passing it through a series of pipes. See [Pipeline](../pipeline/pipeline-overview.md) for more information.

After all pipes are called, the resulting normalised data is saved to the database, in the `normalised_data` table.

Deletes are soft deletes, marked by the `data_deleted` column in the table.

To run this:

`$ node ./src/bin/normalise-data.js`

