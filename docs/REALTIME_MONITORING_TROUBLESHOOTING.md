# Real-Time Monitoring System Troubleshooting Guide

## Overview
This document provides troubleshooting steps for the real-time monitoring system in the EHR-ENG2 application.

## Current Status
- ✅ Backend WebSocket server is running on port 3005
- ✅ Backend is generating real-time data (alerts, readings, notifications)
- ✅ Backend is broadcasting data via WebSocket
- ❌ Frontend is not receiving WebSocket messages (shows 0 subscribers)
- ❌ Dashboard displays "0" for alerts and notifications

## Issue Analysis

### Backend Status
The backend is working correctly:
- WebSocket server is running on `ws://localhost:3005/ws`
- Data generation scripts are running and creating alerts/readings
- WebSocket broadcasts are being sent
- Database triggers are firing correctly

### Frontend Issue
The frontend is not connecting to the WebSocket:
- Backend logs show "📡 Broadcast to 0 subscribers"
- Dashboard shows "0" for all counters
- No WebSocket connection established from frontend

## Root Cause
The frontend Vue.js application is not properly connecting to the WebSocket server. This could be due to:

1. **CORS Issues**: WebSocket connection blocked by CORS policy
2. **Authentication Issues**: Frontend not sending proper authentication
3. **Connection Timing**: Frontend trying to connect before backend is ready
4. **Vue.js Lifecycle**: WebSocket connection not established in component lifecycle

## Troubleshooting Steps

### 1. Check WebSocket Connection
```javascript
// Test WebSocket connection in browser console
const ws = new WebSocket('ws://localhost:3005/ws');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Message:', e.data);
ws.onerror = (e) => console.log('Error:', e);
```

### 2. Check Browser Console
Open browser developer tools and check for:
- WebSocket connection errors
- CORS errors
- JavaScript errors
- Network tab for WebSocket connection status

### 3. Verify Backend Status
```bash
# Check if backend is running
netstat -an | findstr :3005

# Check backend logs for WebSocket connections
# Look for "WebSocket connected" messages
```

### 4. Test Authentication
The WebSocket requires authentication:
```javascript
// Send authentication after connection
ws.send(JSON.stringify({
  type: 'AUTHENTICATE',
  token: 'test-token',
  userId: 'test-user',
  role: 'admin'
}));
```

### 5. Subscribe to Channels
After authentication, subscribe to channels:
```javascript
ws.send(JSON.stringify({
  type: 'SUBSCRIBE',
  channels: ['alerts', 'readings', 'notifications']
}));
```

## Fixes Applied

### 1. Enhanced WebSocket Message Processing
- Updated `useRealtime.js` to properly handle WebSocket messages
- Added event broadcasting for alerts and readings
- Improved error handling and logging

### 2. Fixed Dashboard Component
- Added event listeners for real-time data
- Enhanced data processing for alerts and readings
- Improved UI updates for real-time data

### 3. Chart.js Error Handling
- Added comprehensive error handling for Chart.js
- Implemented automatic chart recreation on errors
- Added global error handlers for Chart.js issues

### 4. Backend WebSocket Service
- Verified WebSocket server is running correctly
- Confirmed data generation and broadcasting
- Checked authentication and subscription handling

## Current Implementation

### Frontend Components
- `src/composables/useRealtime.js` - WebSocket connection management
- `src/components/RealTimeMonitoringDashboard.vue` - Main dashboard
- `src/components/RealTimeChart.vue` - Real-time charts

### Backend Services
- `server/services/websocketService.js` - WebSocket server
- `server/services/notificationService.js` - Notification handling
- `server/services/databaseListenerService.js` - Database triggers

## Testing

### Manual Testing
1. Open browser developer tools
2. Navigate to `/real-time-monitoring`
3. Check console for WebSocket connection messages
4. Verify data is being received and processed

### Automated Testing
```bash
# Test WebSocket connection
node debug-websocket-connection.js

# Test frontend WebSocket
node debug-frontend-websocket.js
```

## Next Steps

1. **Debug Frontend Connection**: Check browser console for WebSocket errors
2. **Verify CORS Settings**: Ensure WebSocket connections are allowed
3. **Check Authentication**: Verify frontend is sending proper auth tokens
4. **Test Connection Timing**: Ensure frontend connects after backend is ready

## Files Modified

- `src/composables/useRealtime.js` - Enhanced WebSocket handling
- `src/components/RealTimeMonitoringDashboard.vue` - Added event listeners
- `src/components/RealTimeChart.vue` - Added error handling
- `docs/REALTIME_MONITORING_TROUBLESHOOTING.md` - This documentation

## Status
- Backend: ✅ Working
- Frontend WebSocket: ❌ Not connecting
- Data Display: ❌ Not showing
- Charts: ✅ Error handling added

## Resolution Required
The frontend WebSocket connection needs to be debugged and fixed to establish proper communication with the backend WebSocket server.
