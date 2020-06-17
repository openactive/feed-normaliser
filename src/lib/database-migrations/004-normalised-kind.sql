-- We need to store kind. Even if the data is deleted, we need to know what the kind was so we can put it in an RPDE API.
--
-- It should really be NOT NULL with no DEFAULT but there may be existing data
ALTER TABLE normalised_data ADD data_kind TEXT NOT NULL DEFAULT '';
