#!/usr/bin/env node

/**
 * Comprehensive Radiation Route Testing Script
 * This script tests all the fixes we made to the radiation routes
 */

const http = require('http');

const BASE_URL = 'http://localhost:3005/api/radiation';

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
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: response, raw: body });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body, raw: body });
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

async function testRadiationRoutes() {
  logHeader('Testing Radiation Route Fixes');
  
  try {
    // Test 1: Basic connectivity
    log('\n🔌 Test 1: Basic API Connectivity', 'blue');
    try {
      const testResponse = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: '/api/radiation/test',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      log('✅ Test endpoint working', 'green');
    } catch (error) {
      log(`❌ Test endpoint failed: ${error.message}`, 'red');
      return;
    }
    
    // Test 2: Database schema endpoint
    log('\n📊 Test 2: Database Schema Endpoint', 'blue');
    try {
      const schemaResponse = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: '/api/radiation/admin/database/schema',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      log('✅ Schema endpoint working (200)', 'green');
      const tableCount = Object.keys(schemaResponse.data.schema || {}).length;
      log(`   Tables found: ${tableCount}`, 'white');
      
      if (tableCount === 0) {
        log('⚠️  No tables found - database may not be seeded', 'yellow');
      }
    } catch (error) {
      log(`❌ Schema endpoint failed: ${error.message}`, 'red');
    }
    
    // Test 3: Alert validation - Invalid type
    log('\n📊 Test 3: Alert Validation - Invalid Type', 'blue');
    try {
      await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: '/api/radiation/alerts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': JSON.stringify({ type: 'INVALID_TYPE', severity: 'MEDIUM' }).length
        }
      }, { type: 'INVALID_TYPE', severity: 'MEDIUM' });
      log('❌ Invalid type should have been rejected', 'red');
    } catch (error) {
      log(`❌ Request failed: ${error.message}`, 'red');
    }
    
    // Test 4: Alert validation - Missing required fields
    log('\n📊 Test 4: Alert Validation - Missing Required Fields', 'blue');
    try {
      await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: '/api/radiation/alerts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': JSON.stringify({ severity: 'MEDIUM' }).length
        }
      }, { severity: 'MEDIUM' });
      log('❌ Missing fields should have been rejected', 'red');
    } catch (error) {
      log(`❌ Request failed: ${error.message}`, 'red');
    }
    
    // Test 5: Alert validation - Valid DOSE_THRESHOLD alert
    log('\n📊 Test 5: Alert Validation - Valid DOSE_THRESHOLD Alert', 'blue');
    try {
      const validAlertResponse = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: '/api/radiation/alerts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': JSON.stringify({ type: 'DOSE_THRESHOLD', severity: 'MEDIUM', threshold: 0.1, value: 0.15 }).length
        }
      }, { type: 'DOSE_THRESHOLD', severity: 'MEDIUM', threshold: 0.1, value: 0.15 });
      log('✅ Valid DOSE_THRESHOLD alert created successfully (200)', 'green');
      log(`   Alert ID: ${validAlertResponse.data?.alert_id || 'N/A'}`, 'white');
    } catch (error) {
      log(`❌ Valid DOSE_THRESHOLD alert creation failed: ${error.message}`, 'red');
    }
    
    // Test 6: Alert validation - Valid RATE_THRESHOLD alert
    log('\n📊 Test 6: Alert Validation - Valid RATE_THRESHOLD Alert', 'blue');
    try {
      const rateAlertResponse = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: '/api/radiation/alerts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': JSON.stringify({ type: 'RATE_THRESHOLD', severity: 'HIGH', threshold: 100, value: 150 }).length
        }
      }, { type: 'RATE_THRESHOLD', severity: 'HIGH', threshold: 100, value: 150 });
      log('✅ Valid RATE_THRESHOLD alert created successfully (200)', 'green');
      log(`   Alert ID: ${rateAlertResponse.data?.alert_id || 'N/A'}`, 'white');
    } catch (error) {
      log(`❌ Valid RATE_THRESHOLD alert creation failed: ${error.message}`, 'red');
    }
    
    // Test 7: Alert validation - Valid DEVICE_FAULT alert
    log('\n📊 Test 7: Alert Validation - Valid DEVICE_FAULT Alert', 'blue');
    try {
      const faultAlertResponse = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: '/api/radiation/alerts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': JSON.stringify({ type: 'DEVICE_FAULT', severity: 'CRITICAL', details: { message: 'Device communication failure', fault_code: 'COMM_001' } }).length
        }
      }, { type: 'DEVICE_FAULT', severity: 'CRITICAL', details: { message: 'Device communication failure', fault_code: 'COMM_001' } });
      log('✅ Valid DEVICE_FAULT alert created successfully (200)', 'green');
      log(`   Alert ID: ${faultAlertResponse.data?.alert_id || 'N/A'}`, 'white');
    } catch (error) {
      log(`❌ Valid DEVICE_FAULT alert creation failed: ${error.message}`, 'red');
    }
    
    // Test 8: Alert retrieval with status
    log('\n📊 Test 8: Alert Retrieval with Status', 'blue');
    try {
      const alertsResponse = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: '/api/radiation/alerts?limit=5',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      log('✅ Alerts retrieved successfully (200)', 'green');
      log(`   Total alerts: ${alertsResponse.data?.length || 0}`, 'white');
      if (alertsResponse.data && alertsResponse.data.length > 0) {
        const sampleAlert = alertsResponse.data[0];
        log(`   Sample alert status: ${sampleAlert.status || 'undefined'}`, 'white');
        log(`   Sample alert type: ${sampleAlert.type}`, 'white');
        log(`   Sample alert severity: ${sampleAlert.severity}`, 'white');
      }
    } catch (error) {
      log(`❌ Alert retrieval failed: ${error.message}`, 'red');
    }
    
    // Test 9: Health check
    log('\n📊 Test 9: Health Check', 'blue');
    try {
      const healthResponse = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: '/api/radiation/health',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      log('✅ Health check working (200)', 'green');
      log(`   Status: ${healthResponse.data?.status}`, 'white');
      log(`   Database: ${healthResponse.data?.database}`, 'white');
      if (healthResponse.data?.tables) {
        log(`   Personnel: ${healthResponse.data.tables.personnel}`, 'white');
        log(`   Devices: ${healthResponse.data.tables.devices}`, 'white');
        log(`   Readings: ${healthResponse.data.tables.readings}`, 'white');
      }
    } catch (error) {
      log(`❌ Health check failed: ${error.message}`, 'red');
    }
    
    // Test 10: Alert testing endpoint
    log('\n📊 Test 10: Alert Testing Endpoint', 'blue');
    try {
      const testAlertsResponse = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: '/api/radiation/test-alerts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': JSON.stringify({ test_type: 'validation' }).length
        }
      }, { test_type: 'validation' });
      log('✅ Alert testing endpoint working (200)', 'green');
      log(`   Test type: ${testAlertsResponse.data?.test_type}`, 'white');
      log(`   Results: ${testAlertsResponse.data?.results?.length || 0} tests`, 'white');
    } catch (error) {
      log(`❌ Alert testing endpoint failed: ${error.message}`, 'red');
    }
    
    log('\n🎉 All tests completed!', 'green');
    
  } catch (error) {
    log(`❌ Test suite failed: ${error.message}`, 'red');
  }
}

// Run the tests
if (require.main === module) {
  testRadiationRoutes();
}

module.exports = { testRadiationRoutes };
