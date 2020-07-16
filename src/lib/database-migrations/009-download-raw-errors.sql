CREATE TABLE download_raw_errors (
    url TEXT NOT NULL,
    error TEXT NOT NULL,
    error_at TIMESTAMP WITHOUT TIME ZONE NOT NULL default (now() at time zone 'utc'),
    publisher_feed_id INTEGER NOT NULL,
    CONSTRAINT download_raw_errors_publisher_feed_id FOREIGN KEY (publisher_feed_id) REFERENCES publisher_feed(id)
);
