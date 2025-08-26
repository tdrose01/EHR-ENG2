const http = require('http');

console.log('🧪 Simple Radiation Route Test\n');

// Test 1: Database schema endpoint
console.log('📊 Test 1: Database Schema Endpoint');
const schemaReq = http.request({
  hostname: 'localhost',
  port: 3005,
  path: '/api/admin/database/schema',
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Schema endpoint working (200)');
      try {
        const schema = JSON.parse(data);
        const tableCount = Object.keys(schema.schema || {}).length;
        console.log(`   Tables found: ${tableCount}`);
      } catch (e) {
        console.log('   Could not parse response');
      }
    } else {
      console.log(`❌ Schema endpoint failed (${res.statusCode})`);
    }
  });
});
schemaReq.on('error', (err) => console.log(`❌ Schema request failed: ${err.message}`));
schemaReq.end();

// Test 2: Alert validation - Invalid type
console.log('\n📊 Test 2: Alert Validation - Invalid Type');
const invalidReq = http.request({
  hostname: 'localhost',
  port: 3005,
  path: '/api/radiation/alerts',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 400) {
      console.log('✅ Invalid type correctly rejected (400)');
    } else {
      console.log(`❌ Invalid type should have been rejected (${res.statusCode})`);
    }
  });
});
invalidReq.on('error', (err) => console.log(`❌ Invalid type request failed: ${err.message}`));
invalidReq.write(JSON.stringify({ type: 'INVALID_TYPE', severity: 'MEDIUM' }));
invalidReq.end();

// Test 3: Alert validation - Valid alert
console.log('\n📊 Test 3: Alert Validation - Valid Alert');
const validReq = http.request({
  hostname: 'localhost',
  port: 3005,
  path: '/api/radiation/alerts',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Valid alert created successfully (200)');
      try {
        const response = JSON.parse(data);
        console.log(`   Alert ID: ${response.alert_id || 'N/A'}`);
      } catch (e) {
        console.log('   Could not parse response');
      }
    } else {
      console.log(`❌ Valid alert creation failed (${res.statusCode})`);
    }
  });
});
validReq.on('error', (err) => console.log(`❌ Valid alert request failed: ${err.message}`));
validReq.write(JSON.stringify({ type: 'DOSE_THRESHOLD', severity: 'MEDIUM', threshold: 0.1, value: 0.15 }));
validReq.end();

console.log('\n🎉 Tests completed!');
