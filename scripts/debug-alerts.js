#!/usr/bin/env node

/**
 * Debug Script for Alert JSON Syntax Errors
 * Focuses on the specific "invalid input syntax for type json" errors
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

async function debugJsonSyntaxErrors() {
  log('\n🔍 Debugging Alert JSON Syntax Errors', 'cyan');
  log('=' * 60, 'cyan');
  
  // Test 1: Check what the current generate-test-data script is sending
  log('\n📊 Test 1: Current generate-test-data Alert Format', 'yellow');
  const currentFormat = {
    type: 'DOSE_THRESHOLD',
    severity: 'MEDIUM',
    threshold: 0.5,
    value: 0.75,
    device_id: 1,
    personnel_id: 1,
    measured_ts: new Date().toISOString(),
    details: 'Personnel dose threshold exceeded'  // This is a string, not an object!
  };
  
  log('   Sending alert with details as string:', 'white');
  log(`   details: "${currentFormat.details}"`, 'white');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/radiation/alerts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(currentFormat).length
      }
    }, currentFormat);
    
    log(`   Response: ${response.statusCode}`, response.statusCode >= 400 ? 'red' : 'green');
    if (response.statusCode >= 400) {
      log(`   Error: ${response.raw}`, 'red');
    }
  } catch (error) {
    log(`   Request failed: ${error.message}`, 'red');
  }
  
  // Test 2: Fix the details field to be proper JSON object
  log('\n📊 Test 2: Fixed Alert Format (Proper JSON)', 'yellow');
  const fixedFormat = {
    type: 'DOSE_THRESHOLD',
    severity: 'MEDIUM',
    threshold: 0.5,
    value: 0.75,
    device_id: 1,
    personnel_id: 1,
    measured_ts: new Date().toISOString(),
    details: {
      message: 'Personnel dose threshold exceeded',
      threshold_type: 'hourly',
      unit: 'mSv',
      exceeded_by: '50%'
    }
  };
  
  log('   Sending alert with details as object:', 'white');
  log(`   details: ${JSON.stringify(fixedFormat.details, null, 2)}`, 'white');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/radiation/alerts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(fixedFormat).length
      }
    }, fixedFormat);
    
    log(`   Response: ${response.statusCode}`, response.statusCode >= 400 ? 'red' : 'green');
    if (response.statusCode >= 400) {
      log(`   Error: ${response.raw}`, 'red');
    } else {
      log(`   Success! Alert ID: ${response.data?.id || 'N/A'}`, 'green');
    }
  } catch (error) {
    log(`   Request failed: ${error.message}`, 'red');
  }
  
  // Test 3: Check the database schema to understand the details column type
  log('\n📊 Test 3: Check Database Schema via Direct Query', 'yellow');
  
  // Try to get the table structure from the radiation routes
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
    
    if (response.statusCode === 200 && response.data && response.data.length > 0) {
      const sampleAlert = response.data[0];
      log(`   Sample alert details field:`, 'white');
      log(`     Type: ${typeof sampleAlert.details}`, 'white');
      log(`     Value: ${JSON.stringify(sampleAlert.details)}`, 'white');
      
      if (sampleAlert.details && typeof sampleAlert.details === 'object') {
        log(`     Keys: ${Object.keys(sampleAlert.details).join(', ')}`, 'white');
      }
    }
  } catch (error) {
    log(`   Schema check failed: ${error.message}`, 'red');
  }
  
  // Test 4: Test different details formats to find the issue
  log('\n📊 Test 4: Test Different Details Formats', 'yellow');
  
  const testFormats = [
    {
      name: 'Empty Object',
      details: {}
    },
    {
      name: 'Simple String',
      details: 'Simple message'
    },
    {
      name: 'Null Value',
      details: null
    },
    {
      name: 'Undefined Value',
      details: undefined
    },
    {
      name: 'Complex Object',
      details: {
        message: 'Complex alert',
        metadata: {
          source: 'sensor_001',
          timestamp: Date.now(),
          location: 'Zone A'
        },
        thresholds: [0.5, 1.0, 2.0]
      }
    }
  ];
  
  for (const testFormat of testFormats) {
    log(`   Testing: ${testFormat.name}`, 'white');
    
    const testAlert = {
      type: 'DOSE_THRESHOLD',
      severity: 'MEDIUM',
      threshold: 0.5,
      value: 0.75,
      device_id: 1,
      personnel_id: 1,
      measured_ts: new Date().toISOString(),
      details: testFormat.details
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
        log(`     Error: ${response.raw.substring(0, 200)}...`, 'red');
      }
    } catch (error) {
      log(`     Failed: ${error.message}`, 'red');
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function runDebug() {
  log('🚀 Starting Alert JSON Syntax Debug', 'bright');
  log('=' * 60, 'bright');
  
  try {
    await debugJsonSyntaxErrors();
    
    log('\n🎉 Debug completed!', 'bright');
    log('=' * 60, 'bright');
    
  } catch (error) {
    log(`\n💥 Debug failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the debug
if (require.main === module) {
  runDebug();
}

module.exports = {
  debugJsonSyntaxErrors,
  runDebug
};
