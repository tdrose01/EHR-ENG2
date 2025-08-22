#!/usr/bin/env node

/**
 * Test script for the backup API endpoints
 * This script tests the backup system API functionality
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3005';

async function testBackupAPI() {
  console.log('🧪 Testing Backup API Endpoints...\n');

  try {
    // Test 1: List backups
    console.log('1. Testing GET /api/admin/backup/list...');
    const listResponse = await fetch(`${BASE_URL}/api/admin/backup/list`);
    console.log(`   Status: ${listResponse.status}`);
    
    if (listResponse.ok) {
      const backups = await listResponse.json();
      console.log(`   ✅ Success: Found ${backups.length} backups`);
      if (backups.length > 0) {
        console.log(`   📁 First backup: ${backups[0].filename}`);
      }
    } else {
      const error = await listResponse.text();
      console.log(`   ❌ Error: ${error}`);
    }

    // Test 2: Create a test backup
    console.log('\n2. Testing POST /api/admin/backup/create...');
    const createResponse = await fetch(`${BASE_URL}/api/admin/backup/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'test_backup_from_api_script'
      })
    });
    
    console.log(`   Status: ${createResponse.status}`);
    
    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log(`   ✅ Success: ${result.filename}`);
    } else {
      const error = await createResponse.text();
      console.log(`   ❌ Error: ${error}`);
    }

    // Test 3: List backups again to see if new one appears
    console.log('\n3. Testing GET /api/admin/backup/list again...');
    const listResponse2 = await fetch(`${BASE_URL}/api/admin/backup/list`);
    console.log(`   Status: ${listResponse2.status}`);
    
    if (listResponse2.ok) {
      const backups = await listResponse2.json();
      console.log(`   ✅ Success: Found ${backups.length} backups`);
    } else {
      const error = await listResponse2.text();
      console.log(`   ❌ Error: ${error}`);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/hello`);
    if (response.ok) {
      console.log('✅ Server is running at', BASE_URL);
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running at', BASE_URL);
    console.log('   Please start the server with: npm run start:server');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await testBackupAPI();
}

main().catch(console.error);

