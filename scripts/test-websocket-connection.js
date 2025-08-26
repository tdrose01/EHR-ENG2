#!/usr/bin/env node

/**
 * Simple WebSocket Connection Test
 * Tests basic WebSocket connectivity to verify real-time functionality
 * 
 * Usage:
 *   node scripts/test-websocket-connection.js
 */

const WebSocket = require('ws');

// Configuration
const WS_URL = 'ws://localhost:3005/ws';
const TEST_TIMEOUT = 10000; // 10 seconds

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

function logSection(title) {
  log(`\n${title}`, 'yellow');
  log('-'.repeat(title.length));
}

// Test WebSocket connection
function testWebSocketConnection() {
  return new Promise((resolve, reject) => {
    logSection('Testing WebSocket Connection');
    log(`🔌 Attempting to connect to: ${WS_URL}`, 'blue');
    
    let connectionEstablished = false;
    let authenticationSuccessful = false;
    let subscriptionConfirmed = false;
    let testCompleted = false;
    
    // Create WebSocket connection
    const ws = new WebSocket(WS_URL);
    
    // Connection timeout
    const timeout = setTimeout(() => {
      if (!testCompleted) {
        ws.close();
        reject(new Error('Connection test timed out'));
      }
    }, TEST_TIMEOUT);
    
    // Connection opened
    ws.on('open', () => {
      log('✅ WebSocket connection opened successfully', 'green');
      
      // Wait a moment for initial messages
      setTimeout(() => {
        if (!connectionEstablished) {
          log('⚠️  No CONNECTION_ESTABLISHED message received', 'yellow');
        }
      }, 1000);
    });
    
    // Message received
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        log(`📨 Received message: ${message.type}`, 'cyan');
        
        switch (message.type) {
          case 'CONNECTION_ESTABLISHED':
            connectionEstablished = true;
            log('✅ Connection established message received', 'green');
            log(`   Connection ID: ${message.connectionId}`, 'white');
            log(`   Server Info: ${JSON.stringify(message.serverInfo)}`, 'white');
            
            // Test authentication
            setTimeout(() => {
              log('🔐 Testing authentication...', 'blue');
              ws.send(JSON.stringify({
                type: 'AUTHENTICATE',
                token: 'test-token',
                userId: 'test-user',
                role: 'admin'
              }));
            }, 500);
            break;
            
          case 'AUTHENTICATED':
            authenticationSuccessful = true;
            log('✅ Authentication successful', 'green');
            log(`   User ID: ${message.userId}`, 'white');
            log(`   Role: ${message.role}`, 'white');
            
            // Test subscription
            setTimeout(() => {
              log('📡 Testing channel subscription...', 'blue');
              ws.send(JSON.stringify({
                type: 'SUBSCRIBE',
                channels: ['alerts', 'readings', 'notifications']
              }));
            }, 500);
            break;
            
          case 'SUBSCRIPTION_CONFIRMED':
            subscriptionConfirmed = true;
            log('✅ Channel subscription confirmed', 'green');
            log(`   Subscribed channels: ${message.subscribedChannels.join(', ')}`, 'white');
            
            // Test ping
            setTimeout(() => {
              log('💓 Testing heartbeat...', 'blue');
              ws.send(JSON.stringify({ type: 'PING' }));
            }, 500);
            break;
            
          case 'PONG':
            log('✅ Heartbeat response received', 'green');
            
            // Test complete
            testCompleted = true;
            clearTimeout(timeout);
            ws.close();
            resolve({
              connectionEstablished,
              authenticationSuccessful,
              subscriptionConfirmed,
              status: 'SUCCESS'
            });
            break;
            
          case 'ERROR':
            log(`❌ Server error: ${message.error.code} - ${message.error.message}`, 'red');
            break;
            
          default:
            log(`ℹ️  Other message type: ${message.type}`, 'white');
        }
      } catch (error) {
        log(`❌ Error parsing message: ${error.message}`, 'red');
      }
    });
    
    // Connection closed
    ws.on('close', (code, reason) => {
      log(`🔌 WebSocket connection closed: ${code} - ${reason}`, 'yellow');
      
      if (!testCompleted) {
        clearTimeout(timeout);
        reject(new Error(`Connection closed unexpectedly: ${code} - ${reason}`));
      }
    });
    
    // Connection error
    ws.on('error', (error) => {
      log(`❌ WebSocket error: ${error.message}`, 'red');
      clearTimeout(timeout);
      reject(error);
    });
  });
}

