CREATE TABLE normalised_data_profile_results (
    normalised_data_id BIGINT NOT NULL,
    profile_name TEXT NOT NULL,
    checked BOOLEAN NOT NULL,
    error_checking_message TEXT NULL,
    results JSONB NULL,
    PRIMARY KEY(normalised_data_id, profile_name),
    CONSTRAINT normalised_data_profile_results_normalised_data_id FOREIGN KEY (normalised_data_id) REFERENCES normalised_data(id)
);
