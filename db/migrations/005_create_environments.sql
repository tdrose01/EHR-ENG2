-- Create environments table for system health monitoring
CREATE TABLE IF NOT EXISTS environments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  last_check TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  api_version TEXT,
  db_status TEXT,
  uptime_seconds INTEGER DEFAULT 0
);
