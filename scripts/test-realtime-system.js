#!/usr/bin/env node

/**
 * Comprehensive Real-time System Test
 * Tests the complete end-to-end real-time monitoring functionality
 */

const WebSocket = require('ws');
const { Client } = require('pg');

// Test configuration
const WS_URL = 'ws://localhost:3005/ws';
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'ehr_eng2',
  user: 'postgres',
  ssl: false
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
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

class RealtimeSystemTester {
  constructor() {
    this.ws = null;
    this.dbClient = null;
    this.receivedMessages = [];
    this.connectedAt = null;
    this.testResults = {
      connection: false,
      authentication: false,
      subscription: false,
      databaseEvents: false,
      notifications: false,
      cleanup: false
    };
  }

  async runAllTests() {
    log('\n🚀 Starting Comprehensive Real-time System Test', 'bright');
    log('=' .repeat(60), 'cyan');
    
    try {
      // Test 1: WebSocket Connection
      await this.testWebSocketConnection();
      
      // Test 2: Authentication
      await this.testAuthentication();
      
      // Test 3: Channel Subscription
      await this.testChannelSubscription();
      
      // Test 4: Database Integration
      await this.testDatabaseIntegration();
      
      // Test 5: Real-time Notifications
      await this.testRealtimeNotifications();
      
      // Test 6: Cleanup
      await this.testCleanup();
      
      // Show results
      this.showTestResults();
      
    } catch (error) {
      logError(`Test suite failed: ${error.message}`);
      process.exit(1);
    }
  }

