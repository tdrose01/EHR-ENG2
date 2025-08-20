-- Seed data for Navy Radiation Health Module
-- This script populates all tables with realistic sample data for development and testing

-- 1. Units (Navy command structure)
INSERT INTO radiation_units (uic, name, parent_uic) VALUES
  ('N00001', 'USS Ronald Reagan (CVN-76)', 'NAVY'),
  ('N00002', 'VAQ-139 (Electronic Attack Squadron)', 'N00001'),
  ('N00003', 'NAS Pensacola', 'NAVY'),
  ('N00004', 'Naval Dosimetry Center', 'NAVY'),
  ('N00005', 'USS Carl Vinson (CVN-70)', 'NAVY'),
  ('N00006', 'VAQ-140 (Electronic Attack Squadron)', 'N00005'),
  ('N00007', 'Naval Base San Diego', 'NAVY'),
  ('N00008', 'Naval Medical Center San Diego', 'NAVY');

-- 2. Personnel (Navy personnel with realistic ranks and rates)
INSERT INTO radiation_personnel (edipi, rank_rate, lname, fname, unit_id) VALUES
  ('1234567890', 'HM2', 'Garcia', 'Maria', 2),
  ('2345678901', 'EN3', 'Ramos', 'Carlos', 2),
  ('3456789012', 'SNM', 'Johnson', 'James', 2),
  ('4567890123', 'LT', 'Smith', 'Sarah', 1),
  ('5678901234', 'HM1', 'Williams', 'Robert', 3),
  ('6789012345', 'ET2', 'Brown', 'Jennifer', 2),
  ('7890123456', 'FC3', 'Davis', 'Michael', 1),
  ('8901234567', 'MM2', 'Miller', 'Lisa', 2),
  ('9012345678', 'IT2', 'Wilson', 'David', 3),
  ('0123456789', 'YN3', 'Moore', 'Amanda', 2);

-- 3. Device models (Real personal dosimeter models)
INSERT INTO radiation_device_models (vendor, model, firmware_min, hp10_support, hp007_support, gatt_service_uuid) VALUES
  ('Instadose', 'VUE', '2.1.0', true, true, '12345678-1234-1234-1234-123456789abc'),
  ('Mirion', 'Instadose+', '1.5.0', true, false, '87654321-4321-4321-4321-cba987654321'),
  ('Thermo', 'RadEye PRD', '3.0.0', true, true, '11111111-2222-3333-4444-555555555555'),
  ('Ludlum', 'Model 2363', '2.2.0', true, true, '22222222-3333-4444-5555-666666666666'),
  ('Canberra', 'PDR-1', '1.8.0', true, false, '33333333-4444-5555-6666-777777777777');

-- 4. Devices (Individual dosimeters with different RF policies)
INSERT INTO radiation_devices (model_id, serial, ble_mac, firmware, calib_due, rf_policy) VALUES
  (1, 'VUE-1234567', 'AA:BB:CC:DD:EE:FF', '2.1.5', '2026-01-15', 'NORMAL'),
  (1, 'VUE-1234568', 'AA:BB:CC:DD:EE:FE', '2.1.5', '2026-01-15', 'CONTROLLED'),
  (1, 'VUE-1234569', 'AA:BB:CC:DD:EE:FD', '2.1.5', '2026-01-15', 'NORMAL'),
  (2, 'MIR-7890123', '11:22:33:44:55:66', '1.5.2', '2025-12-01', 'NORMAL'),
  (2, 'MIR-7890124', '11:22:33:44:55:67', '1.5.2', '2025-12-01', 'CONTROLLED'),
  (3, 'THER-4567890', 'AA:11:BB:22:CC:33', '3.0.1', '2026-03-01', 'NORMAL'),
  (3, 'THER-4567891', 'AA:11:BB:22:CC:34', '3.0.1', '2026-03-01', 'NO_RF'),
  (4, 'LUD-9876543', 'DD:44:EE:55:FF:66', '2.2.1', '2025-11-01', 'NORMAL'),
  (5, 'CAN-6543210', '77:88:99:AA:BB:CC', '1.8.2', '2026-02-01', 'CONTROLLED');

