#!/usr/bin/env node

/**
 * Test script for database triggers
 * Verifies that pg_notify is working for real-time updates
 */

const { Client } = require('pg');

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'ehr_eng2',
  user: 'postgres',
  // No password - using Windows authentication or .pgpass
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

class TriggerTester {
  constructor() {
    this.client = null;
    this.listener = null;
    this.notifications = [];
    this.isListening = false;
  }

  async connect() {
    try {
      this.client = new Client(dbConfig);
      await this.client.connect();
      logSuccess('Connected to database');
      return true;
    } catch (error) {
      logError(`Database connection failed: ${error.message}`);
      return false;
    }
  }

  async startListening() {
    try {
      this.listener = new Client(dbConfig);
      await this.listener.connect();
      
      // Listen for all notification channels
      await this.listener.query('LISTEN dose_reading_changes');
      await this.listener.query('LISTEN alert_changes');
      await this.listener.query('LISTEN personnel_changes');
      await this.listener.query('LISTEN device_changes');
      
      this.listener.on('notification', (msg) => {
        try {
          const data = JSON.parse(msg.payload);
          this.notifications.push({
            channel: msg.channel,
            data: data,
            timestamp: new Date().toISOString()
          });
          
          logSuccess(`📡 Notification received on ${msg.channel}: ${JSON.stringify(data)}`);
        } catch (error) {
          logError(`Error parsing notification: ${error.message}`);
        }
      });
      
      this.isListening = true;
      logSuccess('Started listening for database notifications');
      return true;
    } catch (error) {
      logError(`Failed to start listening: ${error.message}`);
      return false;
    }
  }

  async testDoseReadingTrigger() {
    try {
      logInfo('🧪 Testing dose reading trigger...');
      
      // Insert a test dose reading with proper constraints
      const result = await this.client.query(`
        INSERT INTO radiation_dose_readings (device_id, measured_ts, gateway_ts, hp10_msv, hp007_msv, rate_usv_h, battery_pct, raw_json, payload_sig)
        VALUES (1, NOW(), NOW(), 15.5, 12.3, 25.0, 85.0, '{"test": true}', 'test_signature')
        RETURNING id
      `);
      
      const readingId = result.rows[0].id;
      logSuccess(`Inserted test dose reading with ID: ${readingId}`);
      
      // Wait a moment for the trigger to fire
      await this.sleep(1000);
      
      // Update the reading
      await this.client.query(`
        UPDATE radiation_dose_readings 
        SET hp10_msv = 18.2 
        WHERE id = $1
      `, [readingId]);
      
      logSuccess(`Updated dose reading ID: ${readingId}`);
      
      // Wait for trigger
      await this.sleep(1000);
      
      // Delete the test reading
      await this.client.query(`
        DELETE FROM radiation_dose_readings 
        WHERE id = $1
      `, [readingId]);
      
      logSuccess(`Deleted test dose reading ID: ${readingId}`);
      
      // Wait for trigger
      await this.sleep(1000);
      
      return true;
    } catch (error) {
      logError(`Dose reading trigger test failed: ${error.message}`);
      return false;
    }
  }

  async testAlertTrigger() {
    try {
      logInfo('🧪 Testing alert trigger...');
      
      // Insert a test alert with proper constraints
      const result = await this.client.query(`
        INSERT INTO radiation_alerts (type, severity, threshold, value, device_id, personnel_id, measured_ts, details)
        VALUES ('TEST_ALERT', 'MEDIUM', 20.0, 18.5, 1, 1, NOW(), '{"test": true}')
        RETURNING id
      `);
      
      const alertId = result.rows[0].id;
      logSuccess(`Inserted test alert with ID: ${alertId}`);
      
      // Wait for trigger
      await this.sleep(1000);
      
      // Update the alert
      await this.client.query(`
        UPDATE radiation_alerts 
        SET severity = 'CRITICAL' 
        WHERE id = $1
      `, [alertId]);
      
      logSuccess(`Updated alert ID: ${alertId}`);
      
      // Wait for trigger
      await this.sleep(1000);
      
      // Delete the test alert
      await this.client.query(`
        DELETE FROM radiation_alerts 
        WHERE id = $1
      `, [alertId]);
      
      logSuccess(`Deleted test alert ID: ${alertId}`);
      
      // Wait for trigger
      await this.sleep(1000);
      
      return true;
    } catch (error) {
      logError(`Alert trigger test failed: ${error.message}`);
      return false;
    }
  }

