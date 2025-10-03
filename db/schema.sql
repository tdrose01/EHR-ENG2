-- Schema for ehr-eng2 database
-- Run the CREATE DATABASE statement first while connected to the default 'postgres' database
--
-- This database includes real-time monitoring capabilities for the Radiation Health Module
-- See db/migrations/011_add_real_time_triggers.sql for WebSocket notification triggers
-- Real-time monitoring dashboard: http://localhost:5173/real-time-monitoring

CREATE DATABASE "ehr-eng2";

\c "ehr-eng2";

-- Users table storing login credentials
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  last_login_at TIMESTAMPTZ,
  last_login TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Audit table for recording login attempts
CREATE TABLE login_audit (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);





-- Enumerated types for patients
CREATE TYPE marital_status_enum AS ENUM ('Single', 'Married', 'Divorced', 'Widowed');
CREATE TYPE blood_type_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    -- The following fields contain PII/PHI and should be encrypted at rest
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(50),
    marital_status marital_status_enum,
    blood_type blood_type_enum,
    rh_factor VARCHAR,
    duty_status VARCHAR,
    pid VARCHAR UNIQUE,
    paygrade VARCHAR,
    branch_of_service VARCHAR(255),
    ethnicity VARCHAR,
    religion VARCHAR,
    dod_id BIGINT UNIQUE,
    date_of_birth DATE NOT NULL,
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for common queries
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(last_name, first_name);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON patients TO web;
GRANT USAGE, SELECT ON SEQUENCE patients_id_seq TO web;

-- Sample data (optional, comment out if not needed)
INSERT INTO patients (
  first_name,
  last_name,
  gender,
  marital_status,
  blood_type,
  rh_factor,
  duty_status,
  pid,
  paygrade,
  branch_of_service,
  ethnicity,
  religion,
  dod_id,
  date_of_birth,
  phone_number,
  is_active
)
VALUES
  ('John', 'Doe', 'Male', 'Married', 'O+', 'Positive', 'Active', 'JD123', 'E3', 'Army', 'Caucasian', 'None', 123456789, '1980-01-15', '555-0123', true),
  ('Jane', 'Smith', 'Female', 'Single', 'A+', 'Negative', 'Reserve', 'JS456', 'O2', 'Navy', 'Asian', 'Christian', 987654321, '1992-05-22', '555-0124', true)
ON CONFLICT DO NOTHING;

-- Add to existing schema.sql

CREATE TABLE pop3 (
    id SERIAL PRIMARY KEY,
    dodid INTEGER NOT NULL
);

-- Medical personnel summary table
CREATE TABLE IF NOT EXISTS medical_personnel_summary (
  occ_code INTEGER PRIMARY KEY,
  category TEXT NOT NULL,
  example_personnel_type TEXT NOT NULL
);

INSERT INTO medical_personnel_summary (occ_code, category, example_personnel_type) VALUES
  (10, 'Medical Service, General', 'General HM, generic medical billets'),
  (11, 'Medical Service, Specialists', 'HM-L05A Radiation Health Technician (enlisted)'),
  (20, 'Dental Service', 'Dental Corps personnel'),
  (21, 'Preventive Medicine / Environmental Health', 'MSC 230X Radiation Health Officer (officer)'),
  (30, 'Veterinary Service', 'Veterinary officer billets'),
  (40, 'Medical Administration', 'Medical admin staff'),
  (50, 'Allied Sciences', 'Laboratory, radiography, biomedical science')
ON CONFLICT (occ_code) DO UPDATE SET
  category = EXCLUDED.category,
  example_personnel_type = EXCLUDED.example_personnel_type;
