-- If a normalised event was derived from two raw data objects, parentId stores the raw_data_id of the highest in the hierarchy
--
ALTER TABLE normalised_data
ADD raw_data_parent_id BIGINT NULL DEFAULT NULL,
ADD CONSTRAINT normalised_data_raw_data_parent_id FOREIGN KEY (raw_data_parent_id) REFERENCES raw_data(id);