-- 5. Assignments (Personnel-device assignments with realistic time periods)
INSERT INTO radiation_assignments (device_id, personnel_id, start_ts, end_ts) VALUES
  (1, 1, '2025-01-01 00:00:00', NULL),
  (2, 2, '2025-01-01 00:00:00', NULL),
  (3, 3, '2025-01-01 00:00:00', NULL),
  (4, 4, '2025-01-01 00:00:00', NULL),
  (5, 5, '2025-01-01 00:00:00', NULL),
  (6, 6, '2025-01-01 00:00:00', NULL),
  (7, 7, '2025-01-01 00:00:00', NULL),
  (8, 8, '2025-01-01 00:00:00', NULL),
  (9, 9, '2025-01-01 00:00:00', NULL),
  (1, 10, '2025-06-01 00:00:00', '2025-06-30 23:59:59'); -- Temporary assignment

-- 6. Dose readings (Realistic dose data over time)
INSERT INTO radiation_dose_readings (device_id, measured_ts, gateway_ts, hp10_mSv, hp007_mSv, rate_uSv_h, battery_pct, raw_json, gateway_id) VALUES
  -- Device 1 (VUE-1234567) - HM2 Garcia
  (1, '2025-06-25 08:00:00', '2025-06-25 08:01:00', 0.012345, 0.003210, 0.50, 81.5, '{"seq": 4172, "tempC": 29.2, "lifetime_mSv": 4.212}', 'GFE-PIXEL6A-42'),
  (1, '2025-06-25 12:00:00', '2025-06-25 12:01:00', 0.015678, 0.004567, 0.75, 79.2, '{"seq": 4173, "tempC": 31.1, "lifetime_mSv": 4.228}', 'GFE-PIXEL6A-42'),
  (1, '2025-06-25 16:00:00', '2025-06-25 16:01:00', 0.018901, 0.005678, 0.60, 76.8, '{"seq": 4174, "tempC": 30.5, "lifetime_mSv": 4.247}', 'GFE-PIXEL6A-42'),
  
  -- Device 2 (VUE-1234568) - EN3 Ramos (CONTROLLED RF)
  (2, '2025-06-25 08:00:00', '2025-06-25 08:05:00', 0.008901, 0.002345, 0.25, 85.0, '{"seq": 2156, "tempC": 28.5, "lifetime_mSv": 2.156}', 'GFE-SAMSUNG-23'),
  (2, '2025-06-25 16:00:00', '2025-06-25 16:05:00', 0.009234, 0.002567, 0.30, 83.2, '{"seq": 2157, "tempC": 29.1, "lifetime_mSv": 2.165}', 'GFE-SAMSUNG-23'),
  
  -- Device 3 (VUE-1234569) - SNM Johnson
  (3, '2025-06-25 08:00:00', '2025-06-25 08:02:00', 0.023456, 0.006789, 1.20, 72.8, '{"seq": 8923, "tempC": 32.0, "lifetime_mSv": 8.923}', 'GFE-IPHONE-15'),
  (3, '2025-06-25 12:00:00', '2025-06-25 12:02:00', 0.025678, 0.007234, 1.45, 70.1, '{"seq": 8924, "tempC": 33.2, "lifetime_mSv": 8.949}', 'GFE-IPHONE-15'),
  (3, '2025-06-25 16:00:00', '2025-06-25 16:02:00', 0.027890, 0.007890, 1.30, 67.5, '{"seq": 8925, "tempC": 32.8, "lifetime_mSv": 8.977}', 'GFE-IPHONE-15'),
  
  -- Device 4 (MIR-7890123) - LT Smith
  (4, '2025-06-25 08:00:00', '2025-06-25 08:03:00', 0.006789, 0.001234, 0.20, 88.9, '{"seq": 3456, "tempC": 27.8, "lifetime_mSv": 1.567}', 'GFE-PIXEL7-01'),
  (4, '2025-06-25 12:00:00', '2025-06-25 12:03:00', 0.007123, 0.001456, 0.25, 87.2, '{"seq": 3457, "tempC": 28.4, "lifetime_mSv": 1.574}', 'GFE-PIXEL7-01'),
  
  -- Device 5 (MIR-7890124) - HM1 Williams (CONTROLLED RF)
  (5, '2025-06-25 08:00:00', '2025-06-25 08:06:00', 0.005678, 0.000987, 0.15, 91.3, '{"seq": 5678, "tempC": 26.9, "lifetime_mSv": 0.987}', 'GFE-SAMSUNG-24'),
  
  -- Device 6 (THER-4567890) - ET2 Brown
  (6, '2025-06-25 08:00:00', '2025-06-25 08:02:00', 0.034567, 0.009876, 1.80, 65.4, '{"seq": 7890, "tempC": 34.1, "lifetime_mSv": 12.345}', 'GFE-IPHONE-14'),
  (6, '2025-06-25 12:00:00', '2025-06-25 12:02:00', 0.036789, 0.010234, 2.10, 62.8, '{"seq": 7891, "tempC": 35.2, "lifetime_mSv": 12.382}', 'GFE-IPHONE-14'),
  
  -- Device 7 (THER-4567891) - FC3 Davis (NO_RF)
  (7, '2025-06-25 08:00:00', '2025-06-25 08:10:00', 0.045678, 0.012345, 2.50, 58.9, '{"seq": 8901, "tempC": 36.0, "lifetime_mSv": 15.678}', 'GFE-LAPTOP-01'),
  
  -- Device 8 (LUD-9876543) - MM2 Miller
  (8, '2025-06-25 08:00:00', '2025-06-25 08:01:00', 0.018901, 0.005123, 0.80, 78.5, '{"seq": 1234, "tempC": 29.8, "lifetime_mSv": 3.456}', 'GFE-PIXEL6A-43'),
  
  -- Device 9 (CAN-6543210) - IT2 Wilson (CONTROLLED RF)
  (9, '2025-06-25 08:00:00', '2025-06-25 08:07:00', 0.012345, 0.003456, 0.45, 82.1, '{"seq": 2345, "tempC": 28.7, "lifetime_mSv": 2.789}', 'GFE-SAMSUNG-25');

