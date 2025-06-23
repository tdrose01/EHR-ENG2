-- Add last_login_at column to users table
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
