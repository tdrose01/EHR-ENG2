#!/usr/bin/env node

/**
 * Generate Test Data for Real-Time Monitoring Dashboard
 * Creates sample radiation health data to populate the dashboard
 */

const http = require('http');

// Configuration
const API_BASE = 'localhost';
const API_PORT = 3005;
const TEST_DATA_COUNT = 20;

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

// Generate random radiation readings using real device serials
function generateRadiationReading() {
  // Real device serials from the database
  const deviceSerials = [
    'VUE-1234567', 'VUE-1234568', 'VUE-1234569', 'MIR-7890123', 'MIR-7890124',
    'THER-4567890', 'THER-4567891', 'LUD-9876543', 'CAN-6543210'
  ];
  
  return {
    device_serial: deviceSerials[Math.floor(Math.random() * deviceSerials.length)],
    measured_ts: new Date().toISOString(),
    hp10_mSv: (Math.random() * 0.5 + 0.01).toFixed(4), // 0.01 to 0.51 mSv
    hp007_mSv: (Math.random() * 0.3 + 0.005).toFixed(4), // 0.005 to 0.305 mSv
    rate_uSv_h: (Math.random() * 100 + 10).toFixed(2), // 10 to 110 µSv/h
    battery_pct: Math.floor(Math.random() * 40 + 60), // 60% to 100%
    gateway_id: 'TEST_GATEWAY_001',
    payload_sig: 'test_signature_' + Date.now(),
    sig_alg: 'SHA256'
  };
}

// Generate test data
async function generateTestData() {
  logHeader('Generating Test Data for Real-Time Monitoring Dashboard');
  
  try {
    log('🔌 Testing API connection...', 'blue');
    
    // Test API connection using the test endpoint
    const testCheck = await makeRequest('/api/radiation/test');
    if (testCheck.status === 200) {
      log('✅ API connection successful', 'green');
    } else {
      log(`⚠️  API responded with status: ${testCheck.status}`, 'yellow');
    }
    
    // Generate and insert test readings
    log(`\n📊 Generating ${TEST_DATA_COUNT} test radiation readings...`, 'blue');
    
    for (let i = 0; i < TEST_DATA_COUNT; i++) {
      const reading = generateRadiationReading();
      
      try {
        const response = await makeRequest('/api/radiation/ingest/readings', 'POST', reading);
        if (response.status === 201 || response.status === 200) {
          log(`✅ Reading ${i + 1}/${TEST_DATA_COUNT} created`, 'green');
        } else {
          log(`⚠️  Reading ${i + 1}/${TEST_DATA_COUNT} - Status: ${response.status}`, 'yellow');
          if (response.data && response.data.error) {
            log(`   Error: ${response.data.error}`, 'red');
          }
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        log(`❌ Failed to create reading ${i + 1}: ${error.message}`, 'red');
      }
    }
    
    // Generate some alerts
    log('\n🚨 Generating test alerts...', 'blue');
    
    const alertTypes = ['DOSE_THRESHOLD', 'EQUIPMENT_FAILURE', 'PERSONNEL_EXPOSURE', 'SYSTEM_ANOMALY'];
    const alertMessages = [
      'High radiation dose detected in Reactor Room A',
      'Equipment malfunction in Control Room B',
      'Personnel exposure limit approaching',
      'System anomaly detected in monitoring equipment'
    ];
    
    for (let i = 0; i < 5; i++) {
      const alert = {
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: Math.random() > 0.7 ? 'CRITICAL' : 'MEDIUM',
        threshold: (Math.random() * 100 + 50).toFixed(2),
        value: (Math.random() * 150 + 75).toFixed(2),
        device_id: Math.floor(Math.random() * 9) + 1, // Use actual device IDs 1-9
        personnel_id: Math.floor(Math.random() * 13) + 1, // Use actual personnel IDs 1-13
        measured_ts: new Date().toISOString(),
        details: {
          message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
          source: 'test_data_generator',
          timestamp: new Date().toISOString(),
          test_run: true
        }
      };
      
      try {
        const response = await makeRequest('/api/radiation/alerts', 'POST', alert);
        if (response.status === 201 || response.status === 200) {
          log(`✅ Alert ${i + 1}/5 created`, 'green');
        } else {
          log(`⚠️  Alert ${i + 1}/5 - Status: ${response.status}`, 'yellow');
          if (response.data && response.data.error) {
            log(`   Error: ${response.data.error}`, 'red');
          }
        }
      } catch (error) {
        log(`❌ Failed to create alert ${i + 1}: ${error.message}`, 'red');
      }
    }
    
    log('\n🎉 Test data generation complete!', 'green');
    log('📱 Refresh your dashboard at: http://localhost:5173/real-time-monitoring', 'cyan');
    log('🔍 You should now see:', 'yellow');
    log('   • Real-time radiation readings', 'white');
    log('   • Active alerts and notifications', 'white');
    log('   • Live data updates via WebSocket', 'white');
    log('   • Chart data in the Real-Time Trends section', 'white');
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    log('💡 Make sure the backend server is running on port 3005', 'yellow');
  }
}

// Run the script
if (require.main === module) {
  generateTestData();
}

module.exports = { generateTestData };
