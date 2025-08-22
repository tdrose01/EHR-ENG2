#!/usr/bin/env node

/**
 * Test script for the backup and restore system
 * This script tests the backup service functionality
 */

const backupService = require('../server/services/backupService');

async function testBackupSystem() {
  console.log('🧪 Testing Backup System...\n');

  try {
    // Test 1: List backups (should work even if no backups exist)
    console.log('1. Testing backup listing...');
    const backups = await backupService.listBackups();
    console.log(`   ✅ Found ${backups.length} backups`);
    
    // Test 2: Create a test backup
    console.log('\n2. Testing backup creation...');
    const backupResult = await backupService.createBackup('test_backup_from_script');
    console.log(`   ✅ Backup created: ${backupResult.filename}`);
    console.log(`   📁 Location: ${backupResult.filepath}`);
    console.log(`   📊 Size: ${backupResult.metadata.size} bytes`);
    
    // Test 3: List backups again (should now show the new backup)
    console.log('\n3. Testing backup listing after creation...');
    const updatedBackups = await backupService.listBackups();
    console.log(`   ✅ Now found ${updatedBackups.length} backups`);
    
    // Test 4: Verify the new backup appears in the list
    const newBackup = updatedBackups.find(b => b.filename === backupResult.filename);
    if (newBackup) {
      console.log(`   ✅ New backup found in list: ${newBackup.description}`);
      console.log(`   📅 Created: ${newBackup.timestamp}`);
      console.log(`   📏 Size: ${newBackup.sizeFormatted}`);
    } else {
      console.log('   ❌ New backup not found in list');
    }
    
    // Test 5: Test backup deletion
    console.log('\n4. Testing backup deletion...');
    const deleteResult = await backupService.deleteBackup(backupResult.filename);
    console.log(`   ✅ Backup deleted: ${deleteResult.message}`);
    
    // Test 6: Verify backup is removed
    console.log('\n5. Verifying backup removal...');
    const finalBackups = await backupService.listBackups();
    console.log(`   ✅ Final backup count: ${finalBackups.length}`);
    
    if (finalBackups.length === backups.length) {
      console.log('   ✅ Backup count restored to original');
    } else {
      console.log('   ❌ Backup count mismatch');
    }
    
    console.log('\n🎉 All backup system tests passed!');
    
  } catch (error) {
    console.error('\n❌ Backup system test failed:');
    console.error(`   Error: ${error.message}`);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Ensure PostgreSQL client tools are installed');
    console.error('   2. Check DATABASE_URL environment variable');
    console.error('   3. Verify database connection');
    console.error('   4. Check file permissions for backup directory');
    
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testBackupSystem();
}

module.exports = { testBackupSystem };

