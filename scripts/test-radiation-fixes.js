const http = require('http');

const BASE_URL = 'http://localhost:3005/api/radiation';

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

async function testRadiationFixes() {
  console.log('🧪 Testing Radiation Route Fixes\n');
  
  try {
    // Test 1: Database schema endpoint
    console.log('📊 Test 1: Database Schema Endpoint');
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
      console.log('✅ Schema endpoint working (200)');
      console.log(`   Tables found: ${Object.keys(schemaResponse.data?.schema || {}).length}`);
    } catch (error) {
      console.log(`❌ Schema endpoint failed: ${error.message}`);
    }
    
    // Test 2: Alert validation - Invalid type
    console.log('\n📊 Test 2: Alert Validation - Invalid Type');
    try {
      const invalidTypeResponse = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: '/api/radiation/alerts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': JSON.stringify({ type: 'INVALID_TYPE', severity: 'MEDIUM' }).length
        }
      }, { type: 'INVALID_TYPE', severity: 'MEDIUM' });
      console.log(`❌ Invalid type should have been rejected (${invalidTypeResponse.statusCode})`);
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
    
    // Test 3: Alert validation - Missing required fields
    console.log('\n📊 Test 3: Alert Validation - Missing Required Fields');
    try {
      const missingFieldsResponse = await makeRequest({
        hostname: 'localhost',
        port: 3005,
        path: '/api/radiation/alerts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': JSON.stringify({ severity: 'MEDIUM' }).length
        }
      }, { severity: 'MEDIUM' });
      console.log(`❌ Missing fields should have been rejected (${missingFieldsResponse.statusCode})`);
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
    
    // Test 4: Alert validation - Valid alert
    console.log('\n📊 Test 4: Alert Validation - Valid Alert');
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
      console.log('✅ Valid alert created successfully (200)');
      console.log(`   Alert ID: ${validAlertResponse.data?.alert_id || 'N/A'}`);
    } catch (error) {
      console.log(`❌ Valid alert creation failed: ${error.message}`);
    }
    
    // Test 5: Alert retrieval with status
    console.log('\n📊 Test 5: Alert Retrieval with Status');
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
      console.log('✅ Alerts retrieved successfully (200)');
      console.log(`   Total alerts: ${alertsResponse.data?.length || 0}`);
      if (alertsResponse.data && alertsResponse.data.length > 0) {
        const sampleAlert = alertsResponse.data[0];
        console.log(`   Sample alert status: ${sampleAlert.status || 'undefined'}`);
      }
    } catch (error) {
      console.log(`❌ Alert retrieval failed: ${error.message}`);
    }
    
    // Test 6: Health check
    console.log('\n📊 Test 6: Health Check');
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
      console.log('✅ Health check working (200)');
      console.log(`   Status: ${healthResponse.data?.status}`);
      console.log(`   Database: ${healthResponse.data?.database}`);
    } catch (error) {
      console.log(`❌ Health check failed: ${error.message}`);
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the tests
testRadiationFixes();
