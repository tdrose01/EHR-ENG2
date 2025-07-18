-- Create login_audit table
CREATE TABLE IF NOT EXISTS login_audit (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create environments table
CREATE TABLE IF NOT EXISTS environments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  last_check TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  api_version TEXT,
  db_status TEXT,
  uptime_seconds INTEGER DEFAULT 0
);


