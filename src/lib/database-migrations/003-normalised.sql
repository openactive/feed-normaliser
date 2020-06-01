ALTER TABLE raw_data ADD normalised BOOLEAN NOT NULL DEFAULT 'f';

CREATE TABLE normalised_data (
    id BIGSERIAL PRIMARY KEY,
    raw_data_id BIGSERIAL NOT NULL,
    data_id TEXT NOT NULL,
    data_deleted boolean NOT NULL,
    data JSONB NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL default (now() at time zone 'utc'),
    CONSTRAINT normalised_data_data_id UNIQUE (data_id),
    CONSTRAINT normalised_data_raw_data_id FOREIGN KEY (raw_data_id) REFERENCES raw_data(id)
);




