CREATE TABLE spider_data_catalog_error (
    url TEXT NOT NULL,
    error TEXT NOT NULL,
    error_at TIMESTAMP WITHOUT TIME ZONE NOT NULL default (now() at time zone 'utc'),
    found_via JSON NOT NULL
);
