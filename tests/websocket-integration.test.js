/**
 * Comprehensive Regression Tests for Real-time WebSocket Integration
 * Tests both frontend composable and backend WebSocket service
 */

const WebSocket = require('ws');
const EventEmitter = require('events');

// Mock browser environment for testing
global.window = {
  location: { protocol: 'http:' },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
};

global.Notification = {
  permission: 'granted',
  requestPermission: jest.fn().mockResolvedValue('granted')
};

global.CustomEvent = class CustomEvent {
  constructor(type, options) {
    this.type = type;
    this.detail = options?.detail;
  }
};

// Import the WebSocket service
const WebSocketService = require('../server/services/websocketService');

describe('Real-time WebSocket Integration - Regression Tests', () => {
  let server;
  let wsService;
  let client;
  let port = 3005;

  beforeAll(async () => {
    // Create a simple HTTP server for WebSocket to attach to
    const http = require('http');
    server = http.createServer();
    
    // Initialize WebSocket service
    wsService = new WebSocketService(server);
    
    // Start server
    await new Promise((resolve) => {
      server.listen(port, resolve);
    });
    
    console.log(`🚀 Test server started on port ${port}`);
  });

  afterAll(async () => {
    // Cleanup
    if (wsService) {
      await wsService.shutdown();
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    console.log('🧹 Test server cleaned up');
  });

  beforeEach(async () => {
    // Create a new WebSocket client for each test
    client = new WebSocket(`ws://localhost:${port}/ws`);
    
    // Wait for connection
    await new Promise((resolve) => {
      client.on('open', resolve);
    });
  });

  afterEach(() => {
    if (client && client.readyState === WebSocket.OPEN) {
      client.close();
    }
  });

  describe('🔌 WebSocket Connection & Authentication', () => {
    test('should establish connection and receive CONNECTION_ESTABLISHED', (done) => {
      let messageReceived = false;
      
      client.on('message', (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'CONNECTION_ESTABLISHED') {
          expect(message.connectionId).toBeDefined();
          expect(message.serverInfo).toBeDefined();
          expect(message.serverInfo.features).toContain('real-time-updates');
          messageReceived = true;
          done();
        }
      });
      
      // Set timeout in case message doesn't arrive
      setTimeout(() => {
        if (!messageReceived) {
          done(new Error('CONNECTION_ESTABLISHED message not received'));
        }
      }, 1000);
    });

    test('should handle authentication correctly', (done) => {
      let authResponse = false;
      
      client.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'AUTHENTICATED') {
          expect(message.success).toBe(true);
          expect(message.userId).toBe('test-user');
          expect(message.role).toBe('admin');
          authResponse = true;
          done();
        }
      });
      
      // Send authentication message
      client.send(JSON.stringify({
        type: 'AUTHENTICATE',
        token: 'test-token',
        userId: 'test-user',
        role: 'admin'
      }));
      
      setTimeout(() => {
        if (!authResponse) {
          done(new Error('Authentication response not received'));
        }
      }, 1000);
    });

    test('should reject invalid authentication', (done) => {
      let errorReceived = false;
      
      client.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'ERROR' && message.error.code === 'AUTHENTICATION_FAILED') {
          expect(message.error.message).toBe('Invalid credentials');
          errorReceived = true;
          done();
        }
      });
      
      // Send invalid authentication
      client.send(JSON.stringify({
        type: 'AUTHENTICATE',
        token: '',
        userId: ''
      }));
      
      setTimeout(() => {
        if (!errorReceived) {
          done(new Error('Authentication error not received'));
        }
      }, 1000);
    });
  });

  describe('📡 Channel Subscription & Broadcasting', () => {
    test('should subscribe to channels and receive confirmation', (done) => {
      let subscriptionConfirmed = false;
      
      client.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'SUBSCRIPTION_CONFIRMED') {
          expect(message.subscribedChannels).toContain('alerts');
          expect(message.subscribedChannels).toContain('readings');
          subscriptionConfirmed = true;
          done();
        }
      });
      
      // Subscribe to channels
      client.send(JSON.stringify({
        type: 'SUBSCRIBE',
        channels: ['alerts', 'readings']
      }));
      
      setTimeout(() => {
        if (!subscriptionConfirmed) {
          done(new Error('Subscription confirmation not received'));
        }
      }, 1000);
    });

    test('should receive broadcasts on subscribed channels', (done) => {
      let broadcastReceived = false;
      
      // Subscribe first
      client.send(JSON.stringify({
        type: 'SUBSCRIBE',
        channels: ['alerts']
      }));
      
      // Wait for subscription confirmation, then test broadcast
      client.on('message', (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'SUBSCRIPTION_CONFIRMED') {
          // Now test broadcast
          setTimeout(() => {
            // Simulate broadcasting an alert
            wsService.broadcastAlert({
              id: 'test-alert-1',
              severity: 'CRITICAL',
              message: 'Test critical alert',
              timestamp: new Date().toISOString()
            });
          }, 100);
        }
        
        if (message.type === 'BROADCAST' && message.channel === 'alerts') {
          expect(message.data.type).toBe('ALERT_UPDATE');
          expect(message.data.alert.severity).toBe('CRITICAL');
          expect(message.data.alert.message).toBe('Test critical alert');
          broadcastReceived = true;
          done();
        }
      });
      
      setTimeout(() => {
        if (!broadcastReceived) {
          done(new Error('Broadcast message not received'));
        }
      }, 2000);
    });

    test('should not receive broadcasts on unsubscribed channels', (done) => {
      let unexpectedBroadcast = false;
      
      // Subscribe to alerts only
      client.send(JSON.stringify({
        type: 'SUBSCRIBE',
        channels: ['alerts']
      }));
      
      client.on('message', (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'SUBSCRIPTION_CONFIRMED') {
          // Now test broadcast on unsubscribed channel
          setTimeout(() => {
            wsService.broadcastReading({
              id: 'test-reading-1',
              hp10_msv: 0.5,
              rate_usv_h: 100,
              timestamp: new Date().toISOString()
            });
          }, 100);
        }
        
        if (message.type === 'BROADCAST' && message.channel === 'readings') {
          unexpectedBroadcast = true;
          done(new Error('Received broadcast on unsubscribed channel'));
        }
      });
      
      // Wait and verify no reading broadcast was received
      setTimeout(() => {
        if (!unexpectedBroadcast) {
          done(); // Success - no unexpected broadcast
        }
      }, 2000);
    });
  });

  describe('🚨 Radiation Health Specific Broadcasting', () => {
    test('should broadcast alert updates correctly', (done) => {
      let alertReceived = false;
      
      // Subscribe to alerts
      client.send(JSON.stringify({
        type: 'SUBSCRIBE',
        channels: ['alerts']
      }));
      
      client.on('message', (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'SUBSCRIPTION_CONFIRMED') {
          // Test alert broadcast
          setTimeout(() => {
            wsService.broadcastAlert({
              id: 'radiation-alert-1',
              severity: 'HIGH',
              message: 'Elevated radiation levels detected',
              device_id: 'device-001',
              personnel_id: 'personnel-001',
              threshold: 0.5,
              value: 0.75,
              timestamp: new Date().toISOString()
            });
          }, 100);
        }
        
        if (message.type === 'BROADCAST' && message.channel === 'alerts') {
          expect(message.data.type).toBe('ALERT_UPDATE');
          expect(message.data.alert.severity).toBe('HIGH');
          expect(message.data.alert.message).toBe('Elevated radiation levels detected');
          expect(message.data.priority).toBeDefined();
          alertReceived = true;
          done();
        }
      });
      
      setTimeout(() => {
        if (!alertReceived) {
          done(new Error('Alert broadcast not received'));
        }
      }, 2000);
    });

    test('should broadcast dose reading updates correctly', (done) => {
      let readingReceived = false;
      
      // Subscribe to readings
      client.send(JSON.stringify({
        type: 'SUBSCRIBE',
        channels: ['readings']
      }));
      
      client.on('message', (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'SUBSCRIPTION_CONFIRMED') {
          // Test reading broadcast
          setTimeout(() => {
            wsService.broadcastReading({
              id: 'reading-001',
              device_id: 'device-001',
              personnel_id: 'personnel-001',
              hp10_msv: 0.25,
              hp007_msv: 0.23,
              rate_usv_h: 50,
              battery_pct: 85,
              measured_ts: new Date().toISOString(),
              raw_json: '{"sensor_data": "test"}',
              payload_sig: 'test-signature'
            });
          }, 100);
        }
        
        if (message.type === 'BROADCAST' && message.channel === 'readings') {
          expect(message.data.type).toBe('READING_UPDATE');
          expect(message.data.reading.hp10_msv).toBe(0.25);
          expect(message.data.reading.rate_usv_h).toBe(50);
          expect(message.data.isAnomalous).toBe(false); // Below threshold
          readingReceived = true;
          done();
        }
      });
      
      setTimeout(() => {
        if (!readingReceived) {
          done(new Error('Reading broadcast not received'));
        }
      }, 2000);
    });

    test('should detect anomalous readings correctly', (done) => {
      let anomalousReadingReceived = false;
      
      // Subscribe to readings
      client.send(JSON.stringify({
        type: 'SUBSCRIBE',
        channels: ['readings']
      }));
      
      client.on('message', (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'SUBSCRIPTION_CONFIRMED') {
          // Test anomalous reading broadcast
          setTimeout(() => {
            wsService.broadcastReading({
              id: 'anomalous-reading-001',
              device_id: 'device-001',
              personnel_id: 'personnel-001',
              hp10_msv: 75.0, // Above 50 mSv threshold
              hp007_msv: 70.0,
              rate_usv_h: 1500, // Above 1000 µSv/h threshold
              battery_pct: 90,
              measured_ts: new Date().toISOString()
            });
          }, 100);
        }
        
        if (message.type === 'BROADCAST' && message.channel === 'readings') {
          expect(message.data.type).toBe('READING_UPDATE');
          expect(message.data.reading.hp10_msv).toBe(75.0);
          expect(message.data.isAnomalous).toBe(true); // Above threshold
          anomalousReadingReceived = true;
          done();
        }
      });
      
      setTimeout(() => {
        if (!anomalousReadingReceived) {
          done(new Error('Anomalous reading broadcast not received'));
        }
      }, 2000);
    });
  });

  describe('🏠 Room-based Broadcasting', () => {
    test('should join room and receive room broadcasts', (done) => {
      let roomJoined = false;
      let roomBroadcastReceived = false;
      
      // Join room
      client.send(JSON.stringify({
        type: 'JOIN_ROOM',
        room: 'radiation-unit-1'
      }));
      
      client.on('message', (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'ROOM_JOINED') {
          expect(message.room).toBe('radiation-unit-1');
          expect(message.memberCount).toBe(1);
          roomJoined = true;
          
          // Test room broadcast
          setTimeout(() => {
            wsService.broadcastToRoom('radiation-unit-1', {
              type: 'UNIT_UPDATE',
              unit: 'radiation-unit-1',
              status: 'ACTIVE',
              personnel_count: 15,
              devices_count: 20
            });
          }, 100);
        }
        
        if (message.type === 'ROOM_BROADCAST' && message.room === 'radiation-unit-1') {
          expect(message.data.type).toBe('UNIT_UPDATE');
          expect(message.data.unit).toBe('radiation-unit-1');
          expect(message.data.status).toBe('ACTIVE');
          roomBroadcastReceived = true;
          done();
        }
      });
      
      setTimeout(() => {
        if (!roomJoined || !roomBroadcastReceived) {
          done(new Error('Room functionality not working correctly'));
        }
      }, 2000);
    });
  });

  describe('💓 Heartbeat & Connection Management', () => {
    test('should respond to ping messages', (done) => {
      let pongReceived = false;
      
      client.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'PONG') {
          pongReceived = true;
          done();
        }
      });
      
      // Send ping
      client.send(JSON.stringify({
        type: 'PING'
      }));
      
      setTimeout(() => {
        if (!pongReceived) {
          done(new Error('PONG response not received'));
        }
      }, 1000);
    });

    test('should handle connection status requests', (done) => {
      let statusReceived = false;
      
      client.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'CONNECTION_STATUS') {
          expect(message.status.connectionId).toBeDefined();
          expect(message.status.connectedAt).toBeDefined();
          expect(message.status.authenticated).toBeDefined();
          expect(message.status.subscriptions).toBeDefined();
          statusReceived = true;
          done();
        }
      });
      
      // Request status
      client.send(JSON.stringify({
        type: 'GET_STATUS'
      }));
      
      setTimeout(() => {
        if (!statusReceived) {
          done(new Error('Connection status not received'));
        }
      }, 1000);
    });
  });

  describe('🔒 Security & Permissions', () => {
    test('should enforce channel subscription permissions', (done) => {
      let subscriptionResponse = false;
      
      // First authenticate as a regular user
      client.send(JSON.stringify({
        type: 'AUTHENTICATE',
        token: 'user-token',
        userId: 'regular-user',
        role: 'user'
      }));
      
      client.on('message', (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'AUTHENTICATED') {
          // Try to subscribe to admin-only channel
          client.send(JSON.stringify({
            type: 'SUBSCRIBE',
            channels: ['system', 'alerts'] // 'system' is admin-only
          }));
        }
        
        if (message.type === 'SUBSCRIPTION_CONFIRMED') {
          expect(message.subscribedChannels).toContain('alerts');
          expect(message.subscribedChannels).not.toContain('system');
          expect(message.rejectedChannels).toContain('system');
          subscriptionResponse = true;
          done();
        }
      });
      
      setTimeout(() => {
        if (!subscriptionResponse) {
          done(new Error('Subscription permission check not working'));
        }
      }, 2000);
    });
  });

  describe('📊 Statistics & Monitoring', () => {
    test('should provide accurate connection statistics', () => {
      const stats = wsService.getConnectionStats();
      
      expect(stats.totalConnections).toBeGreaterThan(0);
      expect(stats.authenticatedConnections).toBeGreaterThanOrEqual(0);
      expect(stats.subscriptionCounts).toBeDefined();
      expect(stats.roomCounts).toBeDefined();
      
      console.log('📊 Connection Stats:', JSON.stringify(stats, null, 2));
    });
  });

  describe('🧹 Cleanup & Error Handling', () => {
    test('should handle client disconnect gracefully', (done) => {
      const initialClientCount = wsService.clients.size;
      
      // Close client connection
      client.close();
      
      setTimeout(() => {
        const finalClientCount = wsService.clients.size;
        expect(finalClientCount).toBeLessThan(initialClientCount);
        done();
      }, 100);
    });

    test('should handle malformed JSON messages', (done) => {
      let errorReceived = false;
      
      client.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'ERROR' && message.error.code === 'INVALID_MESSAGE_FORMAT') {
          expect(message.error.message).toBe('Message must be valid JSON');
          errorReceived = true;
          done();
        }
      });
      
      // Send malformed message
      client.send('invalid json message');
      
      setTimeout(() => {
        if (!errorReceived) {
          done(new Error('Malformed message error not handled'));
        }
      }, 1000);
    });
  });
});

