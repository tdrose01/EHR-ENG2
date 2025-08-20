-- Add missing fields to radiation_personnel table
-- Migration: 009_add_radiation_personnel_fields.sql

-- Add new columns for enhanced personnel management
ALTER TABLE radiation_personnel 
ADD COLUMN IF NOT EXISTS radiation_category VARCHAR(10),
ADD COLUMN IF NOT EXISTS monitoring_frequency VARCHAR(20),
ADD COLUMN IF NOT EXISTS last_medical_exam DATE,
ADD COLUMN IF NOT EXISTS next_medical_due DATE,
ADD COLUMN IF NOT EXISTS dosimeter_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_ts TIMESTAMPTZ;

-- Add constraints for the new fields
ALTER TABLE radiation_personnel 
ADD CONSTRAINT chk_radiation_category 
CHECK (radiation_category IN ('CAT1', 'CAT2', 'CAT3', 'CAT4'));

ALTER TABLE radiation_personnel 
ADD CONSTRAINT chk_monitoring_frequency 
CHECK (monitoring_frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'));

-- Update existing records with default values
UPDATE radiation_personnel 
SET 
  radiation_category = 'CAT3',
  monitoring_frequency = 'MONTHLY',
  dosimeter_type = 'TLD',
  notes = 'Legacy personnel record'
WHERE radiation_category IS NULL;

-- Make the new fields NOT NULL after setting defaults
ALTER TABLE radiation_personnel 
ALTER COLUMN radiation_category SET NOT NULL,
ALTER COLUMN monitoring_frequency SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_radiation_personnel_category ON radiation_personnel(radiation_category);
CREATE INDEX IF NOT EXISTS idx_radiation_personnel_frequency ON radiation_personnel(monitoring_frequency);
CREATE INDEX IF NOT EXISTS idx_radiation_personnel_medical_due ON radiation_personnel(next_medical_due);

-- Add comments for documentation
COMMENT ON COLUMN radiation_personnel.radiation_category IS 'Radiation exposure category (CAT1=High Risk, CAT2=Medium Risk, CAT3=Low Risk, CAT4=Minimal Risk)';
COMMENT ON COLUMN radiation_personnel.monitoring_frequency IS 'Frequency of radiation monitoring required';
COMMENT ON COLUMN radiation_personnel.last_medical_exam IS 'Date of last medical examination';
COMMENT ON COLUMN radiation_personnel.next_medical_due IS 'Date of next medical examination due';
COMMENT ON COLUMN radiation_personnel.dosimeter_type IS 'Type of dosimeter assigned (TLD, OSL, EPD, BETA)';
COMMENT ON COLUMN radiation_personnel.notes IS 'Additional notes about the personnel';
COMMENT ON COLUMN radiation_personnel.updated_ts IS 'Timestamp of last update';
