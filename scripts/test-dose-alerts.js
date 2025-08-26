#!/usr/bin/env node

/**
 * Focused Test for DOSE_THRESHOLD Alerts
 * Identifies why DOSE_THRESHOLD alerts are failing
 */

const http = require('http');

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

async function testDoseThresholdAlerts() {
  log('\n🔍 Testing DOSE_THRESHOLD Alert Creation', 'cyan');
  log('=' * 60, 'cyan');
  
  // Test 1: Basic DOSE_THRESHOLD with minimal fields
  log('\n📊 Test 1: Minimal DOSE_THRESHOLD Alert', 'yellow');
  const minimalAlert = {
    type: 'DOSE_THRESHOLD',
    severity: 'MEDIUM'
  };
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/radiation/alerts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(minimalAlert).length
      }
    }, minimalAlert);
    
    log(`   Response: ${response.statusCode}`, response.statusCode >= 400 ? 'red' : 'green');
    if (response.statusCode >= 400) {
      log(`   Error: ${response.raw}`, 'red');
    } else {
      log(`   Success! Alert ID: ${response.data?.alert_id || 'N/A'}`, 'green');
    }
  } catch (error) {
    log(`   Request failed: ${error.message}`, 'red');
  }
  
  // Test 2: DOSE_THRESHOLD with all fields
  log('\n📊 Test 2: Complete DOSE_THRESHOLD Alert', 'yellow');
  const completeAlert = {
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
      unit: 'mSv',
      exceeded_by: '50%'
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
        'Content-Length': JSON.stringify(completeAlert).length
      }
    }, completeAlert);
    
    log(`   Response: ${response.statusCode}`, response.statusCode >= 400 ? 'red' : 'green');
    if (response.statusCode >= 400) {
      log(`   Error: ${response.raw}`, 'red');
    } else {
      log(`   Success! Alert ID: ${response.data?.alert_id || 'N/A'}`, 'green');
    }
  } catch (error) {
    log(`   Request failed: ${error.message}`, 'red');
  }
  
  // Test 3: Compare with working DEVICE_FAULT alert
  log('\n📊 Test 3: Working DEVICE_FAULT Alert (Control)', 'yellow');
  const workingAlert = {
    type: 'DEVICE_FAULT',
    severity: 'CRITICAL',
    device_id: 1,
    details: {
      message: 'Device communication failure',
      fault_code: 'COMM_001'
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
        'Content-Length': JSON.stringify(workingAlert).length
      }
    }, workingAlert);
    
    log(`   Response: ${response.statusCode}`, response.statusCode >= 400 ? 'red' : 'green');
    if (response.statusCode >= 400) {
      log(`   Error: ${response.raw}`, 'red');
    } else {
      log(`   Success! Alert ID: ${response.data?.alert_id || 'N/A'}`, 'green');
    }
  } catch (error) {
    log(`   Request failed: ${error.message}`, 'red');
  }
  
  // Test 4: Check if there are any database triggers or constraints
  log('\n📊 Test 4: Check for Database Constraints', 'yellow');
  
  // Try to get existing DOSE_THRESHOLD alerts to see if they exist
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
    
    if (response.statusCode === 200 && response.data) {
      log(`   Found ${response.data.length} existing DOSE_THRESHOLD alerts`, 'green');
      if (response.data.length > 0) {
        const sample = response.data[0];
        log(`   Sample alert:`, 'white');
        log(`     ID: ${sample.id}`, 'white');
        log(`     Type: ${sample.type}`, 'white');
        log(`     Severity: ${sample.severity}`, 'white');
        log(`     Threshold: ${sample.threshold}`, 'white');
        log(`     Value: ${sample.value}`, 'white');
        log(`     Device ID: ${sample.device_id}`, 'white');
        log(`     Personnel ID: ${sample.personnel_id}`, 'white');
      }
    } else {
      log(`   No existing DOSE_THRESHOLD alerts found`, 'yellow');
    }
  } catch (error) {
    log(`   Check failed: ${error.message}`, 'red');
  }
  
  // Test 5: Test with different severity levels
  log('\n📊 Test 5: Test Different Severity Levels', 'yellow');
  
  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  
  for (const severity of severities) {
    log(`   Testing severity: ${severity}`, 'white');
    
    const testAlert = {
      type: 'DOSE_THRESHOLD',
      severity: severity,
      threshold: 0.5,
      value: 0.75,
      device_id: 1,
      personnel_id: 1,
      measured_ts: new Date().toISOString(),
      details: {
        message: `Test alert with ${severity} severity`,
        test: true
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
          'Content-Length': JSON.stringify(testAlert).length
        }
      }, testAlert);
      
      log(`     Result: ${response.statusCode}`, response.statusCode >= 400 ? 'red' : 'green');
      if (response.statusCode >= 400) {
        log(`     Error: ${response.raw.substring(0, 150)}...`, 'red');
      }
    } catch (error) {
      log(`     Failed: ${error.message}`, 'red');
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function runTest() {
  log('🚀 Starting DOSE_THRESHOLD Alert Test', 'bright');
  log('=' * 60, 'bright');
  
  try {
    await testDoseThresholdAlerts();
    
    log('\n🎉 Test completed!', 'bright');
    log('=' * 60, 'bright');
    
  } catch (error) {
    log(`\n💥 Test failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  runTest();
}

module.exports = {
  testDoseThresholdAlerts,
  runTest
};
