-- Schema for ehr-eng2 database
-- Run the CREATE DATABASE statement first while connected to the default 'postgres' database

CREATE DATABASE "ehr-eng2";

\c "ehr-eng2";

-- Users table storing login credentials
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Audit table for recording login attempts
CREATE TABLE login_audit (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Example admin user for testing
INSERT INTO users (email, password_hash)
VALUES (
  'admin@example.com',
  '$2b$10$jeY.en9U2c2J9gAQYZAas.yEGkAwwQ.GTsQqiQ5VLzyUASDs5MmRW'
);

-- Grant necessary permissions to the web user
CREATE USER web WITH PASSWORD 'webpass';
GRANT ALL PRIVILEGES ON DATABASE "ehr-eng2" TO web;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO web;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO web;

