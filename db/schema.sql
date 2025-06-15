-- Schema for ehr-eng2 database
-- Run the CREATE DATABASE statement first while connected to the default 'postgres' database

CREATE DATABASE "ehr-eng2";

\c "ehr-eng2";

-- Users table storing login credentials
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
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

-- Example admin user for testing
INSERT INTO users (email, password_hash, role)
VALUES (
  'admin@example.com',
  '$2b$10$jeY.en9U2c2J9gAQYZAas.yEGkAwwQ.GTsQqiQ5VLzyUASDs5MmRW',
  'admin'
);

-- Example regular user
INSERT INTO users (email, password_hash, role)
VALUES (
  'user@example.com',
  '$2b$10$lilvThtbofLoIyhAJS0O1.wAQAplhae6nrfDnM2tG1RP/yxB9CRg.',
  'user'
);

-- Grant necessary permissions to the web user
CREATE USER web WITH PASSWORD 'webpass';
GRANT ALL PRIVILEGES ON DATABASE "ehr-eng2" TO web;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO web;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO web;

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(50),
    date_of_birth DATE NOT NULL,
    phone_number VARCHAR(20),
    insurance_provider VARCHAR(100),
    insurance_id VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for common queries
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_patients_insurance ON patients(insurance_provider, insurance_id);

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
INSERT INTO patients (first_name, last_name, gender, date_of_birth, phone_number, insurance_provider, insurance_id, is_active)
VALUES 
    ('John', 'Doe', 'Male', '1980-01-15', '555-0123', 'Blue Cross', 'BC123456', true),
    ('Jane', 'Smith', 'Female', '1992-05-22', '555-0124', 'Aetna', 'AE789012', true)
ON CONFLICT DO NOTHING;

