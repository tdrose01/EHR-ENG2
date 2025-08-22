#!/usr/bin/env node

/**
 * Real-Time Frontend Integration Demo
 * This script simulates real-time radiation monitoring data
 * to demonstrate the frontend integration
 */

const WebSocket = require('ws');

console.log('🚀 Starting Real-Time Frontend Integration Demo');
console.log('===============================================\n');

// Configuration
const WS_URL = 'ws://localhost:3005/ws';
const DEMO_INTERVAL = 3000; // 3 seconds between updates

let ws = null;
let isConnected = false;
let demoInterval = null;

// Demo data generators
const generateDoseReading = () => {
  const hp10_msv = Math.random() * 50; // 0-50 mSv
  const hp007_msv = Math.random() * 50; // 0-50 mSv
  const rate_usv_h = Math.random() * 1000; // 0-1000 µSv/h
  
  return {
    id: Date.now(),
    hp10_msv: parseFloat(hp10_msv.toFixed(2)),
    hp007_msv: parseFloat(hp007_msv.toFixed(2)),
    rate_usv_h: parseFloat(rate_usv_h.toFixed(1)),
    battery_pct: Math.floor(Math.random() * 100),
    measured_ts: new Date().toISOString(),
    isHigh: hp10_msv > 25,
    isAnomalous: hp10_msv > 40 || rate_usv_h > 800
  };
};

const generateAlert = () => {
  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const types = ['DOSE_THRESHOLD', 'RATE_SPIKE', 'DEVICE_MALFUNCTION', 'BATTERY_LOW'];
  
  const severity = severities[Math.floor(Math.random() * severities.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  
  return {
    id: Date.now(),
    severity,
    type,
    message: `${severity} alert: ${type.replace('_', ' ').toLowerCase()}`,
    value: Math.random() * 100,
    threshold: 25,
    measured_ts: new Date().toISOString()
  };
};

const generatePersonnelUpdate = () => {
  const ranks = ['HM3', 'HM2', 'HM1', 'HMC', 'HMCS'];
  const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
  
  return {
    id: Date.now(),
    rank_rate: ranks[Math.floor(Math.random() * ranks.length)],
    fname: names[Math.floor(Math.random() * names.length)],
    lname: names[Math.floor(Math.random() * names.length)],
    edipi: Math.floor(Math.random() * 9000000000) + 1000000000,
    updateType: 'ADDED'
  };
};

// WebSocket connection management
const connect = () => {
  console.log('🔌 Connecting to WebSocket server...');
  
  ws = new WebSocket(WS_URL);
  
  ws.on('open', () => {
    console.log('✅ WebSocket connected successfully');
    isConnected = true;
    
    // Authenticate as admin
    authenticate();
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(message);
    } catch (error) {
      console.error('❌ Error parsing message:', error);
    }
  });
  
  ws.on('close', (code, reason) => {
    console.log(`🔌 WebSocket connection closed: ${code} - ${reason}`);
    isConnected = false;
    stopDemo();
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
    isConnected = false;
  });
};

const authenticate = () => {
  console.log('🔐 Authenticating as admin...');
  
  const authMessage = {
    type: 'AUTHENTICATE',
    token: 'demo-token',
    userId: 'demo-user',
    role: 'admin'
  };
  
  ws.send(JSON.stringify(authMessage));
};

const subscribe = () => {
  console.log('📡 Subscribing to real-time channels...');
  
  const subscribeMessage = {
    type: 'SUBSCRIBE',
    channels: ['alerts', 'readings', 'personnel', 'devices', 'notifications']
  };
  
  ws.send(JSON.stringify(subscribeMessage));
};

const handleMessage = (message) => {
  switch (message.type) {
    case 'CONNECTION_ESTABLISHED':
      console.log('🔌 Connection established:', message.connectionId);
      break;
      
    case 'AUTHENTICATED':
      console.log('✅ Authenticated successfully');
      subscribe();
      break;
      
    case 'SUBSCRIPTION_CONFIRMED':
      console.log('📡 Subscriptions confirmed:', message.subscribedChannels);
      startDemo();
      break;
      
    case 'BROADCAST':
      console.log(`📡 Broadcast received on channel: ${message.channel}`);
      break;
      
    case 'NOTIFICATION':
      console.log('📱 Notification received:', message.notification?.title);
      break;
      
    default:
      console.log('📨 Message received:', message.type);
  }
};

// Demo control
const startDemo = () => {
  console.log('\n🎭 Starting real-time data simulation...');
  console.log('   This will generate live data every 3 seconds');
  console.log('   Open the real-time dashboard in your browser to see the updates\n');
  
  demoInterval = setInterval(() => {
    if (!isConnected) return;
    
    // Generate random data
    const dataType = Math.floor(Math.random() * 3);
    
    switch (dataType) {
      case 0:
        simulateDoseReading();
        break;
      case 1:
        simulateAlert();
        break;
      case 2:
        simulatePersonnelUpdate();
        break;
    }
  }, DEMO_INTERVAL);
};

const stopDemo = () => {
  if (demoInterval) {
    clearInterval(demoInterval);
    demoInterval = null;
    console.log('⏹️ Demo stopped');
  }
};

// Data simulation functions
const simulateDoseReading = () => {
  const reading = generateDoseReading();
  
  console.log(`📊 Simulating dose reading: ${reading.hp10_msv} mSv (HP10) - ${reading.isHigh ? 'HIGH' : 'normal'}`);
  
  // In a real scenario, this would be inserted into the database
  // which would trigger the real-time notification
  console.log('   → This would trigger a real-time update to all connected clients');
};

const simulateAlert = () => {
  const alert = generateAlert();
  
  console.log(`🚨 Simulating ${alert.severity} alert: ${alert.type}`);
  
  // In a real scenario, this would be inserted into the database
  // which would trigger the real-time notification
  console.log('   → This would trigger a real-time alert to all connected clients');
};

const simulatePersonnelUpdate = () => {
  const personnel = generatePersonnelUpdate();
  
  console.log(`👤 Simulating personnel update: ${personnel.rank_rate} ${personnel.fname} ${personnel.lname}`);
  
  // In a real scenario, this would be inserted into the database
  // which would trigger the real-time notification
  console.log('   → This would trigger a real-time personnel update to all connected clients');
};

// Cleanup and error handling
const cleanup = () => {
  console.log('\n🧹 Cleaning up...');
  stopDemo();
  
  if (ws) {
    ws.close();
  }
  
  process.exit(0);
};

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start the demo
console.log('📋 Demo Instructions:');
console.log('1. Make sure your server is running (npm run start:server)');
console.log('2. Open the real-time dashboard in your browser');
console.log('3. Watch for real-time updates as this script generates data');
console.log('4. Press Ctrl+C to stop the demo\n');

// Connect to WebSocket server
connect();

// Keep the process alive
setInterval(() => {
  if (!isConnected) {
    console.log('🔄 Attempting to reconnect...');
    connect();
  }
}, 10000);
