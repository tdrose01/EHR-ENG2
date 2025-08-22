#!/usr/bin/env node

/**
 * Test script to verify Vite proxy is working
 */

const fetch = require('node-fetch');

async function testProxy() {
  console.log('🧪 Testing Vite Proxy Configuration...\n');

  try {
    // Test 1: Direct backend connection
    console.log('1. Testing direct backend connection...');
    const directResponse = await fetch('http://localhost:3005/api/hello');
    if (directResponse.ok) {
      const data = await directResponse.json();
      console.log(`   ✅ Backend accessible directly: ${data.message}`);
    } else {
      console.log(`   ❌ Backend not accessible: ${directResponse.status}`);
      return;
    }

    // Test 2: Test proxy through frontend port
    console.log('\n2. Testing proxy through frontend port...');
    const proxyResponse = await fetch('http://localhost:5173/api/hello');
    if (proxyResponse.ok) {
      const data = await proxyResponse.json();
      console.log(`   ✅ Proxy working: ${data.message}`);
    } else {
      console.log(`   ❌ Proxy not working: ${proxyResponse.status}`);
      const errorText = await proxyResponse.text();
      console.log(`   Error details: ${errorText}`);
    }

    // Test 3: Test admin backup endpoint
    console.log('\n3. Testing admin backup endpoint...');
    const adminResponse = await fetch('http://localhost:5173/api/admin/backup/list');
    console.log(`   Admin endpoint status: ${adminResponse.status}`);
    
    if (adminResponse.ok) {
      const data = await adminResponse.json();
      console.log(`   ✅ Admin endpoint working: Found ${data.length} backups`);
    } else {
      const errorText = await adminResponse.text();
      console.log(`   ❌ Admin endpoint error: ${errorText}`);
    }

    console.log('\n✅ Proxy test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Make sure backend is running: npm run start:server');
    console.log('   2. Make sure frontend is running: npm run dev');
    console.log('   3. Check if ports 3005 and 5173 are available');
    console.log('   4. Verify Vite proxy configuration');
  }
}

// Run the test
testProxy().catch(console.error);

