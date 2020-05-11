CREATE TABLE publisher (
    id SERIAL PRIMARY KEY,
    name TEXT NULL,
    url TEXT NOT NULL CONSTRAINT publisher_url_unique UNIQUE
);

CREATE TABLE publisher_feed (
    id SERIAL PRIMARY KEY,
    publisher_id INTEGER NOT NULL,
    name TEXT NULL,
    url TEXT NOT NULL CONSTRAINT publisher_feed_url_unique UNIQUE,
    CONSTRAINT publisher_feed_publisher_id FOREIGN KEY (publisher_id) REFERENCES publisher (id)
);
