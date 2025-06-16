const { Pool } = require('pg');

let pool;

if (process.env.DATABASE_URL === 'memory') {
  const { newDb } = require('pg-mem');
  const db = newDb();

  // Basic schema and seed data for development and tests
  db.public.none(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      password_hash TEXT,
      role TEXT
    );
    INSERT INTO users (email, password_hash, role) VALUES (
      'admin@example.com',
      '$2b$10$rADXbm4c3vmB.S3gyjBsve1UU5BkLPcJD2RQGHBrvA2V7u0g473t2',
      'admin'
    );

    CREATE TABLE login_audit (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      action TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE patients (
      id SERIAL PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      gender TEXT,
      marital_status TEXT,
      blood_type TEXT,
      date_of_birth DATE,
      phone_number TEXT,
      insurance_provider TEXT,
      insurance_id TEXT,
      is_active BOOLEAN DEFAULT true
    );
    INSERT INTO patients (
      first_name,
      last_name,
      gender,
      marital_status,
      blood_type,
      date_of_birth,
      phone_number,
      insurance_provider,
      insurance_id,
      is_active
    ) VALUES (
      'John', 'Doe', 'Male', 'Single', 'O+',
      '1990-01-01', '1234567890', 'ACME', '1111', true
    );
  `);

  const Adapter = db.adapters.createPg();
  pool = new Adapter.Pool();
} else {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  // Test the connection
  pool.query('SELECT NOW()', (err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      console.log('Database connected successfully');
    }
  });
}

module.exports = pool;
