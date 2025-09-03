const { Pool } = require('pg');

async function checkAndCreateTable() {
  const pool = new Pool({ 
    connectionString: 'postgresql://postgres:postgres@localhost:5432/ehr-eng2' 
  });

  try {
    // Check if table exists
    const checkResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'radiation_navmed_reports'
    `);
    
    console.log('Table exists:', checkResult.rows.length > 0);
    
    if (checkResult.rows.length === 0) {
      console.log('Creating table...');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS radiation_navmed_reports (
          id SERIAL PRIMARY KEY,
          report_type VARCHAR(50) NOT NULL,
          personnel_id INTEGER NOT NULL,
          period_start DATE NOT NULL,
          period_end DATE NOT NULL,
          calendar_year INTEGER,
          deep_dose_msv DECIMAL(10,6) DEFAULT 0,
          shallow_dose_msv DECIMAL(10,6) DEFAULT 0,
          extremity_dose_msv DECIMAL(10,6) DEFAULT 0,
          internal_dose_msv DECIMAL(10,6) DEFAULT 0,
          limit_exceeded VARCHAR(50),
          discovery_date DATE,
          exposure_circumstances TEXT,
          prepared_by VARCHAR(100) NOT NULL,
          date_prepared DATE NOT NULL,
          rso_signature VARCHAR(100),
          command_signature VARCHAR(100),
          comments TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      
      console.log('Table created successfully');
    } else {
      console.log('Table already exists');
    }
    
    // Test a simple query
    const testResult = await pool.query('SELECT COUNT(*) as count FROM radiation_navmed_reports');
    console.log('Current records:', testResult.rows[0].count);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAndCreateTable();
