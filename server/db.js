const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ehr_eng2',
  user: 'postgres',
  // No password - using Windows authentication
  ssl: false,
  // Memory optimization settings
  max: 10,                    // Maximum number of clients in the pool
  min: 2,                     // Minimum number of clients in the pool
  idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
  maxUses: 7500,              // Close (and replace) a connection after it has been used this many times
  allowExitOnIdle: true       // Allow the pool to close all connections and exit
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Database connected successfully');
  }
});

module.exports = pool;
