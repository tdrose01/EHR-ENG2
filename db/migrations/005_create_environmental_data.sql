CREATE TABLE IF NOT EXISTS environmental_data (
  id SERIAL PRIMARY KEY,
  pm25 NUMERIC,
  pm10 NUMERIC,
  o3 NUMERIC,
  lead NUMERIC,
  arsenic NUMERIC,
  status_air VARCHAR(20),
  status_water VARCHAR(20),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
); 