-- 7. Alerts (Various types of radiation health alerts)
INSERT INTO radiation_alerts (type, severity, threshold, value, device_id, personnel_id, measured_ts, details) VALUES
  -- Rate spike alerts
  ('RATE_SPIKE', 'MEDIUM', 1.0, 1.20, 3, 3, '2025-06-25 08:00:00', '{"rate_exceeded": true, "duration_minutes": 15, "threshold_type": "hourly_rate"}'),
  ('RATE_SPIKE', 'HIGH', 1.5, 2.10, 6, 6, '2025-06-25 12:00:00', '{"rate_exceeded": true, "duration_minutes": 30, "threshold_type": "hourly_rate"}'),
  ('RATE_SPIKE', 'MEDIUM', 1.0, 1.30, 3, 3, '2025-06-25 12:00:00', '{"rate_exceeded": true, "duration_minutes": 20, "threshold_type": "hourly_rate"}'),
  
  -- Battery alerts
  ('LOW_BATTERY', 'LOW', 20.0, 18.5, 1, 1, '2025-06-25 12:00:00', '{"battery_warning": true, "estimated_hours": 4, "threshold_type": "battery_percentage"}'),
  ('LOW_BATTERY', 'MEDIUM', 15.0, 12.8, 6, 6, '2025-06-25 12:00:00', '{"battery_warning": true, "estimated_hours": 2, "threshold_type": "battery_percentage"}'),
  
  -- Cumulative dose alerts
  ('CUMULATIVE_THRESHOLD', 'HIGH', 5.0, 5.2, 3, 3, '2025-06-25 08:00:00', '{"monthly_limit": 5.0, "current_total": 5.2, "threshold_type": "monthly_cumulative"}'),
  ('CUMULATIVE_THRESHOLD', 'CRITICAL', 10.0, 12.4, 6, 6, '2025-06-25 12:00:00', '{"monthly_limit": 10.0, "current_total": 12.4, "threshold_type": "monthly_cumulative"}'),
  
  -- Calibration due alerts
  ('CALIBRATION_DUE', 'MEDIUM', NULL, NULL, 4, 4, NULL, '{"calibration_due_date": "2025-12-01", "days_remaining": 30, "threshold_type": "calibration_schedule"}'),
  
  -- No data alerts
  ('NO_DATA', 'LOW', NULL, NULL, 7, 7, NULL, '{"last_reading": "2025-06-25 08:00:00", "hours_since_last": 8, "threshold_type": "data_freshness"}');

