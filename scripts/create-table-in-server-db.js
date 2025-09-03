const { Pool } = require('pg');

async function createTableInServerDB() {
  // Use the same connection as the server
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'ehr_eng2',
    user: 'postgres',
    password: 'postgres', // Add password
    ssl: false
  });

  try {
    console.log('Creating NAVMED reports table in server database...');
    
    // Create the table
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
    
    console.log('✅ Table created successfully');
    
    // Add foreign key constraint
    try {
      await pool.query(`
        ALTER TABLE radiation_navmed_reports 
        ADD CONSTRAINT fk_navmed_personnel 
        FOREIGN KEY (personnel_id) REFERENCES radiation_personnel(id)
      `);
      console.log('✅ Foreign key constraint added');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Foreign key constraint already exists');
      } else {
        console.log('⚠️ Foreign key constraint error:', error.message);
      }
    }
    
    // Test insert
    const result = await pool.query(`
      INSERT INTO radiation_navmed_reports (
        report_type, personnel_id, period_start, period_end, 
        prepared_by, date_prepared
      ) VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id
    `, ['ANNUAL', 1, '2024-01-01', '2024-12-31', 'Test User', '2024-12-15']);
    
    console.log('✅ Test insert successful, ID:', result.rows[0].id);
    
    // Clean up test record
    await pool.query('DELETE FROM radiation_navmed_reports WHERE id = $1', [result.rows[0].id]);
    console.log('✅ Test record cleaned up');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createTableInServerDB();
