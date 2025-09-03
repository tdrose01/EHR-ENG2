-- Migration: Create NAVMED Reports table
-- This migration creates the table for storing NAVMED 6470 series reports

CREATE TABLE IF NOT EXISTS radiation_navmed_reports (
  id SERIAL PRIMARY KEY,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('ANNUAL', 'SITUATIONAL', 'OVER_LIMIT')),
  personnel_id INTEGER NOT NULL REFERENCES radiation_personnel(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calendar_year INTEGER,
  deep_dose_msv DECIMAL(10,6) DEFAULT 0,
  shallow_dose_msv DECIMAL(10,6) DEFAULT 0,
  extremity_dose_msv DECIMAL(10,6) DEFAULT 0,
  internal_dose_msv DECIMAL(10,6) DEFAULT 0,
  limit_exceeded VARCHAR(50),
  discovery_date DATE,
  exposure_circumstances TEXT,
  prepared_by VARCHAR(100) NOT NULL,
  date_prepared DATE NOT NULL,
  rso_signature VARCHAR(100),
  command_signature VARCHAR(100),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_radiation_navmed_reports_personnel ON radiation_navmed_reports(personnel_id);
CREATE INDEX IF NOT EXISTS idx_radiation_navmed_reports_type ON radiation_navmed_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_radiation_navmed_reports_period ON radiation_navmed_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_radiation_navmed_reports_created ON radiation_navmed_reports(created_at);

-- Add comments for documentation
COMMENT ON TABLE radiation_navmed_reports IS 'NAVMED 6470 series radiation exposure reports';
COMMENT ON COLUMN radiation_navmed_reports.report_type IS 'Type of report: ANNUAL, SITUATIONAL, or OVER_LIMIT (MED 6470-2)';
COMMENT ON COLUMN radiation_navmed_reports.limit_exceeded IS 'Type of limit exceeded for OVER_LIMIT reports';
COMMENT ON COLUMN radiation_navmed_reports.exposure_circumstances IS 'Detailed circumstances for over-limit exposures';
