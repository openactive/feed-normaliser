ALTER TABLE publisher_feed ADD raw_next_url TEXT NULL;

CREATE TABLE raw_data (
    id BIGSERIAL PRIMARY KEY,
    publisher_feed_id INTEGER NOT NULL,
    data_id TEXT NOT NULL,
    data_deleted boolean NOT NULL,
    data_kind TEXT NOT NULL,
    data_modified TEXT NOT NULL,
    data JSONB NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL default (now() at time zone 'utc'),
    CONSTRAINT raw_data_data_id UNIQUE (publisher_feed_id, data_id),
    CONSTRAINT raw_data_publisher_feed_id FOREIGN KEY (publisher_feed_id) REFERENCES publisher_feed(id)
);
