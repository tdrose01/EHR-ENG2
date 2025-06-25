-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    last_login_at TIMESTAMPTZ,
    last_login TIMESTAMP
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  last_login_at TIMESTAMPTZ
);

-- Create login_audit table
CREATE TABLE IF NOT EXISTS login_audit (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drop existing patients table if exists
DROP TABLE IF EXISTS patients;

-- Create patients table
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(50),
  blood_type VARCHAR(5),
  rh_factor VARCHAR(10),
  duty_status VARCHAR(50),
  pid VARCHAR(50) UNIQUE,
  paygrade VARCHAR(5),
  branch_of_service VARCHAR(50),
  ethnicity VARCHAR(50),
  religion VARCHAR(50),
  dod_id BIGINT UNIQUE,
  date_of_birth DATE,
  phone_number VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Insert default admin user if not exists
INSERT INTO users (email, password_hash, role)
SELECT 'admin@example.com', '$2a$10$zPzBqiVZwH1jJQX1H6mOY.kF8LyU1K89Y.j.ZjIqGKZYd.JnSbGqK', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com');
