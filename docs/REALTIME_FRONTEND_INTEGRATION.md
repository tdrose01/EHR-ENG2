# Real-Time Frontend Integration Guide

## 🚀 Overview

This guide demonstrates how to integrate the real-time monitoring system with your Vue.js frontend. The system provides live radiation monitoring data, alerts, and notifications through WebSocket connections.

## 📋 Prerequisites

- ✅ Backend server running (`npm run start:server`)
- ✅ WebSocket service active
- ✅ Database triggers configured
- ✅ Vue.js frontend with router setup

## 🏗️ Architecture

```
Frontend (Vue.js) ←→ WebSocket ←→ Backend Services ←→ PostgreSQL Triggers
     ↓                    ↓              ↓                    ↓
Real-time UI        Live Updates   Notification    Database Changes
Components         & Alerts       Service         (INSERT/UPDATE/DELETE)
```

## 🔌 Core Components

### 1. WebSocket Service (`server/services/websocketService.js`)
- Manages client connections
- Handles authentication and authorization
- Routes messages to appropriate channels
- Broadcasts real-time updates

### 2. Notification Service (`server/services/notificationService.js`)
- Manages alert prioritization
- Handles notification delivery
- Supports retry logic and failure handling

### 3. Database Listener (`server/services/databaseListenerService.js`)
- Listens to PostgreSQL `pg_notify` events
- Triggers real-time updates on data changes
- Integrates with WebSocket and notification services

### 4. Vue Composable (`src/composables/useRealtime.js`)
- Provides reactive real-time functionality
- Handles WebSocket connection management
- Manages automatic reconnection
- Exposes real-time data and methods

## 🎯 Frontend Integration

### Step 1: Import the Composable

```javascript
import { useRealtime } from '../composables/useRealtime'

export default {
  setup() {
    const realtime = useRealtime()
    return realtime
  }
}
```

### Step 2: Access Real-time Data

```javascript
// Reactive properties
const { 
  isConnected,           // Connection status
  connectionStatus,      // Detailed connection state
  recentUpdates,         // Latest real-time updates
  notifications,         // Real-time notifications
  alertsCount,          // Count of active alerts
  unreadNotifications   // Count of unread notifications
} = realtime

// Methods
const { 
  connect,              // Connect to WebSocket
  disconnect,           // Disconnect from WebSocket
  subscribe,            // Subscribe to channels
  authenticate,         // Authenticate user
  markNotificationAsRead // Mark notification as read
} = realtime
```

### Step 3: Listen for Real-time Events

```javascript
// Listen for real-time updates
window.addEventListener('realtime-update', (event) => {
  const { channel, data, timestamp } = event.detail
  console.log('Real-time update:', channel, data)
})

// Listen for notifications
window.addEventListener('realtime-notification', (event) => {
  const notification = event.detail
  console.log('New notification:', notification)
})
```

## 🎨 Real-Time Dashboard Component

The `RealTimeMonitoringDashboard.vue` component demonstrates:

- **Live Connection Status**: Real-time WebSocket connection monitoring
- **Status Cards**: Connection, alerts, notifications, and updates
- **Live Data Streams**: Real-time alerts and dose readings
- **Notification Panel**: Interactive notification management
- **System Health**: WebSocket, database, and notification service status
- **Debug Information**: Detailed connection and system information

## 🔧 Configuration

### Environment Variables

```env
# .env
DATABASE_URL=postgresql://postgres@localhost:5432/ehr_eng2
NODE_ENV=development
```

### WebSocket Configuration

