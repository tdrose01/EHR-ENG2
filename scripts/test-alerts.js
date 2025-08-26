#!/usr/bin/env node

/**
 * Test Script for Radiation Alerts
 * Tests alert creation, retrieval, and validation
 */

const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3005';
const API_BASE = `${BASE_URL}/api/radiation`;

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

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : null;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsed,
            raw: responseData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            raw: responseData,
            parseError: error.message
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

async function testAlertCreation() {
  log('\n🔔 Testing Alert Creation', 'cyan');
  log('=' * 50, 'cyan');
  
  // Test 1: Basic DOSE_THRESHOLD alert
  log('\n📊 Test 1: Basic DOSE_THRESHOLD Alert', 'yellow');
  const basicAlert = {
    type: 'DOSE_THRESHOLD',
    severity: 'MEDIUM',
    threshold: 0.5,
    value: 0.75,
    device_id: 1,
    personnel_id: 1,
    measured_ts: new Date().toISOString(),
    details: {
      message: 'Dose threshold exceeded',
      threshold_type: 'hourly',
      unit: 'mSv'
    }
  };
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/radiation/alerts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(basicAlert).length
      }
    }, basicAlert);
    
    if (response.statusCode === 201 || response.statusCode === 200) {
      log(`✅ Basic alert created successfully (${response.statusCode})`, 'green');
      log(`   Alert ID: ${response.data?.id || 'N/A'}`, 'green');
    } else {
      log(`❌ Basic alert creation failed (${response.statusCode})`, 'red');
      log(`   Error: ${response.data?.error || response.raw}`, 'red');
    }
  } catch (error) {
    log(`❌ Basic alert request failed: ${error.message}`, 'red');
  }
  
  // Test 2: RATE_THRESHOLD alert
  log('\n📊 Test 2: RATE_THRESHOLD Alert', 'yellow');
  const rateAlert = {
    type: 'RATE_THRESHOLD',
    severity: 'HIGH',
    threshold: 100,
    value: 150,
    device_id: 1,
    personnel_id: 1,
    measured_ts: new Date().toISOString(),
    details: {
      message: 'Rate threshold exceeded',
      threshold_type: 'instantaneous',
      unit: 'μSv/h'
    }
  };
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/radiation/alerts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(rateAlert).length
      }
    }, rateAlert);
    
    if (response.statusCode === 201 || response.statusCode === 200) {
      log(`✅ Rate alert created successfully (${response.statusCode})`, 'green');
      log(`   Alert ID: ${response.data?.id || 'N/A'}`, 'green');
    } else {
      log(`❌ Rate alert creation failed (${response.statusCode})`, 'red');
      log(`   Error: ${response.data?.error || response.raw}`, 'red');
    }
  } catch (error) {
    log(`❌ Rate alert request failed: ${error.message}`, 'red');
  }
  
  // Test 3: DEVICE_FAULT alert
  log('\n📊 Test 3: DEVICE_FAULT Alert', 'yellow');
  const faultAlert = {
    type: 'DEVICE_FAULT',
    severity: 'CRITICAL',
    threshold: null,
    value: null,
    device_id: 1,
    personnel_id: null,
    measured_ts: new Date().toISOString(),
    details: {
      message: 'Device communication failure',
      fault_code: 'COMM_001',
      fault_description: 'Lost connection to radiation sensor'
    }
  };
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/radiation/alerts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(faultAlert).length
      }
    }, faultAlert);
    
    if (response.statusCode === 201 || response.statusCode === 200) {
      log(`✅ Fault alert created successfully (${response.statusCode})`, 'green');
      log(`   Alert ID: ${response.data?.id || 'N/A'}`, 'green');
    } else {
      log(`❌ Fault alert creation failed (${response.statusCode})`, 'red');
      log(`   Error: ${response.data?.error || response.raw}`, 'red');
    }
  } catch (error) {
    log(`❌ Fault alert request failed: ${error.message}`, 'red');
  }
}

async function testAlertRetrieval() {
  log('\n🔍 Testing Alert Retrieval', 'cyan');
  log('=' * 50, 'cyan');
  
  // Test 1: Get all alerts
  log('\n📊 Test 1: Get All Alerts', 'yellow');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/radiation/alerts',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.statusCode === 200) {
      log(`✅ Alerts retrieved successfully (${response.statusCode})`, 'green');
      log(`   Total alerts: ${response.data?.length || 0}`, 'green');
      
      if (response.data && response.data.length > 0) {
        const sampleAlert = response.data[0];
        log(`   Sample alert:`, 'cyan');
        log(`     ID: ${sampleAlert.id}`, 'white');
        log(`     Type: ${sampleAlert.type}`, 'white');
        log(`     Severity: ${sampleAlert.severity}`, 'white');
        log(`     Status: ${sampleAlert.status}`, 'white');
      }
    } else {
      log(`❌ Alert retrieval failed (${response.statusCode})`, 'red');
      log(`   Error: ${response.data?.error || response.raw}`, 'red');
    }
  } catch (error) {
    log(`❌ Alert retrieval request failed: ${error.message}`, 'red');
  }
  
  // Test 2: Get alerts by type
  log('\n📊 Test 2: Get Alerts by Type (DOSE_THRESHOLD)', 'yellow');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/radiation/alerts?type=DOSE_THRESHOLD',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.statusCode === 200) {
      log(`✅ Type-filtered alerts retrieved (${response.statusCode})`, 'green');
      log(`   DOSE_THRESHOLD alerts: ${response.data?.length || 0}`, 'green');
    } else {
      log(`❌ Type-filtered alert retrieval failed (${response.statusCode})`, 'red');
      log(`   Error: ${response.data?.error || response.raw}`, 'red');
    }
  } catch (error) {
    log(`❌ Type-filtered alert request failed: ${error.message}`, 'red');
  }
  
  // Test 3: Get alerts by severity
  log('\n📊 Test 3: Get Alerts by Severity (MEDIUM)', 'yellow');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/radiation/alerts?severity=MEDIUM',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.statusCode === 200) {
      log(`✅ Severity-filtered alerts retrieved (${response.statusCode})`, 'green');
      log(`   MEDIUM severity alerts: ${response.data?.length || 0}`, 'green');
    } else {
      log(`❌ Severity-filtered alert retrieval failed (${response.statusCode})`, 'red');
      log(`   Error: ${response.data?.error || response.raw}`, 'red');
    }
  } catch (error) {
    log(`❌ Severity-filtered alert request failed: ${error.message}`, 'red');
  }
}

