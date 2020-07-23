# Normalise Data

The tool will normalise raw data by passing it through a series of pipes.

Pipes are called in the order defined in `src/lib/pipes/index.js` and are called once for each bit of raw data.

Before the first pipe is called, there is an array of normalised data which is empty.
Each pipe has access to the original data and the normalised data created so far.
Each pipe can delete, edit or create normalised data as it wants.
After all pipe are called, whatever normalised data is left is saved to the database.

The normalised data is stored in the `normalised_data` table.

Deletes are soft deletes, marked by the `data_deleted` column in the table.

To run this:

`$ node ./src/bin/normalise-data.js`


## Clear out work already done (Database storage)

There are 2 options here:

* Totally delete all normalised data from the database
* Soft-delete all normalised data from the database but leave behind meta data

Crucially the first option will "break" the RPDE feeds, because we will not send delete flags for any update data we sent previously.
The second option will not do this but will not reduce database rows in use and will mean the RPDE feed may send many delete flags.
Which option is best depends on your circumstances.

### Totally delete all normalised data from the database

Before doing this, you will [need to clear out all Normalised Profile data](profile-normalised-data.md)

Run the SQL:

    DELETE FROM normalised_data;
    UPDATE raw_data SET normalised=FALSE;
    

### Soft-delete all normalised data from the database but leave behind meta data

Before doing this, you will [need to clear out all Normalised Profile data](profile-normalised-data.md)

Run the SQL:

    UPDATE normalised_data SET data_deleted=TRUE, data=NULL;
    UPDATE raw_data SET normalised=FALSE;
