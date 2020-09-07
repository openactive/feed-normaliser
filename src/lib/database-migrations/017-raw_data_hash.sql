ALTER TABLE raw_data ADD data_hash TEXT NULL;

CREATE UNIQUE INDEX data_hash_index ON raw_data (data_hash);

ALTER TABLE raw_data ADD CONSTRAINT unique_data_hash UNIQUE (data_hash);