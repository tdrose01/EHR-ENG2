-- Add branch_of_service column to patients table
ALTER TABLE IF EXISTS patients
  ADD COLUMN branch_of_service VARCHAR(255);
