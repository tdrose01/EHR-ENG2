-- Drop deprecated patient fields
ALTER TABLE IF EXISTS patients
  DROP COLUMN IF EXISTS insurance_provider,
  DROP COLUMN IF EXISTS insurance_id,
  DROP COLUMN IF EXISTS fmpc,
  DROP COLUMN IF EXISTS rank;

DROP INDEX IF EXISTS idx_patients_insurance;
