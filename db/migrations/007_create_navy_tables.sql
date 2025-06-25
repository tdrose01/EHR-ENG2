-- Migration: Create Navy Environmental Health Tracker tables

-- 1. Exposure Events
CREATE TABLE IF NOT EXISTS navy_exposure_events (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  event TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  exposure_level VARCHAR(20) NOT NULL,
  affected_personnel INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Biological Test Results
CREATE TABLE IF NOT EXISTS navy_bio_tests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  sample_date DATE NOT NULL,
  result TEXT NOT NULL,
  reference_range TEXT,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Medical Surveillance Compliance
CREATE TABLE IF NOT EXISTS navy_med_surveillance (
  id SERIAL PRIMARY KEY,
  personnel TEXT NOT NULL,
  nec VARCHAR(20),
  required_exam TEXT NOT NULL,
  last_exam DATE,
  next_due DATE,
  compliant BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Deployment Environmental Logs
CREATE TABLE IF NOT EXISTS navy_deployment_logs (
  id SERIAL PRIMARY KEY,
  deployment TEXT NOT NULL,
  dates TEXT NOT NULL,
  exposure_type TEXT NOT NULL,
  monitoring_type TEXT NOT NULL,
  results_available BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
); 