-- Seed data for Navy Environmental Health Tracker tables

-- 1. Exposure Events
INSERT INTO navy_exposure_events (date, event, type, location, exposure_level, affected_personnel, status) VALUES
  ('2025-06-20', 'Burn Pit Smoke', 'Airborne Particulate', 'Al Udeid AB', 'High', 14, 'Monitoring'),
  ('2025-05-15', 'Noise > 85dB', 'Acoustic', 'Shipboard Engine Room', 'Moderate', 6, 'Audiograms Ordered');

-- 2. Biological Test Results
INSERT INTO navy_bio_tests (name, test_type, sample_date, result, reference_range, status) VALUES
  ('SNM, John', 'Blood Lead Level', '2025-06-22', '12 µg/dL', '<5 µg/dL', 'Flagged'),
  ('SMN, Ashley', 'Urinary Mercury', '2025-06-21', '1.5 µg/g creatinine', '<5 µg/g', 'Normal');

-- 3. Medical Surveillance Compliance
INSERT INTO navy_med_surveillance (personnel, nec, required_exam, last_exam, next_due, compliant) VALUES
  ('HM2 Garcia', '8404', 'Asbestos Medical Exam', '2024-11-12', '2025-11-12', true),
  ('EN3 Ramos', '4231', 'Hearing Conservation', '2025-01-01', '2026-01-01', true),
  ('SNM, John', '0000', 'Blood Lead Surveillance', '2025-06-22', '2026-06-22', false);

-- 4. Deployment Environmental Logs
INSERT INTO navy_deployment_logs (deployment, dates, exposure_type, monitoring_type, results_available) VALUES
  ('CENTCOM', 'Jan–May 2025', 'VOCs, PM10', 'Air Samples, Biomarkers', true),
  ('PACFLT', 'Mar–Jul 2024', 'Noise, PM2.5', 'Dosimetry, Air Samples', false); 