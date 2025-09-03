const { Pool } = require('pg');

async function checkDatabases() {
  const databases = [
    { name: 'ehr-eng2', connectionString: 'postgresql://postgres:postgres@localhost:5432/ehr-eng2' },
    { name: 'ehr_eng2', connectionString: 'postgresql://postgres:postgres@localhost:5432/ehr_eng2' }
  ];

  for (const db of databases) {
    console.log(`\nChecking database: ${db.name}`);
    const pool = new Pool({ connectionString: db.connectionString });
    
    try {
      // Check if database exists and is accessible
      const testResult = await pool.query('SELECT NOW()');
      console.log(`✅ Database ${db.name} is accessible`);
      
      // Check for NAVMED table
      const tableResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'radiation_navmed_reports'
      `);
      console.log(`📋 NAVMED table exists: ${tableResult.rows.length > 0}`);
      
      // Check for personnel table
      const personnelResult = await pool.query(`
        SELECT COUNT(*) as count 
        FROM radiation_personnel
      `);
      console.log(`👥 Personnel records: ${personnelResult.rows[0].count}`);
      
      // Check for existing NAVMED reports
      if (tableResult.rows.length > 0) {
        const reportsResult = await pool.query(`
          SELECT COUNT(*) as count 
          FROM radiation_navmed_reports
        `);
        console.log(`📊 NAVMED reports: ${reportsResult.rows[0].count}`);
      }
      
    } catch (error) {
      console.log(`❌ Database ${db.name} error: ${error.message}`);
    } finally {
      await pool.end();
    }
  }
}

checkDatabases();