  async testPersonnelTrigger() {
    try {
      logInfo('🧪 Testing personnel trigger...');
      
      // Insert a test personnel record with proper constraints
      const result = await this.client.query(`
        INSERT INTO radiation_personnel (edipi, rank_rate, lname, fname, unit_id, active, radiation_category, monitoring_frequency)
        VALUES ('9876543210', 'HM3', 'Test', 'Person', 1, true, 'CAT1', 'MONTHLY')
        RETURNING id
      `);
      
      const personnelId = result.rows[0].id;
      logSuccess(`Inserted test personnel with ID: ${personnelId}`);
      
      // Wait for trigger
      await this.sleep(1000);
      
      // Update the personnel record
      await this.client.query(`
        UPDATE radiation_personnel 
        SET rank_rate = 'HM2' 
        WHERE id = $1
      `, [personnelId]);
      
      logSuccess(`Updated personnel ID: ${personnelId}`);
      
      // Wait for trigger
      await this.sleep(1000);
      
      // Delete the test personnel
      await this.client.query(`
        DELETE FROM radiation_personnel 
        WHERE id = $1
      `, [personnelId]);
      
      logSuccess(`Deleted test personnel ID: ${personnelId}`);
      
      // Wait for trigger
      await this.sleep(1000);
      
      return true;
    } catch (error) {
      logError(`Personnel trigger test failed: ${error.message}`);
      return false;
    }
  }

  async testDeviceTrigger() {
    try {
      logInfo('🧪 Testing device trigger...');
      
      // Insert a test device
      const result = await this.client.query(`
        INSERT INTO radiation_devices (serial, ble_mac, firmware, calib_due, rf_policy)
        VALUES ('TEST001', 'AA:BB:CC:DD:EE:FF', '1.0.0', NOW() + INTERVAL '30 days', 'NORMAL')
        RETURNING id
      `);
      
      const deviceId = result.rows[0].id;
      logSuccess(`Inserted test device with ID: ${deviceId}`);
      
      // Wait for trigger
      await this.sleep(1000);
      
      // Update the device
      await this.client.query(`
        UPDATE radiation_devices 
        SET rf_policy = 'CONTROLLED' 
        WHERE id = $1
      `, [deviceId]);
      
      logSuccess(`Updated device ID: ${deviceId}`);
      
      // Wait for trigger
      await this.sleep(1000);
      
      // Delete the test device
      await this.client.query(`
        DELETE FROM radiation_devices 
        WHERE id = $1
      `, [deviceId]);
      
      logSuccess(`Deleted test device ID: ${deviceId}`);
      
      // Wait for trigger
      await this.sleep(1000);
      
      return true;
    } catch (error) {
      logError(`Device trigger test failed: ${error.message}`);
      return false;
    }
  }

  async runAllTests() {
    log('\n🚀 Starting Trigger Tests', 'bright');
    
    try {
      // Test all triggers
      await this.testDoseReadingTrigger();
      await this.testAlertTrigger();
      await this.testPersonnelTrigger();
      await this.testDeviceTrigger();
      
      // Wait a bit more for any delayed notifications
      await this.sleep(2000);
      
      // Show results
      this.showResults();
      
    } catch (error) {
      logError(`Test suite failed: ${error.message}`);
    }
  }

  showResults() {
    log('\n📊 Test Results', 'bright');
    log(`Total notifications received: ${this.notifications.length}`, 'cyan');
    
    if (this.notifications.length === 0) {
      logWarning('No notifications received. Triggers may not be working.');
      logInfo('Check that:');
      logInfo('1. Migration was applied successfully');
      logInfo('2. Database user has LISTEN privileges');
      logInfo('3. No errors in database logs');
    } else {
      logSuccess('Triggers are working correctly!');
      
      // Group notifications by channel
      const byChannel = {};
      this.notifications.forEach(notification => {
        if (!byChannel[notification.channel]) {
          byChannel[notification.channel] = [];
        }
        byChannel[notification.channel].push(notification);
      });
      
      log('\n📡 Notifications by Channel:', 'cyan');
      Object.entries(byChannel).forEach(([channel, notifications]) => {
        log(`${channel}: ${notifications.length} notifications`, 'yellow');
      });
    }
  }

  async cleanup() {
    if (this.listener) {
      await this.listener.end();
    }
    if (this.client) {
      await this.client.end();
    }
    logInfo('Database connections closed');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const tester = new TriggerTester();
  
  try {
    // Connect to database
    const connected = await tester.connect();
    if (!connected) {
      process.exit(1);
    }
    
    // Start listening for notifications
    const listening = await tester.startListening();
    if (!listening) {
      process.exit(1);
    }
    
    // Run all tests
    await tester.runAllTests();
    
  } catch (error) {
    logError(`Test script failed: ${error.message}`);
  } finally {
    await tester.cleanup();
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('Database Trigger Test Script', 'bright');
  log('\nUsage:', 'cyan');
  log('  node scripts/test-triggers.js [options]', 'yellow');
  log('\nOptions:', 'cyan');
  log('  --help, -h     Show this help message', 'yellow');
  log('\nEnvironment Variables:', 'cyan');
  log('  DATABASE_URL   PostgreSQL connection string', 'yellow');
  log('  NODE_ENV       Set to "production" for SSL', 'yellow');
  process.exit(0);
}

// Run the tests
main().catch(error => {
  logError(`Test script failed: ${error.message}`);
  process.exit(1);
});
