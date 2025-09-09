#!/usr/bin/env node

/**
 * Comprehensive Radiation API Diagnostic and Fix Script
 * Diagnoses and fixes 500 errors and connection issues with radiation API endpoints
 */

const http = require('http');
const { Pool } = require('pg');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function logHeader(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
}

// HTTP request helper
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = body ? JSON.parse(body) : null;
          resolve({ 
            statusCode: res.statusCode, 
            data: response, 
            raw: body,
            headers: res.headers
          });
        } catch (e) {
          resolve({ 
            statusCode: res.statusCode, 
            data: body, 
            raw: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Database connection test
async function testDatabaseConnection() {
  logHeader('DATABASE CONNECTION TEST');
  
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'ehr_eng2',
    user: 'postgres',
    ssl: false,
    max: 5,
    connectionTimeoutMillis: 5000
  });

  try {
    // Test basic connection
    log('Testing database connection...', 'yellow');
    const testResult = await pool.query('SELECT NOW()');
    log('✅ Database connection successful', 'green');
    log(`   Current time: ${testResult.rows[0].now}`, 'white');

    // Check if radiation tables exist
    log('\nChecking radiation tables...', 'yellow');
    const tableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'radiation_%'
      ORDER BY table_name
    `);
    
    if (tableResult.rows.length > 0) {
      log(`✅ Found ${tableResult.rows.length} radiation tables:`, 'green');
      tableResult.rows.forEach(row => {
        log(`   - ${row.table_name}`, 'white');
      });
    } else {
      log('❌ No radiation tables found!', 'red');
      log('   This is likely the cause of the 500 errors.', 'yellow');
      return false;
    }

    // Test specific table access
    log('\nTesting table access...', 'yellow');
    const criticalTables = [
      'radiation_personnel',
      'radiation_devices', 
      'radiation_dose_readings',
      'radiation_alerts',
      'radiation_units'
    ];

    for (const table of criticalTables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        log(`✅ ${table}: ${countResult.rows[0].count} records`, 'green');
      } catch (error) {
        log(`❌ ${table}: ${error.message}`, 'red');
      }
    }

    await pool.end();
    return true;

  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, 'red');
    log('   Check if PostgreSQL is running and accessible', 'yellow');
    await pool.end();
    return false;
  }
}

// Server connectivity test
async function testServerConnectivity() {
  logHeader('SERVER CONNECTIVITY TEST');
  
  try {
    // Test basic server connectivity
    log('Testing server connectivity...', 'yellow');
    const helloResponse = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/hello',
      method: 'GET'
    });

    if (helloResponse.statusCode === 200) {
      log('✅ Server is running and accessible', 'green');
      log(`   Response: ${helloResponse.data?.message || 'No message'}`, 'white');
    } else {
      log(`❌ Server responded with status: ${helloResponse.statusCode}`, 'red');
      log('   Server may not be running or there may be a configuration issue', 'yellow');
      return false;
    }

    // Test radiation test endpoint
    log('\nTesting radiation test endpoint...', 'yellow');
    const testResponse = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/radiation/test',
      method: 'GET'
    });

    if (testResponse.statusCode === 200) {
      log('✅ Radiation routes are accessible', 'green');
      log(`   Response: ${testResponse.data?.message || 'No message'}`, 'white');
    } else {
      log(`❌ Radiation test endpoint failed: ${testResponse.statusCode}`, 'red');
      log(`   Raw response: ${testResponse.raw}`, 'yellow');
    }

    return true;

  } catch (error) {
    log(`❌ Server connectivity test failed: ${error.message}`, 'red');
    log('   Make sure the server is running: npm run start:server', 'yellow');
    return false;
  }
}

// Test all radiation API endpoints
async function testRadiationEndpoints() {
  logHeader('RADIATION API ENDPOINTS TEST');
  
  const endpoints = [
    { name: 'Overview', path: '/api/radiation/overview', method: 'GET' },
    { name: 'Personnel', path: '/api/radiation/personnel', method: 'GET' },
    { name: 'Devices', path: '/api/radiation/devices', method: 'GET' },
    { name: 'Readings', path: '/api/radiation/readings?limit=50', method: 'GET' },
    { name: 'Alerts', path: '/api/radiation/alerts', method: 'GET' },
    { name: 'Units', path: '/api/radiation/units', method: 'GET' },
    { name: 'Assignments', path: '/api/radiation/assignments?active_only=true', method: 'GET' },
    { name: 'Reconciliations', path: '/api/radiation/reconciliations', method: 'GET' },
    { name: 'Device Models', path: '/api/radiation/device-models', method: 'GET' }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const endpoint of endpoints) {
    try {
      log(`Testing ${endpoint.name}...`, 'yellow');
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: endpoint.path,
        method: endpoint.method
      });

      if (response.statusCode === 200) {
        log(`✅ ${endpoint.name}: Success (200)`, 'green');
        if (Array.isArray(response.data)) {
          log(`   Records returned: ${response.data.length}`, 'white');
        } else if (response.data && typeof response.data === 'object') {
          log(`   Response keys: ${Object.keys(response.data).join(', ')}`, 'white');
        }
        successCount++;
      } else {
        log(`❌ ${endpoint.name}: Failed (${response.statusCode})`, 'red');
        log(`   Error: ${response.data?.error || response.raw}`, 'yellow');
        errorCount++;
      }
    } catch (error) {
      log(`❌ ${endpoint.name}: Request failed - ${error.message}`, 'red');
      errorCount++;
    }
  }

  log(`\n📊 Test Results: ${successCount} successful, ${errorCount} failed`, 
      errorCount === 0 ? 'green' : 'yellow');
  
  return errorCount === 0;
}

// Create missing tables if needed
async function createMissingTables() {
  logHeader('CREATING MISSING TABLES');
  
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'ehr_eng2',
    user: 'postgres',
    ssl: false
  });

  try {
    // Check if we need to run migrations
    log('Checking if radiation tables exist...', 'yellow');
    const tableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'radiation_%'
    `);

    if (tableResult.rows.length === 0) {
      log('No radiation tables found. Creating them...', 'yellow');
      
      // Read and execute the radiation tables migration
      const fs = require('fs');
      const path = require('path');
      const migrationPath = path.join(__dirname, '..', 'db', 'migrations', '008_create_radiation_health_tables.sql');
      
      if (fs.existsSync(migrationPath)) {
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        await pool.query(migrationSQL);
        log('✅ Radiation tables created successfully', 'green');
      } else {
        log('❌ Migration file not found: 008_create_radiation_health_tables.sql', 'red');
        return false;
      }
    } else {
      log(`✅ Found ${tableResult.rows.length} existing radiation tables`, 'green');
    }

    await pool.end();
    return true;

  } catch (error) {
    log(`❌ Failed to create tables: ${error.message}`, 'red');
    await pool.end();
    return false;
  }
}

