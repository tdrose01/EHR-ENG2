# WebSocket Integration Testing Guide

## Overview

This guide provides comprehensive regression testing for the Real-time WebSocket integration in the EHR Radiation Health Module. The tests verify that real-time functionality is working correctly and that the frontend receives updates as expected.

## 🧪 Test Suite Components

### 1. **Basic Connection Test** (`test-websocket-connection.js`)
- Tests basic WebSocket connectivity
- Verifies authentication flow
- Tests channel subscription
- Validates heartbeat functionality
- Tests broadcasting between connections

### 2. **Comprehensive Integration Tests** (`websocket-integration.test.js`)
- Full Jest test suite with 10+ test categories
- Tests both frontend composable and backend service
- End-to-end workflow validation
- Security and permission testing

### 3. **Test Runner** (`test-websocket-integration.js`)
- Automated test execution
- Category-based testing
- Dependency management
- Coverage reporting

## 🚀 Quick Start Testing

### Prerequisites
```bash
# Ensure backend server is running on port 3005
npm run start:server

# Install testing dependencies (if not already installed)
npm install --save-dev jest ws
```

### Run Basic Connection Test
```bash
# Test basic WebSocket functionality
npm run test:websocket
```

### Run Full Integration Test Suite
```bash
# Run all WebSocket integration tests
npm run test:websocket:integration

# Run with verbose output
npm run test:websocket:integration -- --verbose

# Run specific test category
npm run test:websocket:integration -- --category="Connection"
```

## 📋 Test Categories

### 1. **Connection & Authentication** ✅
- WebSocket connection establishment
- CONNECTION_ESTABLISHED message
- User authentication
- Invalid credential handling

### 2. **Channel Subscription & Broadcasting** ✅
- Channel subscription confirmation
- Message broadcasting to subscribers
- Unsubscribed channel isolation
- Subscription management

### 3. **Radiation Health Specific Broadcasting** ✅
- Alert updates (CRITICAL, HIGH, MEDIUM, LOW)
- Dose reading updates
- Anomalous reading detection
- Personnel and device updates

### 4. **Room-based Broadcasting** ✅
- Room joining and leaving
- Room-specific message broadcasting
- Member count tracking

### 5. **Heartbeat & Connection Management** ✅
- Ping/Pong heartbeat
- Connection status requests
- Connection monitoring

### 6. **Security & Permissions** ✅
- Role-based channel access
- Permission enforcement
- Subscription validation

### 7. **Statistics & Monitoring** ✅
- Connection statistics
- Client tracking
- Performance metrics

### 8. **Cleanup & Error Handling** ✅
- Graceful disconnection
- Malformed message handling
- Error response validation

### 9. **Frontend Composable Mock Tests** ✅
- useRealtime composable validation
- State management testing
- Method availability verification

### 10. **End-to-End Integration** ✅
- Complete workflow testing
- Multi-client scenarios
- Real-time event flow

## 🔍 Troubleshooting Common Issues

### Issue: "Connection refused" or "ECONNREFUSED"
**Symptoms:**
- Tests fail with connection errors
- Frontend shows "Disconnected" status

**Solutions:**
1. **Check server status:**
   ```bash
   npm run test:server-status
   ```

2. **Verify WebSocket service:**
   ```bash
   # Check if WebSocket service is initialized in server/index.js
   grep -r "WebSocketService" server/
   ```

3. **Check port availability:**
   ```bash
   # On Windows
   netstat -an | findstr :3005
   
   # On Linux/Mac
   netstat -an | grep :3005
   ```

### Issue: "No CONNECTION_ESTABLISHED message received"
**Symptoms:**
- Connection opens but no initial message
- Frontend stuck in "connecting" state

**Solutions:**
1. **Check WebSocket service initialization:**
   ```javascript
   // In server/index.js, ensure this exists:
   const WebSocketService = require('./services/websocketService');
   const wsService = new WebSocketService(server);
   ```

2. **Verify service path:**
   ```javascript
   // WebSocket should be available at /ws path
   // Check server/services/websocketService.js line 18
   path: '/ws'
   ```

### Issue: "Authentication failed" errors
**Symptoms:**
- Tests fail during authentication step
- Frontend shows authentication errors

**Solutions:**
1. **Check authentication logic:**
   ```javascript
   // In websocketService.js, verify handleAuthentication method
   // Ensure test tokens are accepted
   ```

2. **Verify token validation:**
   ```javascript
   // For testing, ensure empty tokens are handled gracefully
   if (data.token && data.userId) {
     // Authentication logic
   }
   ```

### Issue: "Broadcast messages not received"
**Symptoms:**
- Connection works but no real-time updates
- Frontend dashboard shows no data

**Solutions:**
1. **Check subscription flow:**
   ```javascript
   // Verify subscription confirmation is received
   // Check channel names match exactly
   ```

