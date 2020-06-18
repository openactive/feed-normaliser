ALTER TABLE normalised_data ADD validation_done BOOLEAN NOT NULL DEFAULT 'f';
ALTER TABLE normalised_data ADD validation_results JSONB NULL;