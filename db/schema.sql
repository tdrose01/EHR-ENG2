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