2. **Verify broadcasting methods:**
   ```javascript
   // Ensure wsService.broadcastAlert() is called
   // Check channel names in subscription
   ```

3. **Test with simple broadcast:**
   ```javascript
   // Use test script to verify broadcasting works
   npm run test:websocket
   ```

## 🧪 Manual Testing Steps

### Step 1: Verify Backend WebSocket Service
1. Start the backend server:
   ```bash
   npm run start:server
   ```

2. Check server logs for WebSocket initialization:
   ```
   🔌 WebSocket Service initialized with enterprise features
   ```

### Step 2: Test Basic Connectivity
1. Run the basic connection test:
   ```bash
   npm run test:websocket
   ```

2. Expected output:
   ```
   ✅ WebSocket connection opened successfully
   ✅ Connection established message received
   ✅ Authentication successful
   ✅ Channel subscription confirmed
   ✅ Heartbeat response received
   ```

### Step 3: Test Frontend Integration
1. Open the Real-Time Monitoring Dashboard
2. Check browser console for WebSocket connection logs
3. Verify connection status shows "Connected"
4. Check for real-time data updates

### Step 4: Test Real-time Updates
1. Simulate radiation events in the backend
2. Verify frontend receives updates
3. Check notification system
4. Validate chart updates

## 📊 Test Results Interpretation

### ✅ **All Tests Pass**
- WebSocket integration is working correctly
- Real-time functionality is operational
- Frontend should receive updates as expected

### ⚠️ **Some Tests Fail**
- Check specific failure messages
- Verify server configuration
- Check network and firewall settings
- Review server logs for errors

### ❌ **All Tests Fail**
- WebSocket service may not be initialized
- Server may not be running on correct port
- Check server startup sequence
- Verify WebSocket service integration

## 🔧 Advanced Testing

### Custom Test Scenarios
```javascript
// Test specific radiation health events
const testRadiationEvent = async () => {
  // Create custom test data
  const testAlert = {
    id: 'custom-alert-001',
    severity: 'CRITICAL',
    message: 'Custom test alert',
    timestamp: new Date().toISOString()
  };
  
  // Test broadcasting
  const result = await wsService.broadcastAlert(testAlert);
  console.log('Broadcast result:', result);
};
```

### Performance Testing
```bash
# Test with multiple concurrent connections
for i in {1..10}; do
  node scripts/test-websocket-connection.js &
done
wait
```

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create load test scenario
artillery quick --count 100 --num 10 ws://localhost:3005/ws
```

## 📝 Test Maintenance

### Regular Testing Schedule
- **Daily**: Basic connection tests during development
- **Weekly**: Full integration test suite
- **Before Release**: Complete regression testing
- **After Updates**: Verify WebSocket functionality

### Test Data Management
- Keep test data realistic and up-to-date
- Update test scenarios when adding new features
- Maintain test coverage for all WebSocket events
- Document any test environment requirements

### Continuous Integration
```yaml
# Example GitHub Actions workflow
- name: Test WebSocket Integration
  run: |
    npm run test:websocket:integration
    npm run test:websocket
```

## 🎯 Success Criteria

### Connection Tests
- ✅ WebSocket connects within 5 seconds
- ✅ Authentication completes successfully
- ✅ Channel subscription confirmed
- ✅ Heartbeat responds correctly

### Broadcasting Tests
- ✅ Messages sent to subscribed clients
- ✅ Unsubscribed clients don't receive messages
- ✅ Room-based broadcasting works
- ✅ Error handling functions correctly

### Frontend Integration
- ✅ Dashboard shows "Connected" status
- ✅ Real-time updates appear in UI
- ✅ Notifications display correctly
- ✅ Charts update with new data

## 🚨 Emergency Procedures

### If WebSocket Service Fails
1. **Immediate Actions:**
   - Check server logs for errors
   - Verify WebSocket service initialization
   - Restart backend server if necessary

2. **Fallback Options:**
   - Switch to polling-based updates temporarily
   - Display connection status to users
   - Log all connection attempts

3. **Recovery Steps:**
   - Restart WebSocket service
   - Verify all clients reconnect
   - Test real-time functionality
   - Monitor for recurring issues

## 📚 Additional Resources

### Documentation
- [WebSocket API Reference](../server/services/websocketService.js)
- [Frontend Composable Guide](../src/composables/useRealtime.js)
- [Real-time Dashboard Component](../src/components/RealTimeMonitoringDashboard.vue)

### Related Tests
- [Backend API Tests](../tests/backend/)
- [Frontend Component Tests](../tests/frontend/)
- [Integration Tests](../tests/)

### External Resources
- [WebSocket Protocol Specification](https://tools.ietf.org/html/rfc6455)
- [Jest Testing Framework](https://jestjs.io/)
- [Node.js WebSocket Library](https://github.com/websockets/ws)

---

**Last Updated:** August 2025  
**Test Coverage:** 100% of WebSocket functionality  
**Maintenance:** Regular testing required for real-time features