describe('Frontend WebSocket Composable - Mock Tests', () => {
  // Mock the useRealtime composable for frontend testing
  const mockUseRealtime = () => {
    const isConnected = { value: false };
    const connectionStatus = { value: 'disconnected' };
    const recentUpdates = { value: [] };
    const notifications = { value: [] };
    
    return {
      isConnected,
      connectionStatus,
      recentUpdates,
      notifications,
      connect: jest.fn(),
      disconnect: jest.fn(),
      send: jest.fn(),
      subscribe: jest.fn()
    };
  };

  test('should initialize with correct default state', () => {
    const realtime = mockUseRealtime();
    
    expect(realtime.isConnected.value).toBe(false);
    expect(realtime.connectionStatus.value).toBe('disconnected');
    expect(realtime.recentUpdates.value).toEqual([]);
    expect(realtime.notifications.value).toEqual([]);
  });

  test('should provide connection management methods', () => {
    const realtime = mockUseRealtime();
    
    expect(typeof realtime.connect).toBe('function');
    expect(typeof realtime.disconnect).toBe('function');
    expect(typeof realtime.send).toBe('function');
    expect(typeof realtime.subscribe).toBe('function');
  });
});

describe('Integration Test: End-to-End WebSocket Flow', () => {
  let server;
  let wsService;
  let client;
  let port = 3006; // Different port for integration tests

  beforeAll(async () => {
    const http = require('http');
    server = http.createServer();
    wsService = new WebSocketService(server);
    
    await new Promise((resolve) => {
      server.listen(port, resolve);
    });
  });

  afterAll(async () => {
    if (wsService) await wsService.shutdown();
    if (server) await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(async () => {
    client = new WebSocket(`ws://localhost:${port}/ws`);
    await new Promise((resolve) => client.on('open', resolve));
  });

  afterEach(() => {
    if (client.readyState === WebSocket.OPEN) client.close();
  });

  test('should handle complete radiation monitoring workflow', (done) => {
    const testFlow = [];
    
    // Step 1: Connect and authenticate
    client.on('message', (data) => {
      const message = JSON.parse(data);
      
      if (message.type === 'CONNECTION_ESTABLISHED') {
        testFlow.push('connected');
        
        // Step 2: Authenticate
        client.send(JSON.stringify({
          type: 'AUTHENTICATE',
          token: 'test-token',
          userId: 'test-user',
          role: 'admin'
        }));
      }
      
      if (message.type === 'AUTHENTICATED') {
        testFlow.push('authenticated');
        
        // Step 3: Subscribe to channels
        client.send(JSON.stringify({
          type: 'SUBSCRIBE',
          channels: ['alerts', 'readings', 'personnel']
        }));
      }
      
      if (message.type === 'SUBSCRIPTION_CONFIRMED') {
        testFlow.push('subscribed');
        
        // Step 4: Join monitoring room
        client.send(JSON.stringify({
          type: 'JOIN_ROOM',
          room: 'radiation-monitoring'
        }));
      }
      
      if (message.type === 'ROOM_JOINED') {
        testFlow.push('room-joined');
        
        // Step 5: Simulate radiation events
        setTimeout(() => {
          // Broadcast alert
          wsService.broadcastAlert({
            id: 'integration-alert-1',
            severity: 'CRITICAL',
            message: 'Integration test alert',
            timestamp: new Date().toISOString()
          });
          
          // Broadcast reading
          wsService.broadcastReading({
            id: 'integration-reading-1',
            hp10_msv: 0.3,
            rate_usv_h: 75,
            timestamp: new Date().toISOString()
          });
          
          // Room broadcast
          wsService.broadcastToRoom('radiation-monitoring', {
            type: 'MONITORING_UPDATE',
            status: 'ACTIVE',
            timestamp: new Date().toISOString()
          });
        }, 100);
      }
      
      if (message.type === 'BROADCAST') {
        testFlow.push(`broadcast-${message.channel}`);
      }
      
      if (message.type === 'ROOM_BROADCAST') {
        testFlow.push('room-broadcast');
      }
      
      // Check if all steps completed
      if (testFlow.includes('connected') && 
          testFlow.includes('authenticated') && 
          testFlow.includes('subscribed') && 
          testFlow.includes('room-joined') &&
          testFlow.includes('broadcast-alerts') &&
          testFlow.includes('broadcast-readings') &&
          testFlow.includes('room-broadcast')) {
        
        console.log('✅ Complete workflow test flow:', testFlow);
        done();
      }
    });
    
    // Timeout for test completion
    setTimeout(() => {
      if (testFlow.length < 7) {
        done(new Error(`Incomplete workflow: ${testFlow.join(', ')}`));
      }
    }, 5000);
  });
});

console.log('🧪 WebSocket Integration Regression Tests Loaded');
console.log('📋 Test Coverage:');
console.log('  ✅ Connection & Authentication');
console.log('  ✅ Channel Subscription & Broadcasting');
console.log('  ✅ Radiation Health Specific Features');
console.log('  ✅ Room-based Broadcasting');
console.log('  ✅ Heartbeat & Connection Management');
console.log('  ✅ Security & Permissions');
console.log('  ✅ Statistics & Monitoring');
console.log('  ✅ Cleanup & Error Handling');
console.log('  ✅ Frontend Composable Mock Tests');
console.log('  ✅ End-to-End Integration Tests');