// Test broadcasting functionality
function testBroadcasting() {
  return new Promise((resolve, reject) => {
    logSection('Testing Broadcasting Functionality');
    log('🔌 Creating second connection for broadcast testing...', 'blue');
    
    const ws1 = new WebSocket(WS_URL);
    const ws2 = new WebSocket(WS_URL);
    
    let ws1Ready = false;
    let ws2Ready = false;
    let broadcastReceived = false;
    
    const timeout = setTimeout(() => {
      ws1.close();
      ws2.close();
      reject(new Error('Broadcast test timed out'));
    }, TEST_TIMEOUT);
    
    // Setup first connection
    ws1.on('open', () => {
      log('✅ First connection opened', 'green');
      ws1.send(JSON.stringify({
        type: 'AUTHENTICATE',
        token: 'test-token-1',
        userId: 'test-user-1',
        role: 'admin'
      }));
    });
    
    ws1.on('message', (data) => {
      const message = JSON.parse(data);
      
      if (message.type === 'AUTHENTICATED') {
        ws1.send(JSON.stringify({
          type: 'SUBSCRIBE',
          channels: ['alerts']
        }));
      }
      
      if (message.type === 'SUBSCRIPTION_CONFIRMED') {
        ws1Ready = true;
        log('✅ First connection subscribed to alerts', 'green');
        checkReady();
      }
    });
    
    // Setup second connection
    ws2.on('open', () => {
      log('✅ Second connection opened', 'green');
      ws2.send(JSON.stringify({
        type: 'AUTHENTICATE',
        token: 'test-token-2',
        userId: 'test-user-2',
        role: 'admin'
      }));
    });
    
    ws2.on('message', (data) => {
      const message = JSON.parse(data);
      
      if (message.type === 'AUTHENTICATED') {
        ws2.send(JSON.stringify({
          type: 'SUBSCRIBE',
          channels: ['alerts']
        }));
      }
      
      if (message.type === 'SUBSCRIPTION_CONFIRMED') {
        ws2Ready = true;
        log('✅ Second connection subscribed to alerts', 'green');
        checkReady();
      }
      
      if (message.type === 'BROADCAST' && message.channel === 'alerts') {
        broadcastReceived = true;
        log('✅ Broadcast message received on second connection', 'green');
        log(`   Alert: ${message.data.alert.severity} - ${message.data.alert.message}`, 'white');
        
        // Test complete
        clearTimeout(timeout);
        ws1.close();
        ws2.close();
        resolve({
          status: 'SUCCESS',
          broadcastReceived
        });
      }
    });
    
    function checkReady() {
      if (ws1Ready && ws2Ready) {
        log('🚨 Simulating radiation alert broadcast...', 'blue');
        
        // Send a test alert through the first connection
        setTimeout(() => {
          ws1.send(JSON.stringify({
            type: 'BROADCAST',
            channel: 'alerts',
            data: {
              type: 'ALERT_UPDATE',
              alert: {
                id: 'test-alert-001',
                severity: 'CRITICAL',
                message: 'Test radiation alert from WebSocket test',
                timestamp: new Date().toISOString()
              }
            }
          }));
        }, 1000);
      }
    }
    
    // Error handling
    ws1.on('error', (error) => {
      log(`❌ First connection error: ${error.message}`, 'red');
      clearTimeout(timeout);
      reject(error);
    });
    
    ws2.on('error', (error) => {
      log(`❌ Second connection error: ${error.message}`, 'red');
      clearTimeout(timeout);
      reject(error);
    });
  });
}

// Main test execution
async function runTests() {
  logHeader('WebSocket Connection Test Suite');
  
  try {
    // Test 1: Basic connection
    log('🧪 Test 1: Basic WebSocket Connection', 'bright');
    const connectionResult = await testWebSocketConnection();
    log(`✅ Connection test result: ${JSON.stringify(connectionResult, null, 2)}`, 'green');
    
    // Test 2: Broadcasting
    log('\n🧪 Test 2: Broadcasting Functionality', 'bright');
    const broadcastResult = await testBroadcasting();
    log(`✅ Broadcast test result: ${JSON.stringify(broadcastResult, null, 2)}`, 'green');
    
    // Summary
    logSection('Test Summary');
    log('🎉 All WebSocket tests completed successfully!', 'green');
    log('✅ Real-time functionality is working correctly', 'green');
    log('✅ Frontend should receive real-time updates', 'green');
    
  } catch (error) {
    logSection('Test Failure');
    log(`❌ Test failed: ${error.message}`, 'red');
    log('🔍 Check the following:', 'yellow');
    log('   1. Is the backend server running on port 3005?', 'white');
    log('   2. Is the WebSocket service properly initialized?', 'white');
    log('   3. Are there any firewall or network issues?', 'white');
    log('   4. Check server logs for WebSocket errors', 'white');
    
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch((error) => {
    log(`❌ Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  testWebSocketConnection,
  testBroadcasting,
  runTests
};
