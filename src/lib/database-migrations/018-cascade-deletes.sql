/* Add cascade to raw data items being deleted */

ALTER TABLE normalised_data DROP CONSTRAINT normalised_data_raw_data_id, ADD CONSTRAINT normalised_data_raw_data_id FOREIGN KEY (raw_data_id) REFERENCES raw_data(id) ON DELETE CASCADE;

ALTER TABLE normalised_data DROP CONSTRAINT normalised_data_raw_data_parent_id, ADD CONSTRAINT normalised_data_raw_data_parent_id FOREIGN KEY (raw_data_parent_id) REFERENCES raw_data(id) ON DELETE CASCADE;

ALTER TABLE normalised_data_profile_results DROP CONSTRAINT normalised_data_profile_results_normalised_data_id, ADD CONSTRAINT normalised_data_profile_results_normalised_data_id FOREIGN KEY (normalised_data_id) REFERENCES normalised_data(id) ON DELETE CASCADE;