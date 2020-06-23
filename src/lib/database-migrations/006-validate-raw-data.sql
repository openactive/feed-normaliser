ALTER TABLE raw_data ADD validation_done BOOLEAN NOT NULL DEFAULT 'f';
ALTER TABLE raw_data ADD validation_passed BOOLEAN NOT NULL DEFAULT 'f';
ALTER TABLE raw_data ADD validation_results JSONB NULL;
