# Profile Normalised Data

This will profile all normalised data against the data profiles and store the results in the database.

To run this:

`$ node ./src/bin/profile-normalised-data.js`

It can be stopped at any time and it will not leave the database in a bad state or lose too much work.

When restarted it will pick up where it left off.

## Database Storage & Errors

It will store the results of this in the `normalised_data_profile_results` table.

Rows are stored per item of normalised data and per profile, 
so you should expect this table to have 3 times as many rows as `normalised_data` (if there are 3 profiles).

For any data profile and normalised data item, there are 4 states:

* no row - we haven't tried to run the check yet
* a row with `checked=FALSE` - we tried to run the check but it went wrong. See `error_checking_message`.
* a row with `checked=TRUE` and nothing in `results` - we checked it and the data passed the check!
* a row with `checked=TRUE` and things in `results` - we checked it and the data failed the check. See `results`.

## Clear out work already done (Database storage)

To clear out all work already done, you can run the SQL:

    DELETE FROM normalised_data_profile_results;

## To only profile a limited set of data

You may want to do this to avoid processing too much data. 

### Stop the process early

The process can be forcibly stopped at any point and the database will not be in a bad state. 
It will contain most work done up to the point you stop it. 

### Only use some profiles

In Settings, edit `dataProfiles` to remove some profiles and only leave the ones you want.
(See `src/lib/settings.js`).

Now run this stage as normal.