-- 8. NDC periods (Naval Dosimetry Center reporting periods)
INSERT INTO radiation_ndc_periods (period_start, period_end, ndc_source_doc) VALUES
  ('2025-01-01', '2025-03-31', 'NDC_Q1_2025_Report.pdf'),
  ('2025-04-01', '2025-06-30', 'NDC_Q2_2025_Report.pdf'),
  ('2024-10-01', '2024-12-31', 'NDC_Q4_2024_Report.pdf'),
  ('2024-07-01', '2024-09-30', 'NDC_Q3_2024_Report.pdf');

-- 9. NDC dose records (Official dose records from Naval Dosimetry Center)
INSERT INTO radiation_ndc_dose_records (period_id, personnel_id, hp10_mSv, hp007_mSv, notes) VALUES
  -- Q1 2025
  (1, 1, 0.045, 0.012, 'Quarterly official reading - normal operations'),
  (1, 2, 0.032, 0.008, 'Quarterly official reading - normal operations'),
  (1, 3, 0.078, 0.023, 'Quarterly official reading - normal operations'),
  (1, 4, 0.023, 0.006, 'Quarterly official reading - normal operations'),
  (1, 5, 0.018, 0.005, 'Quarterly official reading - normal operations'),
  (1, 6, 0.089, 0.026, 'Quarterly official reading - normal operations'),
  (1, 7, 0.056, 0.015, 'Quarterly official reading - normal operations'),
  (1, 8, 0.034, 0.009, 'Quarterly official reading - normal operations'),
  (1, 9, 0.021, 0.006, 'Quarterly official reading - normal operations'),
  (1, 10, 0.012, 0.003, 'Quarterly official reading - normal operations'),
  
  -- Q2 2025 (partial - current quarter)
  (2, 1, 0.067, 0.018, 'Quarterly official reading - normal operations'),
  (2, 2, 0.041, 0.011, 'Quarterly official reading - normal operations'),
  (2, 3, 0.089, 0.026, 'Quarterly official reading - normal operations'),
  (2, 4, 0.031, 0.008, 'Quarterly official reading - normal operations'),
  (2, 5, 0.025, 0.007, 'Quarterly official reading - normal operations'),
  (2, 6, 0.123, 0.034, 'Quarterly official reading - elevated levels noted'),
  (2, 7, 0.078, 0.021, 'Quarterly official reading - normal operations'),
  (2, 8, 0.045, 0.012, 'Quarterly official reading - normal operations'),
  (2, 9, 0.028, 0.008, 'Quarterly official reading - normal operations'),
  (2, 10, 0.019, 0.005, 'Quarterly official reading - normal operations');

