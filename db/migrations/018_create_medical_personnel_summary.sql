-- Migration: Create medical personnel summary table

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
