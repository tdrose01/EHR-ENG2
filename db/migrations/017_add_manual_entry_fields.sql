-- Migration: Add manual entry fields to radiation_dose_readings table
-- This migration adds fields to support manual dose reading entries

-- Add new columns to radiation_dose_readings table
ALTER TABLE radiation_dose_readings 
ADD COLUMN IF NOT EXISTS data_source VARCHAR(20) DEFAULT 'AUTOMATED' CHECK (data_source IN ('AUTOMATED', 'MANUAL')),
ADD COLUMN IF NOT EXISTS entered_by VARCHAR(100),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add index for data_source for better query performance
CREATE INDEX IF NOT EXISTS idx_radiation_dose_readings_data_source 
ON radiation_dose_readings(data_source);

-- Add index for entered_by for audit purposes
CREATE INDEX IF NOT EXISTS idx_radiation_dose_readings_entered_by 
ON radiation_dose_readings(entered_by);

-- Update existing records to have 'AUTOMATED' as default data_source
UPDATE radiation_dose_readings 
SET data_source = 'AUTOMATED' 
WHERE data_source IS NULL;
