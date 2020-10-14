/* This index was duplicated by the auto index of unique constraint on data_has */
DROP INDEX IF EXISTS data_hash_index;
/* This partial index didn't prove useful */
DROP INDEX IF EXISTS raw_data_id_idx;

/* This index specifically helps with the RPDE paging queries */
CREATE INDEX updated_at_data_id on normalised_data(cast(extract(epoch from updated_at) as int) ASC, data_id ASC);

/* When we generate the publisher feed stats we filter by publisher_feed_id */
CREATE INDEX publiser_feed on raw_data (publisher_feed_id);