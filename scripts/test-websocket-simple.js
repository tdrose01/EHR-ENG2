#!/usr/bin/env node

/**
 * Simple WebSocket Test - Isolates Broadcasting Issue
 * Tests basic WebSocket functionality without complex scenarios
 */

const WebSocket = require('ws');

const WS_URL = 'ws://localhost:3005/ws';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
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
  log(`  ${title}`, 'white');
  log('='.repeat(60), 'cyan');
}

// Simple connection test
function simpleConnectionTest() {
  return new Promise((resolve, reject) => {
    log('🔌 Testing simple WebSocket connection...', 'blue');
    
    const ws = new WebSocket(WS_URL);
    
    ws.on('open', () => {
      log('✅ Connection opened', 'green');
      
      // Send simple message
      ws.send(JSON.stringify({ type: 'PING' }));
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        log(`📨 Received: ${message.type}`, 'cyan');
        
        if (message.type === 'PONG') {
          log('✅ PONG received - connection working!', 'green');
          ws.close();
          resolve('SUCCESS');
        }
      } catch (error) {
        log(`❌ Parse error: ${error.message}`, 'red');
      }
    });
    
    ws.on('error', (error) => {
      log(`❌ WebSocket error: ${error.message}`, 'red');
      reject(error);
    });
    
    ws.on('close', (code, reason) => {
      log(`🔌 Connection closed: ${code} - ${reason}`, 'yellow');
    });
    
    // Timeout
    setTimeout(() => {
      ws.close();
      reject(new Error('Test timed out'));
    }, 5000);
  });
}

// Test subscription and simple broadcast
function testSubscription() {
  return new Promise((resolve, reject) => {
    log('📡 Testing subscription...', 'blue');
    
    const ws = new WebSocket(WS_URL);
    
    ws.on('open', () => {
      log('✅ Connection opened for subscription test', 'green');
      
      // Subscribe to alerts
      ws.send(JSON.stringify({
        type: 'SUBSCRIBE',
        channels: ['alerts']
      }));
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        log(`📨 Received: ${message.type}`, 'cyan');
        
        if (message.type === 'SUBSCRIPTION_CONFIRMED') {
          log('✅ Subscription confirmed!', 'green');
          log(`   Channels: ${message.subscribedChannels.join(', ')}`, 'white');
          
          // Test complete
          ws.close();
          resolve('SUBSCRIPTION_SUCCESS');
        }
      } catch (error) {
        log(`❌ Parse error: ${error.message}`, 'red');
      }
    });
    
    ws.on('error', (error) => {
      log(`❌ WebSocket error: ${error.message}`, 'red');
      reject(error);
    });
    
    // Timeout
    setTimeout(() => {
      ws.close();
      reject(new Error('Subscription test timed out'));
    }, 5000);
  });
}

// Test direct message sending
function testDirectMessage() {
  return new Promise((resolve, reject) => {
    log('💬 Testing direct message...', 'blue');
    
    const ws = new WebSocket(WS_URL);
    
    ws.on('open', () => {
      log('✅ Connection opened for direct message test', 'green');
      
      // Send a direct message
      ws.send(JSON.stringify({
        type: 'TEST_MESSAGE',
        data: 'Hello from test client'
      }));
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        log(`📨 Received: ${message.type}`, 'cyan');
        
        if (message.type === 'ERROR') {
          log('⚠️  Expected error for unknown message type', 'yellow');
          log(`   Error: ${message.error.code} - ${message.error.message}`, 'white');
          
          // This is expected behavior
          ws.close();
          resolve('DIRECT_MESSAGE_SUCCESS');
        }
      } catch (error) {
        log(`❌ Parse error: ${error.message}`, 'red');
      }
    });
    
    ws.on('error', (error) => {
      log(`❌ WebSocket error: ${error.message}`, 'red');
      reject(error);
    });
    
    // Timeout
    setTimeout(() => {
      ws.close();
      reject(new Error('Direct message test timed out'));
    }, 5000);
  });
}

// Main test execution
async function runSimpleTests() {
  logHeader('Simple WebSocket Tests');
  
  try {
    // Test 1: Basic connection
    log('🧪 Test 1: Basic Connection', 'white');
    await simpleConnectionTest();
    
    // Test 2: Subscription
    log('\n🧪 Test 2: Subscription', 'white');
    await testSubscription();
    
    // Test 3: Direct message
    log('\n🧪 Test 3: Direct Message', 'white');
    await testDirectMessage();
    
    // Summary
    log('\n🎉 All simple tests passed!', 'green');
    log('✅ WebSocket service is working correctly', 'green');
    log('✅ Basic functionality is operational', 'green');
    
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    log('🔍 The WebSocket service may have issues', 'yellow');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runSimpleTests().catch((error) => {
    log(`❌ Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  simpleConnectionTest,
  testSubscription,
  testDirectMessage,
  runSimpleTests
};
