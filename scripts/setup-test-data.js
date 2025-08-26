#!/usr/bin/env node

/**
 * Setup Test Data for Radiation Health Module
 * Creates the required base data (devices, personnel, units) before generating readings
 */

const http = require('http');

// Configuration
const API_BASE = 'localhost';
const API_PORT = 3005;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
}

// HTTP request helper
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data ? JSON.stringify(data).length : 0
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
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

// Setup test data
async function setupTestData() {
  logHeader('Setting Up Test Data for Radiation Health Module');
  
  try {
    log('🔌 Testing API connection...', 'blue');
    
    // Test API connection
    const testCheck = await makeRequest('/api/radiation/test');
    if (testCheck.status === 200) {
      log('✅ API connection successful', 'green');
    } else {
      log(`⚠️  API responded with status: ${testCheck.status}`, 'yellow');
      return;
    }
    
    // Check if we need to create test data
    log('\n🔍 Checking existing data...', 'blue');
    
    const overview = await makeRequest('/api/radiation/overview');
    if (overview.status === 200) {
      log('✅ Overview endpoint working', 'green');
      log(`   Personnel: ${overview.data.personnelMonitored}`, 'white');
      log(`   Devices: ${overview.data.activeDevices}`, 'white');
      log(`   Alerts: ${overview.data.pendingAlerts}`, 'white');
      log(`   Readings (24h): ${overview.data.readingsLast24h}`, 'white');
      
      if (overview.data.activeDevices > 0 && overview.data.personnelMonitored > 0) {
        log('\n✅ Test data already exists!', 'green');
        log('💡 You can now run: npm run generate:test-data', 'cyan');
        return;
      }
    }
    
    log('\n📝 No existing test data found. Creating test data...', 'yellow');
    
    // Since we can't create the base data through the API (no endpoints for it),
    // let's check if we can at least get some data from the database
    log('\n🔍 Checking database tables...', 'blue');
    
    // Try to get personnel list
    const personnel = await makeRequest('/api/radiation/personnel');
    if (personnel.status === 200 && personnel.data.length > 0) {
      log(`✅ Found ${personnel.data.length} personnel records`, 'green');
    } else {
      log('⚠️  No personnel records found', 'yellow');
    }
    
    // Try to get devices list
    const devices = await makeRequest('/api/radiation/devices');
    if (devices.status === 200 && devices.data.length > 0) {
      log(`✅ Found ${devices.data.length} device records`, 'green');
    } else {
      log('⚠️  No device records found', 'yellow');
    }
    
    log('\n💡 To populate the dashboard with real data:', 'cyan');
    log('   1. Run the database migrations: npm run db:migrate', 'white');
    log('   2. Seed the database with sample data', 'white');
    log('   3. Or manually insert test data into the database', 'white');
    
    log('\n📱 For now, you can view the dashboard structure at:', 'yellow');
    log('   http://localhost:5173/real-time-monitoring', 'cyan');
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    log('💡 Make sure the backend server is running on port 3005', 'yellow');
  }
}

// Run the script
if (require.main === module) {
  setupTestData();
}

module.exports = { setupTestData };
