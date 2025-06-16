-- Add new patient attributes
ALTER TABLE IF EXISTS patients
  ADD COLUMN duty_status VARCHAR,
  ADD COLUMN pid VARCHAR UNIQUE,
  ADD COLUMN paygrade VARCHAR,
  ADD COLUMN ethnicity VARCHAR,
  ADD COLUMN religion VARCHAR,
  ADD COLUMN rh_factor VARCHAR,
  ADD COLUMN dod_id BIGINT UNIQUE;
