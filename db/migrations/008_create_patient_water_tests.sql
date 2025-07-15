CREATE TABLE IF NOT EXISTS patient_water_tests (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  lead NUMERIC,
  arsenic NUMERIC,
  status VARCHAR(20),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