async function testAlertValidation() {
  log('\n🔍 Testing Alert Validation', 'cyan');
  log('=' * 50, 'cyan');
  
  // Test 1: Invalid alert type
  log('\n📊 Test 1: Invalid Alert Type', 'yellow');
  const invalidTypeAlert = {
    type: 'INVALID_TYPE',
    severity: 'MEDIUM',
    threshold: 0.5,
    value: 0.75,
    device_id: 1,
    personnel_id: 1,
    measured_ts: new Date().toISOString(),
    details: {
      message: 'Invalid type test'
    }
  };
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/radiation/alerts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(invalidTypeAlert).length
      }
    }, invalidTypeAlert);
    
    if (response.statusCode === 400) {
      log(`✅ Invalid type properly rejected (${response.statusCode})`, 'green');
    } else {
      log(`❌ Invalid type should have been rejected (${response.statusCode})`, 'red');
    }
  } catch (error) {
    log(`❌ Invalid type test failed: ${error.message}`, 'red');
  }
  
  // Test 2: Missing required fields
  log('\n📊 Test 2: Missing Required Fields', 'yellow');
  const incompleteAlert = {
    type: 'DOSE_THRESHOLD',
    severity: 'MEDIUM'
    // Missing required fields
  };
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/radiation/alerts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(incompleteAlert).length
      }
    }, incompleteAlert);
    
    if (response.statusCode === 400) {
      log(`✅ Incomplete alert properly rejected (${response.statusCode})`, 'green');
    } else {
      log(`❌ Incomplete alert should have been rejected (${response.statusCode})`, 'red');
    }
  } catch (error) {
    log(`❌ Incomplete alert test failed: ${error.message}`, 'red');
  }
  
  // Test 3: Invalid JSON in details
  log('\n📊 Test 3: Invalid JSON in Details', 'yellow');
  const invalidJsonAlert = {
    type: 'DOSE_THRESHOLD',
    severity: 'MEDIUM',
    threshold: 0.5,
    value: 0.75,
    device_id: 1,
    personnel_id: 1,
    measured_ts: new Date().toISOString(),
    details: 'This should be an object, not a string'
  };
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/radiation/alerts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(invalidJsonAlert).length
      }
    }, invalidJsonAlert);
    
    if (response.statusCode === 400) {
      log(`✅ Invalid JSON details properly rejected (${response.statusCode})`, 'green');
    } else {
      log(`❌ Invalid JSON details should have been rejected (${response.statusCode})`, 'red');
    }
  } catch (error) {
    log(`❌ Invalid JSON details test failed: ${error.message}`, 'red');
  }
}

async function testDatabaseSchema() {
  log('\n🗄️ Testing Database Schema', 'cyan');
  log('=' * 50, 'cyan');
  
  // Test 1: Check radiation_alerts table structure
  log('\n📊 Test 1: Check Alerts Table Structure', 'yellow');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/admin/database/schema?table=radiation_alerts',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.statusCode === 200) {
      log(`✅ Schema retrieved successfully (${response.statusCode})`, 'green');
      if (response.data) {
        log(`   Table: ${response.data.table_name}`, 'white');
        log(`   Columns: ${response.data.columns?.length || 0}`, 'white');
      }
    } else {
      log(`❌ Schema retrieval failed (${response.statusCode})`, 'red');
      log(`   Error: ${response.data?.error || response.raw}`, 'red');
    }
  } catch (error) {
    log(`❌ Schema request failed: ${error.message}`, 'red');
  }
  
  // Test 2: Check for JSON columns
  log('\n📊 Test 2: Check JSON Column Types', 'yellow');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/admin/database/schema?table=radiation_alerts',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.statusCode === 200 && response.data?.columns) {
      const jsonColumns = response.data.columns.filter(col => 
        col.data_type === 'json' || col.data_type === 'jsonb'
      );
      
      if (jsonColumns.length > 0) {
        log(`✅ Found JSON columns:`, 'green');
        jsonColumns.forEach(col => {
          log(`   - ${col.column_name}: ${col.data_type}`, 'white');
        });
      } else {
        log(`❌ No JSON columns found in radiation_alerts table`, 'red');
      }
    } else {
      log(`❌ Could not check column types`, 'red');
    }
  } catch (error) {
    log(`❌ Column type check failed: ${error.message}`, 'red');
  }
}

async function runAllTests() {
  log('🚀 Starting Comprehensive Alert Testing Suite', 'bright');
  log('=' * 60, 'bright');
  
  try {
    await testAlertCreation();
    await testAlertRetrieval();
    await testAlertValidation();
    await testDatabaseSchema();
    
    log('\n🎉 All tests completed!', 'bright');
    log('=' * 60, 'bright');
    
  } catch (error) {
    log(`\n💥 Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testAlertCreation,
  testAlertRetrieval,
  testAlertValidation,
  testDatabaseSchema,
  runAllTests
};
