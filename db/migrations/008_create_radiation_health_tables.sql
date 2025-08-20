-- Migration: Create Navy Radiation Health Module tables
-- This migration creates the complete schema for personal dosimeter monitoring and dose reconciliation

-- 1. Units table
CREATE TABLE IF NOT EXISTS radiation_units (
  id SERIAL PRIMARY KEY,
  uic VARCHAR(20) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  parent_uic VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Personnel table
CREATE TABLE IF NOT EXISTS radiation_personnel (
  id SERIAL PRIMARY KEY,
  edipi VARCHAR(20) NOT NULL UNIQUE,
  rank_rate VARCHAR(10) NOT NULL,
  lname TEXT NOT NULL,
  fname TEXT NOT NULL,
  unit_id INTEGER REFERENCES radiation_units(id),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Device models table
CREATE TABLE IF NOT EXISTS radiation_device_models (
  id SERIAL PRIMARY KEY,
  vendor TEXT NOT NULL,
  model TEXT NOT NULL,
  firmware_min VARCHAR(20),
  hp10_support BOOLEAN NOT NULL DEFAULT false,
  hp007_support BOOLEAN NOT NULL DEFAULT false,
  gatt_service_uuid VARCHAR(36),
  gatt_char_uuid VARCHAR(36),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Devices table
CREATE TABLE IF NOT EXISTS radiation_devices (
  id SERIAL PRIMARY KEY,
  model_id INTEGER REFERENCES radiation_device_models(id),
  serial VARCHAR(50) NOT NULL UNIQUE,
  ble_mac VARCHAR(17),
  firmware VARCHAR(20),
  calib_due DATE,
  rf_policy VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (rf_policy IN ('NORMAL', 'CONTROLLED', 'NO_RF')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  retired_at TIMESTAMPTZ
);

-- 5. Assignments table
CREATE TABLE IF NOT EXISTS radiation_assignments (
  id SERIAL PRIMARY KEY,
  device_id INTEGER REFERENCES radiation_devices(id),
  personnel_id INTEGER REFERENCES radiation_personnel(id),
  start_ts TIMESTAMPTZ NOT NULL,
  end_ts TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Dose readings table (partitioned monthly)
CREATE TABLE IF NOT EXISTS radiation_dose_readings (
  id SERIAL PRIMARY KEY,
  device_id INTEGER REFERENCES radiation_devices(id),
  measured_ts TIMESTAMPTZ NOT NULL,
  gateway_ts TIMESTAMPTZ NOT NULL,
  hp10_mSv DECIMAL(10,6),
  hp007_mSv DECIMAL(10,6),
  rate_uSv_h DECIMAL(10,2),
  battery_pct DECIMAL(5,2),
  raw_json JSONB,
  payload_sig TEXT,
  sig_alg VARCHAR(20),
  gateway_id VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Alerts table
CREATE TABLE IF NOT EXISTS radiation_alerts (
  id SERIAL PRIMARY KEY,
  created_ts TIMESTAMPTZ DEFAULT NOW(),
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  threshold DECIMAL(10,6),
  value DECIMAL(10,6),
  device_id INTEGER REFERENCES radiation_devices(id),
  personnel_id INTEGER REFERENCES radiation_personnel(id),
  measured_ts TIMESTAMPTZ,
  ack_by VARCHAR(50),
  ack_ts TIMESTAMPTZ,
  details JSONB
);

-- 8. NDC periods table
CREATE TABLE IF NOT EXISTS radiation_ndc_periods (
  id SERIAL PRIMARY KEY,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  ndc_source_doc TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NDC dose records table
CREATE TABLE IF NOT EXISTS radiation_ndc_dose_records (
  id SERIAL PRIMARY KEY,
  period_id INTEGER REFERENCES radiation_ndc_periods(id),
  personnel_id INTEGER REFERENCES radiation_personnel(id),
  hp10_mSv DECIMAL(10,6),
  hp007_mSv DECIMAL(10,6),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Reconciliations table
CREATE TABLE IF NOT EXISTS radiation_reconciliations (
  id SERIAL PRIMARY KEY,
  period_id INTEGER REFERENCES radiation_ndc_periods(id),
  personnel_id INTEGER REFERENCES radiation_personnel(id),
  op_hp10_mSv DECIMAL(10,6),
  ndc_hp10_mSv DECIMAL(10,6),
  variance_mSv DECIMAL(10,6),
  created_ts TIMESTAMPTZ DEFAULT NOW(),
  details JSONB
);

-- 11. Audit log table
CREATE TABLE IF NOT EXISTS radiation_audit_log (
  id SERIAL PRIMARY KEY,
  ts TIMESTAMPTZ DEFAULT NOW(),
  actor VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  obj_schema VARCHAR(50),
  obj_table VARCHAR(50),
  obj_id INTEGER,
  before JSONB,
  after JSONB
);

-- Create indexes for performance
CREATE INDEX idx_radiation_units_uic ON radiation_units(uic);
CREATE INDEX idx_radiation_personnel_edipi ON radiation_personnel(edipi);
CREATE INDEX idx_radiation_personnel_unit ON radiation_personnel(unit_id);
CREATE INDEX idx_radiation_personnel_active ON radiation_personnel(active);
CREATE INDEX idx_radiation_devices_serial ON radiation_devices(serial);
CREATE INDEX idx_radiation_devices_model ON radiation_devices(model_id);
CREATE INDEX idx_radiation_devices_rf_policy ON radiation_devices(rf_policy);
CREATE INDEX idx_radiation_devices_retired ON radiation_devices(retired_at);
CREATE INDEX idx_radiation_assignments_device ON radiation_assignments(device_id);
CREATE INDEX idx_radiation_assignments_personnel ON radiation_assignments(personnel_id);
CREATE INDEX idx_radiation_assignments_time ON radiation_assignments(start_ts, end_ts);
CREATE INDEX idx_radiation_dose_readings_device_ts ON radiation_dose_readings(device_id, measured_ts);
CREATE INDEX idx_radiation_dose_readings_personnel_ts ON radiation_dose_readings(personnel_id, measured_ts);
CREATE INDEX idx_radiation_dose_readings_gateway_ts ON radiation_dose_readings(gateway_ts);
CREATE INDEX idx_radiation_alerts_personnel_created ON radiation_alerts(personnel_id, created_ts);
CREATE INDEX idx_radiation_alerts_device_created ON radiation_alerts(device_id, created_ts);
CREATE INDEX idx_radiation_alerts_type_severity ON radiation_alerts(type, severity);
CREATE INDEX idx_radiation_alerts_unacknowledged ON radiation_alerts(ack_ts) WHERE ack_ts IS NULL;
CREATE INDEX idx_radiation_ndc_periods_dates ON radiation_ndc_periods(period_start, period_end);
CREATE INDEX idx_radiation_ndc_dose_records_period ON radiation_ndc_dose_records(period_id);
CREATE INDEX idx_radiation_ndc_dose_records_personnel ON radiation_ndc_dose_records(personnel_id);
CREATE INDEX idx_radiation_reconciliations_period ON radiation_reconciliations(period_id);
CREATE INDEX idx_radiation_reconciliations_personnel ON radiation_reconciliations(personnel_id);
CREATE INDEX idx_radiation_audit_log_ts ON radiation_audit_log(ts);
CREATE INDEX idx_radiation_audit_log_actor ON radiation_audit_log(actor);
CREATE INDEX idx_radiation_audit_log_object ON radiation_audit_log(obj_table, obj_id);

-- Add comments for documentation
COMMENT ON TABLE radiation_units IS 'Navy units and commands for personnel assignment';
COMMENT ON TABLE radiation_personnel IS 'Navy personnel assigned to radiation monitoring';
COMMENT ON TABLE radiation_device_models IS 'Personal dosimeter device models and capabilities';
COMMENT ON TABLE radiation_devices IS 'Individual dosimeter devices with RF policy settings';
COMMENT ON TABLE radiation_assignments IS 'Personnel-device assignments with time boundaries';
COMMENT ON TABLE radiation_dose_readings IS 'Time-series dose readings from personal dosimeters';
COMMENT ON TABLE radiation_alerts IS 'Alerts for dose thresholds, battery, and other conditions';
COMMENT ON TABLE radiation_ndc_periods IS 'Naval Dosimetry Center reporting periods';
COMMENT ON TABLE radiation_ndc_dose_records IS 'Official dose records from NDC';
COMMENT ON TABLE radiation_reconciliations IS 'Operational vs. official dose reconciliation';
COMMENT ON TABLE radiation_audit_log IS 'Audit trail for all radiation health data changes';

-- Create view for personnel with current device assignments
CREATE OR REPLACE VIEW radiation_personnel_devices AS
SELECT 
  p.id as personnel_id,
  p.edipi,
  p.rank_rate,
  p.lname,
  p.fname,
  u.name as unit_name,
  d.id as device_id,
  d.serial as device_serial,
  dm.vendor as device_vendor,
  dm.model as device_model,
  d.rf_policy,
  a.start_ts as assignment_start,
  a.end_ts as assignment_end
FROM radiation_personnel p
LEFT JOIN radiation_units u ON p.unit_id = u.id
LEFT JOIN radiation_assignments a ON p.id = a.personnel_id AND (a.end_ts IS NULL OR a.end_ts > NOW())
LEFT JOIN radiation_devices d ON a.device_id = d.id AND d.retired_at IS NULL
LEFT JOIN radiation_device_models dm ON d.model_id = dm.id
WHERE p.active = true;

-- Create view for dose readings with personnel and device info
CREATE OR REPLACE VIEW radiation_dose_readings_detail AS
SELECT 
  dr.id,
  dr.device_id,
  dr.measured_ts,
  dr.hp10_mSv,
  dr.hp007_mSv,
  dr.rate_uSv_h,
  dr.battery_pct,
  d.serial as device_serial,
  dm.vendor as device_vendor,
  dm.model as device_model,
  p.edipi,
  p.rank_rate,
  p.lname,
  p.fname,
  u.name as unit_name
FROM radiation_dose_readings dr
LEFT JOIN radiation_devices d ON dr.device_id = d.id
LEFT JOIN radiation_device_models dm ON d.model_id = dm.id
LEFT JOIN radiation_assignments a ON d.id = a.device_id AND dr.measured_ts BETWEEN a.start_ts AND COALESCE(a.end_ts, NOW())
LEFT JOIN radiation_personnel p ON a.personnel_id = p.id
LEFT JOIN radiation_units u ON p.unit_id = u.id;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
