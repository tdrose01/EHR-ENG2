#!/usr/bin/env node

/**
 * Test script for the Monitoring and Alerting System
 * Tests all monitoring endpoints and generates test alerts
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3005';
const API_BASE = `${BASE_URL}/api/monitoring`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function makeRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: jsonData,
            status: res.statusCode,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: data,
            status: res.statusCode,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const response = await makeRequest(endpoint, method, body);

    if (response.success) {
      logSuccess(`${method} ${endpoint} - Status: ${response.status}`);
      return { success: true, data: response.data, status: response.status };
    } else {
      logError(`${method} ${endpoint} - Status: ${response.status} - ${response.data.message || 'Unknown error'}`);
      return { success: false, data: response.data, status: response.status };
    }
  } catch (error) {
    logError(`${method} ${endpoint} - Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testHealthEndpoints() {
  log('\n🔍 Testing Health Endpoints', 'cyan');
  
  // Test comprehensive health check
  await testEndpoint(`${API_BASE}/health`);
  
  // Test quick health check
  await testEndpoint(`${API_BASE}/health/quick`);
  
  // Test radiation-specific health
  await testEndpoint(`${API_BASE}/radiation/health`);
  
  // Test database health
  await testEndpoint(`${API_BASE}/database/health`);
}

async function testMetricsEndpoints() {
  log('\n📊 Testing Metrics Endpoints', 'cyan');
  
  // Test system status
  await testEndpoint(`${API_BASE}/status`);
  
  // Test detailed metrics
  await testEndpoint(`${API_BASE}/metrics`);
  
  // Test performance metrics
  await testEndpoint(`${API_BASE}/performance`);
  
  // Test configuration
  await testEndpoint(`${API_BASE}/config`);
}

async function testAlertEndpoints() {
  log('\n🚨 Testing Alert Endpoints', 'cyan');
  
  // Test getting alerts
  await testEndpoint(`${API_BASE}/alerts`);
  
  // Test test alert generation
  const testAlert = {
    type: 'TEST_ALERT',
    severity: 'INFO',
    message: 'This is a test alert from the monitoring test script',
    details: {
      test: true,
      timestamp: new Date().toISOString(),
      script: 'test-monitoring.js'
    }
  };
  
  await testEndpoint(`${API_BASE}/test-alert`, 'POST', testAlert);
  
  // Test getting alerts again to see the new test alert
  await testEndpoint(`${API_BASE}/alerts`);
}

async function testAdminEndpoints() {
  log('\n⚙️  Testing Admin Endpoints', 'cyan');
  
  // Test metrics reset
  await testEndpoint(`${API_BASE}/metrics/reset`, 'POST');
}

async function testErrorHandling() {
  log('\n🧪 Testing Error Handling', 'cyan');
  
  // Test invalid endpoint
  await testEndpoint(`${API_BASE}/invalid-endpoint`);
  
  // Test invalid alert acknowledgment
  await testEndpoint(`${API_BASE}/alerts/invalid-id/acknowledge`, 'POST');
}

async function generateLoadTest() {
  log('\n⚡ Generating Load Test', 'cyan');
  
  const promises = [];
  
  // Generate multiple test alerts
  for (let i = 1; i <= 5; i++) {
    const alert = {
      type: `LOAD_TEST_${i}`,
      severity: i % 3 === 0 ? 'CRITICAL' : i % 2 === 0 ? 'WARNING' : 'INFO',
      message: `Load test alert ${i} - ${new Date().toISOString()}`,
      details: {
        loadTest: true,
        iteration: i,
        timestamp: new Date().toISOString()
      }
    };
    
    promises.push(testEndpoint(`${API_BASE}/test-alert`, 'POST', alert));
  }
  
  // Wait for all alerts to be generated
  await Promise.all(promises);
  
  logSuccess('Generated 5 load test alerts');
  
  // Test getting alerts to see all the new ones
  await testEndpoint(`${API_BASE}/alerts`);
}

async function runAllTests() {
  log('🚀 Starting Monitoring System Tests', 'bright');
  log(`Base URL: ${BASE_URL}`, 'cyan');
  log(`API Base: ${API_BASE}`, 'cyan');
  
  try {
    // Test all endpoint categories
    await testHealthEndpoints();
    await testMetricsEndpoints();
    await testAlertEndpoints();
    await testAdminEndpoints();
    await testErrorHandling();
    await generateLoadTest();
    
    log('\n🎉 All tests completed!', 'bright');
    logInfo('Check the monitoring dashboard to see the test alerts and system status');
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Check if server is running
async function checkServerStatus() {
  try {
    const response = await makeRequest(`${BASE_URL}/api/hello`);
    if (response.success) {
      logSuccess('Server is running and accessible');
      return true;
    } else {
      logError('Server responded with error status');
      return false;
    }
  } catch (error) {
    logError(`Cannot connect to server: ${error.message}`);
    logWarning('Make sure the server is running with: npm run start:server');
    return false;
  }
}

// Main execution
async function main() {
  log('🔍 Monitoring System Test Script', 'bright');
  log('This script tests all monitoring endpoints and generates test data\n', 'cyan');
  
  // Check if server is running
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    process.exit(1);
  }
  
  // Run all tests
  await runAllTests();
  
  log('\n📋 Test Summary', 'bright');
  logInfo('1. Health endpoints tested');
  logInfo('2. Metrics endpoints tested');
  logInfo('3. Alert endpoints tested');
  logInfo('4. Admin endpoints tested');
  logInfo('5. Error handling tested');
  logInfo('6. Load test completed');
  
  log('\n🎯 Next Steps', 'bright');
  logInfo('1. Open the monitoring dashboard: http://localhost:5173/monitoring-dashboard');
  logInfo('2. Check the Alerts tab to see test alerts');
  logInfo('3. Verify system health status');
  logInfo('4. Test alert acknowledgment functionality');
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('Monitoring System Test Script', 'bright');
  log('\nUsage:', 'cyan');
  log('  node scripts/test-monitoring.js [options]', 'yellow');
  log('\nOptions:', 'cyan');
  log('  --help, -h     Show this help message', 'yellow');
  log('  --server-only   Only check server status', 'yellow');
  log('\nExamples:', 'cyan');
  log('  node scripts/test-monitoring.js', 'yellow');
  log('  node scripts/test-monitoring.js --server-only', 'yellow');
  process.exit(0);
}

if (process.argv.includes('--server-only')) {
  checkServerStatus().then(running => {
    process.exit(running ? 0 : 1);
  });
} else {
  main().catch(error => {
    logError(`Test script failed: ${error.message}`);
    process.exit(1);
  });
}
