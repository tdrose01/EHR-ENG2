#!/usr/bin/env node

/**
 * Test Data Structure for Real-Time Chart
 * Verifies the data structure being passed to the chart component
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

// Test data structure
async function testDataStructure() {
  logHeader('Testing Data Structure for Real-Time Chart');
  
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
    
    // Get recent readings
    log('\n📊 Testing recent readings endpoint...', 'blue');
    
    const readingsResponse = await makeRequest('/api/radiation/readings?limit=5');
    if (readingsResponse.status === 200) {
      log('✅ Recent readings endpoint working', 'green');
      log(`   Found ${readingsResponse.data.length} readings`, 'white');
      
      if (readingsResponse.data.length > 0) {
        const sampleReading = readingsResponse.data[0];
        log('\n📋 Sample reading data structure:', 'yellow');
        log(`   ID: ${sampleReading.id}`, 'white');
        log(`   HP10 (mSv): ${sampleReading.hp10_msv}`, 'white');
        log(`   HP007 (mSv): ${sampleReading.hp007_msv}`, 'white');
        log(`   Rate (µSv/h): ${sampleReading.rate_usv_h}`, 'white');
        log(`   Timestamp: ${sampleReading.measured_ts}`, 'white');
        
        // Show all properties
        log('\n🔍 All properties:', 'cyan');
        Object.keys(sampleReading).forEach(key => {
          log(`   ${key}: ${sampleReading[key]} (${typeof sampleReading[key]})`, 'white');
        });
        
        // Check if properties exist
        log('\n🔍 Property existence check:', 'cyan');
        log(`   hp10_msv exists: ${sampleReading.hasOwnProperty('hp10_msv')}`, 'white');
        log(`   hp007_msv exists: ${sampleReading.hasOwnProperty('hp007_msv')}`, 'white');
        log(`   rate_usv_h exists: ${sampleReading.hasOwnProperty('rate_usv_h')}`, 'white');
        
        // Check data types
        log('\n📊 Data type check:', 'cyan');
        log(`   hp10_msv type: ${typeof sampleReading.hp10_msv}`, 'white');
        log(`   hp007_msv type: ${typeof sampleReading.hp007_msv}`, 'white');
        log(`   rate_usv_h type: ${typeof sampleReading.rate_usv_h}`, 'white');
        
        // Check for null/undefined values
        log('\n⚠️  Null/undefined check:', 'cyan');
        log(`   hp10_msv is null/undefined: ${sampleReading.hp10_msv == null}`, 'white');
        log(`   hp007_msv is null/undefined: ${sampleReading.hp007_msv == null}`, 'white');
        log(`   rate_usv_h is null/undefined: ${sampleReading.rate_usv_h == null}`, 'white');
        
        // Check for empty strings
        log('\n⚠️  Empty string check:', 'cyan');
        log(`   hp10_msv is empty string: ${sampleReading.hp10_msv === ''}`, 'white');
        log(`   hp007_msv is empty string: ${sampleReading.hp007_msv === ''}`, 'white');
        log(`   rate_usv_h is empty string: ${sampleReading.rate_usv_h === ''}`, 'white');
        
      } else {
        log('⚠️  No readings found', 'yellow');
      }
    } else {
      log(`⚠️  Recent readings endpoint failed: ${readingsResponse.status}`, 'yellow');
    }
    
    // Test overview endpoint
    log('\n📈 Testing overview endpoint...', 'blue');
    
    const overviewResponse = await makeRequest('/api/radiation/overview');
    if (overviewResponse.status === 200) {
      log('✅ Overview endpoint working', 'green');
      log(`   Personnel: ${overviewResponse.data.personnelMonitored}`, 'white');
      log(`   Devices: ${overviewResponse.data.activeDevices}`, 'white');
      log(`   Alerts: ${overviewResponse.data.pendingAlerts}`, 'white');
      log(`   Readings (24h): ${overviewResponse.data.readingsLast24h}`, 'white');
    } else {
      log(`⚠️  Overview endpoint failed: ${overviewResponse.status}`, 'yellow');
    }
    
    log('\n🎯 Data structure test complete!', 'green');
    log('💡 Check the output above for any data structure issues', 'cyan');
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    log('💡 Make sure the backend server is running on port 3005', 'yellow');
  }
}

// Run the script
if (require.main === module) {
  testDataStructure();
}

module.exports = { testDataStructure };
