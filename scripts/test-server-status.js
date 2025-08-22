#!/usr/bin/env node

/**
 * Test script to check server status and admin routes
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3005';

async function testServerStatus() {
  console.log('🧪 Testing Server Status...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const helloResponse = await fetch(`${BASE_URL}/api/hello`);
    if (helloResponse.ok) {
      const data = await helloResponse.json();
      console.log(`   ✅ Server is running: ${data.message}`);
    } else {
      console.log(`   ❌ Server responded with status: ${helloResponse.status}`);
      return;
    }

    // Test 2: Check if admin routes are accessible
    console.log('\n2. Testing admin route accessibility...');
    const adminResponse = await fetch(`${BASE_URL}/api/admin/backup/list`);
    console.log(`   Admin backup list status: ${adminResponse.status}`);
    
    if (adminResponse.ok) {
      const backups = await adminResponse.json();
      console.log(`   ✅ Admin routes working: Found ${backups.length} backups`);
    } else {
      const errorText = await adminResponse.text();
      console.log(`   ❌ Admin route error: ${errorText}`);
    }

    // Test 3: Check backup locations endpoint
    console.log('\n3. Testing backup locations endpoint...');
    const locationsResponse = await fetch(`${BASE_URL}/api/admin/backup/locations`);
    console.log(`   Backup locations status: ${locationsResponse.status}`);
    
    if (locationsResponse.ok) {
      const locations = await locationsResponse.json();
      console.log(`   ✅ Backup locations working: Found ${Object.keys(locations).length} locations`);
    } else {
      const errorText = await locationsResponse.text();
      console.log(`   ❌ Backup locations error: ${errorText}`);
    }

    console.log('\n✅ Server status test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Make sure the server is running: npm run start:server');
    console.log('   2. Check if port 3005 is available');
    console.log('   3. Verify no firewall is blocking the connection');
  }
}

// Run the test
testServerStatus().catch(console.error);

