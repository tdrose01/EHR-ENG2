-- Add branch_of_service and paygrade columns if they don't exist
ALTER TABLE IF EXISTS patients
  ADD COLUMN IF NOT EXISTS paygrade VARCHAR,
  ADD COLUMN IF NOT EXISTS branch_of_service VARCHAR;
