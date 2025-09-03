const { Pool } = require('pg');

async function testInsert() {
  const pool = new Pool({ 
    connectionString: 'postgresql://postgres:postgres@localhost:5432/ehr-eng2' 
  });

  try {
    console.log('Testing database insert...');
    
    const result = await pool.query(`
      INSERT INTO radiation_navmed_reports (
        report_type, personnel_id, period_start, period_end, 
        prepared_by, date_prepared
      ) VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id
    `, ['ANNUAL', 1, '2024-01-01', '2024-12-31', 'Test User', '2024-12-15']);
    
    console.log('Insert successful, ID:', result.rows[0].id);
    
    // Test query
    const queryResult = await pool.query('SELECT * FROM radiation_navmed_reports WHERE id = $1', [result.rows[0].id]);
    console.log('Retrieved record:', queryResult.rows[0]);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testInsert();
