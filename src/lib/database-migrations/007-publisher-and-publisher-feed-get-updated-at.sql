ALTER TABLE publisher ADD updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL default (now() at time zone 'utc');
ALTER TABLE publisher_feed ADD updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL default (now() at time zone 'utc');