-- 10. Reconciliations (Operational vs. official dose variance analysis)
INSERT INTO radiation_reconciliations (period_id, personnel_id, op_hp10_mSv, ndc_hp10_mSv, variance_mSv, details) VALUES
  -- Q1 2025 reconciliations
  (1, 1, 0.042, 0.045, -0.003, '{"variance_percent": -6.7, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (1, 2, 0.035, 0.032, 0.003, '{"variance_percent": 9.4, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (1, 3, 0.081, 0.078, 0.003, '{"variance_percent": 3.8, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (1, 4, 0.025, 0.023, 0.002, '{"variance_percent": 8.7, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (1, 5, 0.020, 0.018, 0.002, '{"variance_percent": 11.1, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (1, 6, 0.092, 0.089, 0.003, '{"variance_percent": 3.4, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (1, 7, 0.059, 0.056, 0.003, '{"variance_percent": 5.4, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (1, 8, 0.037, 0.034, 0.003, '{"variance_percent": 8.8, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (1, 9, 0.024, 0.021, 0.003, '{"variance_percent": 14.3, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (1, 10, 0.015, 0.012, 0.003, '{"variance_percent": 25.0, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  
  -- Q2 2025 reconciliations (partial)
  (2, 1, 0.070, 0.067, 0.003, '{"variance_percent": 4.5, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (2, 2, 0.044, 0.041, 0.003, '{"variance_percent": 7.3, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (2, 3, 0.095, 0.089, 0.006, '{"variance_percent": 6.7, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (2, 4, 0.033, 0.031, 0.002, '{"variance_percent": 6.5, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (2, 5, 0.027, 0.025, 0.002, '{"variance_percent": 8.0, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (2, 6, 0.128, 0.123, 0.005, '{"variance_percent": 4.1, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (2, 7, 0.081, 0.078, 0.003, '{"variance_percent": 3.8, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (2, 8, 0.048, 0.045, 0.003, '{"variance_percent": 6.7, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (2, 9, 0.031, 0.028, 0.003, '{"variance_percent": 10.7, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}'),
  (2, 10, 0.022, 0.019, 0.003, '{"variance_percent": 15.8, "within_tolerance": true, "tolerance_limit": 0.01, "notes": "Minor variance, within acceptable range"}');

-- 11. Sample audit log entries
INSERT INTO radiation_audit_log (actor, action, obj_schema, obj_table, obj_id, before, after) VALUES
  ('system', 'CREATE', 'public', 'radiation_units', 1, NULL, '{"uic": "N00001", "name": "USS Ronald Reagan (CVN-76)"}'),
  ('system', 'CREATE', 'public', 'radiation_personnel', 1, NULL, '{"edipi": "1234567890", "rank_rate": "HM2", "lname": "Garcia"}'),
  ('system', 'CREATE', 'public', 'radiation_devices', 1, NULL, '{"serial": "VUE-1234567", "rf_policy": "NORMAL"}'),
  ('admin', 'UPDATE', 'public', 'radiation_devices', 1, '{"rf_policy": "NORMAL"}', '{"rf_policy": "CONTROLLED"}'),
  ('system', 'CREATE', 'public', 'radiation_dose_readings', 1, NULL, '{"device_id": 1, "hp10_mSv": 0.012345}'),
  ('admin', 'ACKNOWLEDGE', 'public', 'radiation_alerts', 1, '{"ack_by": null}', '{"ack_by": "admin", "ack_ts": "2025-06-25T10:00:00Z"}');

-- Display summary of created data
SELECT 'Units created: ' || COUNT(*) as summary FROM radiation_units
UNION ALL
SELECT 'Personnel created: ' || COUNT(*) as summary FROM radiation_personnel
UNION ALL
SELECT 'Device models created: ' || COUNT(*) as summary FROM radiation_device_models
UNION ALL
SELECT 'Devices created: ' || COUNT(*) as summary FROM radiation_devices
UNION ALL
SELECT 'Assignments created: ' || COUNT(*) as summary FROM radiation_assignments
UNION ALL
SELECT 'Dose readings created: ' || COUNT(*) as summary FROM radiation_dose_readings
UNION ALL
SELECT 'Alerts created: ' || COUNT(*) as summary FROM radiation_alerts
UNION ALL
SELECT 'NDC periods created: ' || COUNT(*) as summary FROM radiation_ndc_periods
UNION ALL
SELECT 'NDC dose records created: ' || COUNT(*) as summary FROM radiation_ndc_dose_records
UNION ALL
SELECT 'Reconciliations created: ' || COUNT(*) as summary FROM radiation_reconciliations
UNION ALL
SELECT 'Audit log entries created: ' || COUNT(*) as summary FROM radiation_audit_log;
