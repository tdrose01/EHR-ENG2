import { ref, onMounted, onUnmounted, computed, readonly } from 'vue';

/**
 * Real-time WebSocket composable for Vue 3
 * Provides enterprise-grade real-time functionality with automatic reconnection
 */
export function useRealtime() {
  // Connection state
  const isConnected = ref(false);
  const connectionStatus = ref('disconnected');
  const reconnectAttempts = ref(0);
  const lastError = ref(null);
  const connectionId = ref(null);
  const serverInfo = ref(null);

  // Real-time data
  const recentUpdates = ref([]);
  const notifications = ref([]);
  const alertsCount = ref(0);
  const unreadNotifications = ref(0);

  // WebSocket instance
  let ws = null;
  let reconnectTimer = null;
  let heartbeatTimer = null;
  const maxReconnectAttempts = 10;
  const reconnectDelay = 1000; // Start with 1 second

  // Configuration
  const wsUrl = computed(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Connect to backend server on port 3005
    return `${protocol}//localhost:3005/ws`;
  });

  // Connection management
  const connect = () => {
    try {
      connectionStatus.value = 'connecting';
      ws = new WebSocket(wsUrl.value);

      ws.onopen = handleOpen;
      ws.onmessage = handleMessage;
      ws.onclose = handleClose;
      ws.onerror = handleError;

      console.log('🔌 Attempting WebSocket connection to:', wsUrl.value);
    } catch (error) {
      console.error('🔌 WebSocket connection error:', error);
      handleConnectionFailure(error);
    }
  };

  const disconnect = () => {
    connectionStatus.value = 'disconnecting';
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Client disconnect');
      }
      ws = null;
    }
    
    isConnected.value = false;
    connectionStatus.value = 'disconnected';
    connectionId.value = null;
    
    console.log('🔌 WebSocket disconnected');
  };

  // Event handlers
  const handleOpen = () => {
    console.log('🔌 WebSocket connected successfully');
    isConnected.value = true;
    connectionStatus.value = 'connected';
    reconnectAttempts.value = 0;
    lastError.value = null;
    
    // Start heartbeat
    startHeartbeat();
    
    // Authenticate first, then subscribe
    authenticate();
  };

  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      processMessage(message);
    } catch (error) {
      console.error('🔌 Error parsing WebSocket message:', error);
    }
  };

  const handleClose = (event) => {
    console.log('🔌 WebSocket connection closed:', event.code, event.reason);
    isConnected.value = false;
    connectionStatus.value = 'disconnected';
    connectionId.value = null;
    
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    
    // Attempt reconnection if not a normal closure
    if (event.code !== 1000 && reconnectAttempts.value < maxReconnectAttempts) {
      scheduleReconnect();
    }
  };

  const handleError = (error) => {
    console.error('🔌 WebSocket error:', error);
    lastError.value = error;
    handleConnectionFailure(error);
  };

  const handleConnectionFailure = (error) => {
    isConnected.value = false;
    connectionStatus.value = 'error';
    lastError.value = error;
    
    if (reconnectAttempts.value < maxReconnectAttempts) {
      scheduleReconnect();
    } else {
      console.error('🔌 Max reconnection attempts reached');
      connectionStatus.value = 'failed';
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimer) return;
    
    reconnectAttempts.value++;
    const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts.value - 1), 30000);
    
    console.log(`🔌 Reconnecting in ${delay}ms (attempt ${reconnectAttempts.value})`);
    connectionStatus.value = 'reconnecting';
    
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  };

  // Message processing
  const processMessage = (message) => {
    switch (message.type) {
      case 'CONNECTION_ESTABLISHED':
        connectionId.value = message.connectionId;
        serverInfo.value = message.serverInfo;
        console.log('🔌 Connection established:', message.connectionId);
        break;

      case 'BROADCAST':
        handleBroadcast(message);
        break;

      case 'NOTIFICATION':
        handleNotification(message);
        break;

      case 'ROOM_BROADCAST':
        handleRoomBroadcast(message);
        break;

      case 'AUTHENTICATED':
        console.log('✅ Authentication successful:', message);
        // Automatically subscribe to default channels after authentication
        subscribe(['alerts', 'readings', 'notifications']);
        break;

      case 'SUBSCRIPTION_CONFIRMED':
        console.log('📡 Subscriptions confirmed:', message.subscribedChannels);
        break;

      case 'ERROR':
        console.error('🔌 Server error:', message.error);
        lastError.value = message.error;
        break;

      case 'PONG':
        // Heartbeat response
        break;

      default:
        console.log('🔌 Unknown message type:', message.type, message);
    }
  };

  const handleBroadcast = (message) => {
    const { channel, data } = message;
    
    console.log('🔔 Broadcast received:', { channel, type: data.type, data });
    
    // Add to recent updates
    addRecentUpdate({
      id: `${channel}_${data.type}_${Date.now()}`,
      type: data.type,
      channel,
      message: formatUpdateMessage(data),
      timestamp: message.timestamp,
      data
    });

    // Handle specific broadcast types
    switch (data.type) {
      case 'ALERT_UPDATE':
        console.log('🚨 Processing ALERT_UPDATE:', data);
        handleAlertUpdate(data);
        break;
      case 'READING_UPDATE':
        console.log('📊 Processing READING_UPDATE:', data);
        handleReadingUpdate(data);
        break;
      case 'PERSONNEL_UPDATE':
        console.log('👤 Processing PERSONNEL_UPDATE:', data);
        handlePersonnelUpdate(data);
        break;
      case 'DEVICE_UPDATE':
        console.log('📱 Processing DEVICE_UPDATE:', data);
        handleDeviceUpdate(data);
        break;
      default:
        console.log('❓ Unknown broadcast type:', data.type);
    }

    // Emit custom events for components to listen to
    window.dispatchEvent(new CustomEvent('realtime-update', {
      detail: { channel, data, timestamp: message.timestamp }
    }));
  };

  const handleNotification = (message) => {
    const notification = message.data || message.notification;
    
    // Add to notifications list
    notifications.value.unshift({
      ...notification,
      receivedAt: new Date().toISOString(),
      read: false
    });

    // Keep only last 100 notifications
    if (notifications.value.length > 100) {
      notifications.value = notifications.value.slice(0, 100);
    }

    unreadNotifications.value++;

    // Show browser notification for high priority
    if (notification.priority === 'high' && 'Notification' in window) {
      showBrowserNotification(notification);
    }

    // Emit notification event
    window.dispatchEvent(new CustomEvent('realtime-notification', {
      detail: notification
    }));
  };

  const handleRoomBroadcast = (message) => {
    console.log('🏠 Room broadcast:', message.room, message.data);
    
    // Emit room broadcast event
    window.dispatchEvent(new CustomEvent('realtime-room-broadcast', {
      detail: message
    }));
  };

  // Specific update handlers
  const handleAlertUpdate = (data) => {
    console.log('🚨 handleAlertUpdate called with:', data);
    
    if (data.alert) {
      // Update alerts count for all severities
      alertsCount.value++;
      console.log('🚨 Alert detected, count:', alertsCount.value);
      
      // Show browser notification for critical alerts
      if (data.alert.severity === 'CRITICAL' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 CRITICAL Radiation Alert', {
          body: `Alert: ${data.alert.message || data.alert.details?.message || 'Critical alert triggered'}`,
          icon: '/favicon.ico',
          tag: `alert-${data.alert.id}`,
          requireInteraction: true
        });
      }
      
      // Emit alert event for dashboard components
      window.dispatchEvent(new CustomEvent('realtime-alert', {
        detail: {
          alert: data.alert,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const handleReadingUpdate = (data) => {
    console.log('📊 handleReadingUpdate called with:', data);
    
    if (data.reading) {
      if (data.reading.isAnomalous) {
        console.log('⚠️ Anomalous reading detected:', data.reading);
      }
      
      // Emit reading event for dashboard components
      window.dispatchEvent(new CustomEvent('realtime-reading', {
        detail: {
          reading: data.reading,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const handlePersonnelUpdate = (data) => {
    console.log('👤 Personnel update:', data.personnel);
  };

  const handleDeviceUpdate = (data) => {
    if (data.device && data.device.status === 'CALIBRATION_DUE') {
      console.log('🔧 Device calibration due:', data.device);
    }
  };

  // Utility functions
  const addRecentUpdate = (update) => {
    recentUpdates.value.unshift(update);
    
    // Keep only last 50 updates
    if (recentUpdates.value.length > 50) {
      recentUpdates.value = recentUpdates.value.slice(0, 50);
    }
  };

  const formatUpdateMessage = (data) => {
    switch (data.type) {
      case 'ALERT_UPDATE':
        return `Alert: ${data.alert?.severity} - ${data.alert?.message}`;
      case 'READING_UPDATE':
        return `New reading: ${data.reading?.hp10_msv} mSv`;
      case 'PERSONNEL_UPDATE':
        return `Personnel: ${data.personnel?.fname} ${data.personnel?.lname}`;
      case 'DEVICE_UPDATE':
        return `Device: ${data.device?.serial} (${data.device?.status})`;
      default:
        return `Update: ${data.type}`;
    }
  };

  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        badge: '/favicon.ico',
        vibrate: notification.presentation?.vibration || [200],
        requireInteraction: notification.requiresAcknowledgment
      });
    }
  };

  // Communication methods
  const send = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    console.warn('🔌 Cannot send message: WebSocket not connected');
    return false;
  };

  const subscribe = (channels) => {
    return send({
      type: 'SUBSCRIBE',
      channels: Array.isArray(channels) ? channels : [channels]
    });
  };

  const unsubscribe = (channels) => {
    return send({
      type: 'UNSUBSCRIBE',
      channels: Array.isArray(channels) ? channels : [channels]
    });
  };

  const authenticate = (token = 'test-token', userId = 'test-user', role = 'admin') => {
    console.log('🔐 Authenticating WebSocket connection...');
    return send({
      type: 'AUTHENTICATE',
      token,
      userId,
      role
    });
  };

  const joinRoom = (room) => {
    return send({
      type: 'JOIN_ROOM',
      room
    });
  };

  const leaveRoom = (room) => {
    return send({
      type: 'LEAVE_ROOM',
      room
    });
  };

  const getStatus = () => {
    return send({
      type: 'GET_STATUS'
    });
  };

  const ping = () => {
    return send({
      type: 'PING'
    });
  };

  // Heartbeat
  const startHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }
    
    heartbeatTimer = setInterval(() => {
      if (isConnected.value) {
        ping();
      }
    }, 30000); // 30 seconds
  };

  // Notification management
  const markNotificationAsRead = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      unreadNotifications.value = Math.max(0, unreadNotifications.value - 1);
    }
  };

  const markAllNotificationsAsRead = () => {
    notifications.value.forEach(notification => {
      notification.read = true;
    });
    unreadNotifications.value = 0;
  };

  const clearNotifications = () => {
    notifications.value = [];
    unreadNotifications.value = 0;
  };

  // Permission management
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('📱 Notification permission:', permission);
      return permission;
    }
    return Notification.permission;
  };

  // Statistics
  const getConnectionStats = () => {
    return {
      isConnected: isConnected.value,
      connectionStatus: connectionStatus.value,
      reconnectAttempts: reconnectAttempts.value,
      connectionId: connectionId.value,
      recentUpdatesCount: recentUpdates.value.length,
      notificationsCount: notifications.value.length,
      unreadCount: unreadNotifications.value,
      alertsCount: alertsCount.value,
      lastError: lastError.value
    };
  };

  // Lifecycle
  onMounted(() => {
    // Request notification permission
    requestNotificationPermission();
    
    // Connect to WebSocket
    connect();
  });

  onUnmounted(() => {
    disconnect();
  });

  // Return reactive properties and methods
  return {
    // State
    isConnected: readonly(isConnected),
    connectionStatus: readonly(connectionStatus),
    reconnectAttempts: readonly(reconnectAttempts),
    lastError: readonly(lastError),
    connectionId: readonly(connectionId),
    serverInfo: readonly(serverInfo),
    
    // Data
    recentUpdates: readonly(recentUpdates),
    notifications: readonly(notifications),
    alertsCount: readonly(alertsCount),
    unreadNotifications: readonly(unreadNotifications),
    
    // Methods
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
    authenticate,
    joinRoom,
    leaveRoom,
    getStatus,
    ping,
    
    // Notification methods
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    requestNotificationPermission,
    
    // Utilities
    getConnectionStats
  };
}