// Main diagnostic function
async function diagnoseRadiationAPI() {
  logHeader('RADIATION API DIAGNOSTIC TOOL');
  log('This tool will diagnose and fix radiation API issues', 'white');
  
  let allTestsPassed = true;

  // Step 1: Test database connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    allTestsPassed = false;
    log('\n💡 Database fix suggestions:', 'yellow');
    log('   1. Ensure PostgreSQL is running', 'white');
    log('   2. Check database credentials in server/db.js', 'white');
    log('   3. Verify database "ehr_eng2" exists', 'white');
    log('   4. Run migrations to create radiation tables', 'white');
  }

  // Step 2: Test server connectivity
  const serverRunning = await testServerConnectivity();
  if (!serverRunning) {
    allTestsPassed = false;
    log('\n💡 Server fix suggestions:', 'yellow');
    log('   1. Start the server: npm run start:server', 'white');
    log('   2. Check if port 3005 is available', 'white');
    log('   3. Verify no firewall is blocking the connection', 'white');
  }

  // Step 3: Create missing tables if needed
  if (dbConnected && serverRunning) {
    const tablesCreated = await createMissingTables();
    if (!tablesCreated) {
      allTestsPassed = false;
    }
  }

  // Step 4: Test radiation endpoints
  if (dbConnected && serverRunning) {
    const endpointsWorking = await testRadiationEndpoints();
    if (!endpointsWorking) {
      allTestsPassed = false;
    }
  }

  // Summary
  logHeader('DIAGNOSTIC SUMMARY');
  if (allTestsPassed) {
    log('🎉 All tests passed! Radiation API should be working correctly.', 'green');
  } else {
    log('❌ Some issues were found. Please address the suggestions above.', 'red');
    log('\n🔧 Quick fixes to try:', 'yellow');
    log('   1. Restart the server: npm run start:server', 'white');
    log('   2. Check database connection and run migrations', 'white');
    log('   3. Verify all required tables exist', 'white');
  }

  return allTestsPassed;
}

// Run the diagnostic
if (require.main === module) {
  diagnoseRadiationAPI().catch(console.error);
}

module.exports = { diagnoseRadiationAPI };