  async testWebSocketConnection() {
    log('\n🔌 Test 1: WebSocket Connection', 'cyan');
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(WS_URL);
        
        this.ws.on('open', () => {
          this.connectedAt = new Date();
          logSuccess('WebSocket connected successfully');
          this.testResults.connection = true;
          resolve();
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data);
            this.receivedMessages.push({
              ...message,
              receivedAt: new Date().toISOString()
            });
            logInfo(`Message received: ${message.type}`);
          } catch (error) {
            logError(`Error parsing message: ${error.message}`);
          }
        });

        this.ws.on('error', (error) => {
          logError(`WebSocket error: ${error.message}`);
          reject(error);
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          if (!this.testResults.connection) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });
  }

  async testAuthentication() {
    log('\n🔐 Test 2: Authentication', 'cyan');
    
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      // Send authentication message
      this.ws.send(JSON.stringify({
        type: 'AUTHENTICATE',
        token: 'test-token-123',
        userId: 'test-user',
        role: 'admin'
      }));

      // Wait for authentication response
      const checkAuth = () => {
        const authMessage = this.receivedMessages.find(msg => msg.type === 'AUTHENTICATED');
        if (authMessage) {
          if (authMessage.success) {
            logSuccess(`Authenticated as ${authMessage.userId} (${authMessage.role})`);
            this.testResults.authentication = true;
            resolve();
          } else {
            reject(new Error('Authentication failed'));
          }
        } else {
          setTimeout(checkAuth, 100);
        }
      };

      setTimeout(checkAuth, 100);
      
      // Timeout after 3 seconds
      setTimeout(() => {
        if (!this.testResults.authentication) {
          reject(new Error('Authentication timeout'));
        }
      }, 3000);
    });
  }

  async testChannelSubscription() {
    log('\n📡 Test 3: Channel Subscription', 'cyan');
    
    return new Promise((resolve, reject) => {
      // Subscribe to channels
      this.ws.send(JSON.stringify({
        type: 'SUBSCRIBE',
        channels: ['alerts', 'readings', 'personnel', 'devices', 'notifications']
      }));

      // Wait for subscription confirmation
      const checkSubscription = () => {
        const subMessage = this.receivedMessages.find(msg => msg.type === 'SUBSCRIPTION_CONFIRMED');
        if (subMessage) {
          logSuccess(`Subscribed to channels: ${subMessage.subscribedChannels.join(', ')}`);
          if (subMessage.rejectedChannels.length > 0) {
            logWarning(`Rejected channels: ${subMessage.rejectedChannels.join(', ')}`);
          }
          this.testResults.subscription = true;
          resolve();
        } else {
          setTimeout(checkSubscription, 100);
        }
      };

      setTimeout(checkSubscription, 100);
      
      // Timeout after 3 seconds
      setTimeout(() => {
        if (!this.testResults.subscription) {
          reject(new Error('Subscription timeout'));
        }
      }, 3000);
    });
  }

  async testDatabaseIntegration() {
    log('\n🗄️  Test 4: Database Integration', 'cyan');
    
    try {
      // Connect to database
      this.dbClient = new Client(DB_CONFIG);
      await this.dbClient.connect();
      logSuccess('Connected to database');

      const beforeMessageCount = this.receivedMessages.length;

      // Create a test dose reading to trigger real-time updates
      const result = await this.dbClient.query(`
        INSERT INTO radiation_dose_readings (device_id, measured_ts, gateway_ts, hp10_msv, hp007_msv, rate_usv_h, battery_pct, raw_json)
        VALUES (1, NOW(), NOW(), 30.5, 25.3, 45.0, 85.0, '{"test": "realtime"}')
        RETURNING id
      `);

      const readingId = result.rows[0].id;
      logInfo(`Created test dose reading with ID: ${readingId}`);

      // Wait for real-time message (check for any broadcast)
      await this.waitForRealtimeMessage('BROADCAST');

      // Clean up test data
      await this.dbClient.query('DELETE FROM radiation_dose_readings WHERE id = $1', [readingId]);
      logInfo(`Cleaned up test reading ID: ${readingId}`);

      const afterMessageCount = this.receivedMessages.length;
      if (afterMessageCount > beforeMessageCount) {
        logSuccess('Real-time database integration working');
        this.testResults.databaseEvents = true;
      } else {
        throw new Error('No real-time messages received from database');
      }

    } catch (error) {
      logError(`Database integration test failed: ${error.message}`);
      throw error;
    }
  }

  async testRealtimeNotifications() {
    log('\n📱 Test 5: Real-time Notifications', 'cyan');
    
    try {
      const beforeMessageCount = this.receivedMessages.length;

      // Create a high-severity alert to trigger notifications
      const result = await this.dbClient.query(`
        INSERT INTO radiation_alerts (type, severity, threshold, value, device_id, personnel_id, measured_ts, details)
        VALUES ('TEST_ALERT', 'CRITICAL', 50.0, 75.5, 1, 1, NOW(), '{"test": "notification"}')
        RETURNING id
      `);

      const alertId = result.rows[0].id;
      logInfo(`Created test critical alert with ID: ${alertId}`);

      // Wait for real-time notification (check for any broadcast)
      await this.waitForRealtimeMessage('BROADCAST');

      // Clean up test data
      await this.dbClient.query('DELETE FROM radiation_alerts WHERE id = $1', [alertId]);
      logInfo(`Cleaned up test alert ID: ${alertId}`);

      const afterMessageCount = this.receivedMessages.length;
      if (afterMessageCount > beforeMessageCount) {
        logSuccess('Real-time notifications working');
        this.testResults.notifications = true;
      } else {
        throw new Error('No notification messages received');
      }

    } catch (error) {
      logError(`Notification test failed: ${error.message}`);
      throw error;
    }
  }

  async testCleanup() {
    log('\n🧹 Test 6: Cleanup', 'cyan');
    
    try {
      // Close database connection
      if (this.dbClient) {
        await this.dbClient.end();
        logSuccess('Database connection closed');
      }

      // Close WebSocket connection
      if (this.ws) {
        this.ws.close();
        logSuccess('WebSocket connection closed');
      }

      this.testResults.cleanup = true;
      logSuccess('Cleanup completed');

    } catch (error) {
      logError(`Cleanup failed: ${error.message}`);
      throw error;
    }
  }

  async waitForRealtimeMessage(messageType, channel, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkMessage = () => {
        const message = this.receivedMessages.find(msg => 
          msg.type === messageType && 
          (!channel || msg.channel === channel)
        );
        
        if (message) {
          logSuccess(`Received real-time message: ${messageType} on ${channel || 'any channel'}`);
          resolve(message);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for ${messageType} message`));
        } else {
          setTimeout(checkMessage, 100);
        }
      };

      checkMessage();
    });
  }

  showTestResults() {
    log('\n📊 Test Results Summary', 'bright');
    log('=' .repeat(60), 'cyan');
    
    const results = [
      { name: 'WebSocket Connection', passed: this.testResults.connection },
      { name: 'Authentication', passed: this.testResults.authentication },
      { name: 'Channel Subscription', passed: this.testResults.subscription },
      { name: 'Database Integration', passed: this.testResults.databaseEvents },
      { name: 'Real-time Notifications', passed: this.testResults.notifications },
      { name: 'Cleanup', passed: this.testResults.cleanup }
    ];

    results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const color = result.passed ? 'green' : 'red';
      log(`${index + 1}. ${result.name}: ${status}`, color);
    });

    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const passRate = Math.round((passedTests / totalTests) * 100);

    log(`\n📈 Overall Results: ${passedTests}/${totalTests} tests passed (${passRate}%)`, 'bright');
    
    if (passedTests === totalTests) {
      log('🎉 ALL TESTS PASSED! Real-time monitoring system is fully operational!', 'green');
    } else {
      log('⚠️  Some tests failed. Check the output above for details.', 'yellow');
    }

    // Show message statistics
    log(`\n📨 Messages Received: ${this.receivedMessages.length}`, 'cyan');
    if (this.receivedMessages.length > 0) {
      const messageTypes = {};
      this.receivedMessages.forEach(msg => {
        messageTypes[msg.type] = (messageTypes[msg.type] || 0) + 1;
      });

      log('Message breakdown:', 'cyan');
      Object.entries(messageTypes).forEach(([type, count]) => {
        log(`  - ${type}: ${count}`, 'yellow');
      });
    }

    if (this.connectedAt) {
      const duration = Date.now() - this.connectedAt.getTime();
      log(`\n⏱️  Test Duration: ${duration}ms`, 'cyan');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const tester = new RealtimeSystemTester();
  
  try {
    await tester.runAllTests();
    process.exit(0);
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('Real-time System Test Suite', 'bright');
  log('\nUsage:', 'cyan');
  log('  node scripts/test-realtime-system.js [options]', 'yellow');
  log('\nOptions:', 'cyan');
  log('  --help, -h     Show this help message', 'yellow');
  log('\nDescription:', 'cyan');
  log('  Tests the complete real-time monitoring system including:', 'yellow');
  log('  - WebSocket connections', 'yellow');
  log('  - Authentication', 'yellow');
  log('  - Channel subscriptions', 'yellow');
  log('  - Database integration', 'yellow');
  log('  - Real-time notifications', 'yellow');
  process.exit(0);
}

// Run the tests
main().catch(error => {
  logError(`Test script failed: ${error.message}`);
  process.exit(1);
});