```javascript
// Default WebSocket URL
const wsUrl = computed(() => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws`
})
```

## 📡 Real-Time Channels

### Available Channels

1. **`alerts`** - Radiation alerts and warnings
2. **`readings`** - Dose reading updates
3. **`personnel`** - Personnel changes and updates
4. **`devices`** - Device status changes
5. **`notifications`** - System notifications

### Channel Permissions

```javascript
const permissions = {
  admin: ['alerts', 'readings', 'personnel', 'devices', 'notifications', 'system'],
  doctor: ['alerts', 'readings', 'personnel', 'notifications'],
  nurse: ['alerts', 'readings', 'notifications'],
  technician: ['readings', 'devices', 'notifications'],
  user: ['readings', 'notifications']
}
```

## 🧪 Testing the Integration

### 1. Start the Backend Server

```bash
npm run start:server
```

### 2. Run the Demo Script

```bash
node scripts/demo-realtime-frontend.js
```

### 3. Open the Real-Time Dashboard

Navigate to `/realtime-monitoring` in your browser

### 4. Watch Real-Time Updates

The demo script generates live data every 3 seconds, which you'll see appear in real-time on the dashboard.

## 🔄 Real-Time Data Flow

### 1. Database Change
```sql
INSERT INTO radiation_dose_readings (hp10_msv, hp007_msv, rate_usv_h) 
VALUES (30.5, 28.2, 450.0);
```

### 2. Trigger Fires
```sql
-- PostgreSQL trigger automatically executes
SELECT notify_dose_reading_change();
```

### 3. Database Notification
```sql
-- pg_notify sends event
NOTIFY dose_reading_changes, '{"operation":"INSERT","record_id":123}'
```

### 4. Backend Processing
- Database listener receives notification
- Fetches updated data
- Sends WebSocket broadcast
- Queues notification if needed

### 5. Frontend Update
- WebSocket receives broadcast
- Vue composable processes message
- UI components reactively update
- User sees real-time changes

## 🎭 Demo Scenarios

### Scenario 1: High Dose Reading
1. Demo script generates reading > 25 mSv
2. System detects high reading
3. High priority alert notification sent
4. Real-time dashboard updates immediately
5. Browser notification appears (if permitted)

### Scenario 2: Critical Alert
1. Demo script generates CRITICAL severity alert
2. System prioritizes alert
3. Notification sent to all subscribed users
4. Dashboard shows red alert indicator
5. Sound/vibration notification (if supported)

### Scenario 3: Personnel Update
1. Demo script simulates personnel change
2. Database trigger fires
3. Real-time update sent to personnel channel
4. Dashboard updates personnel information
5. Notification sent to relevant users

## 🚨 Error Handling

### Connection Failures
- Automatic reconnection with exponential backoff
- Maximum 10 reconnection attempts
- User-friendly error messages
- Manual reconnect button

### Message Processing
- JSON parsing error handling
- Graceful fallback for malformed messages
- Logging for debugging

### Notification Delivery
- Retry logic for failed deliveries
- Maximum 3 retry attempts
- Exponential backoff between retries
- Failure logging and monitoring

## 📊 Performance Considerations

### WebSocket Management
- Connection pooling for multiple clients
- Heartbeat mechanism (30-second intervals)
- Automatic cleanup of disconnected clients
- Efficient message routing

### Data Optimization
- Limit recent updates to last 50 items
- Limit notifications to last 100 items
- Automatic cleanup of old data
- Efficient Vue reactivity

### Memory Management
- Proper cleanup of event listeners
- Component unmounting cleanup
- WebSocket connection cleanup
- Timer cleanup

## 🔒 Security Features

### Authentication
- Token-based authentication
- Role-based access control
- Channel subscription permissions
- Secure WebSocket connections

### Authorization
- User role validation
- Channel access control
- Data filtering by permissions
- Audit logging

## 🚀 Production Deployment

### Environment Setup
```bash
# Production environment
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
SSL_ENABLED=true
```

### Monitoring
- Real-time status endpoints (`/api/realtime/status`)
- Health check endpoints (`/api/realtime/health`)
- Performance metrics
- Error logging and alerting

### Scaling
- Multiple WebSocket server instances
- Load balancer configuration
- Database connection pooling
- Redis for session management (optional)

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check server is running
   - Verify port 3005 is accessible
   - Check firewall settings

2. **No Real-time Updates**
   - Verify database triggers are active
   - Check WebSocket authentication
   - Verify channel subscriptions

3. **Notifications Not Appearing**
   - Check browser notification permissions
   - Verify notification service is running
   - Check user role permissions

### Debug Tools

- Real-time status endpoint: `/api/realtime/status`
- Health check endpoint: `/api/realtime/health`
- Debug information panel in dashboard
- Browser developer tools console

## 📚 Additional Resources

- [WebSocket API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [PostgreSQL NOTIFY/LISTEN](https://www.postgresql.org/docs/current/sql-notify.html)
- [Real-time System Architecture](https://en.wikipedia.org/wiki/Real-time_computing)

## 🎉 Success Metrics

Your real-time integration is successful when:

- ✅ WebSocket connects automatically on page load
- ✅ Real-time updates appear within 100ms of database changes
- ✅ Notifications are delivered reliably
- ✅ Connection automatically recovers from failures
- ✅ UI updates smoothly without performance issues
- ✅ All channels receive appropriate data
- ✅ Error handling gracefully manages failures

---

**🎯 Next Steps**: 
1. Test the integration with the demo script
2. Customize the dashboard for your specific needs
3. Add additional real-time features
4. Implement production monitoring and alerting
