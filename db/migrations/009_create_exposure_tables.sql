-- This script creates the tables required for storing environmental and occupational exposure data
-- as per the US Navy E-Health App requirements.

-- Disconnect from the database to drop and recreate it.
\c postgres;

-- Drop the database if it exists to ensure a clean setup.
DROP DATABASE IF EXISTS "ehr-eng2";

-- Create the database.
CREATE DATABASE "ehr-eng2";

-- Connect to the newly created database.
\c "ehr-eng2";

-- Generic table for all exposure events
CREATE TABLE exposures (
    sample_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(255),
    location_code VARCHAR(255),
    timestamp_utc TIMESTAMPTZ NOT NULL,
    captured_by VARCHAR(255),
    method_code VARCHAR(255),
    value NUMERIC NOT NULL,
    unit VARCHAR(50) NOT NULL,
    qualifier VARCHAR(50) CHECK (qualifier IN ('OK', 'ALERT', 'OVER_LIMIT', 'PENDING'))
);

-- Domain-specific extension tables

-- Air Quality Details
CREATE TABLE air_quality_details (
    sample_id UUID PRIMARY KEY,
    duration_sec INT,
    flow_rate_lpm NUMERIC,
    filter_type VARCHAR(100),
    FOREIGN KEY (sample_id) REFERENCES exposures(sample_id) ON DELETE CASCADE
);

-- Chemical Vapors (VOC) Details
CREATE TABLE voc_details (
    sample_id UUID PRIMARY KEY,
    compound_name VARCHAR(255),
    media_type VARCHAR(100),
    humidity_pct NUMERIC,
    FOREIGN KEY (sample_id) REFERENCES exposures(sample_id) ON DELETE CASCADE
);

-- Noise Details
CREATE TABLE noise_details (
    sample_id UUID PRIMARY KEY,
    dosimeter_interval_min INT,
    laeq NUMERIC,
    peak_db NUMERIC,
    FOREIGN KEY (sample_id) REFERENCES exposures(sample_id) ON DELETE CASCADE
);

-- Radiation Details
CREATE TABLE radiation_details (
    sample_id UUID PRIMARY KEY,
    detector_type VARCHAR(100),
    shielding_cm NUMERIC,
    calibration_date DATE,
    FOREIGN KEY (sample_id) REFERENCES exposures(sample_id) ON DELETE CASCADE
);

-- Potable Water Details
CREATE TABLE water_details (
    sample_id UUID PRIMARY KEY,
    sample_type VARCHAR(100),
    temp_c NUMERIC,
    residual_chlorine_mg_l NUMERIC,
    FOREIGN KEY (sample_id) REFERENCES exposures(sample_id) ON DELETE CASCADE
);

-- Heat Stress Details
CREATE TABLE heat_stress_details (
    sample_id UUID PRIMARY KEY,
    db_c NUMERIC,
    wb_c NUMERIC,
    globe_c NUMERIC,
    flag_color VARCHAR(50),
    FOREIGN KEY (sample_id) REFERENCES exposures(sample_id) ON DELETE CASCADE
);

-- Grant privileges to the web user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO web;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO web;

-- ---
-- Description of the tables:
--
-- exposures:
--   This is the central table that stores generic data for every exposure event.
--   - sample_id: A unique identifier for each sample.
--   - device_id: The ID of the sensor or kit used for measurement.
--   - location_code: The specific location where the sample was taken.
--   - timestamp_utc: The exact time of the sample capture.
--   - value, unit: The numeric reading and its corresponding unit.
--   - qualifier: The status of the reading (e.g., OK, ALERT).
--
-- detail tables (e.g., air_quality_details, voc_details):
--   These tables store additional, domain-specific fields for each type of exposure.
--   Each table is linked to the main 'exposures' table via the 'sample_id'.
--   This design avoids a single, sparse table with many null columns and keeps the data organized.
-- ---
