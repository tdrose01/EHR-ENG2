const WebSocket = require('ws');
const EventEmitter = require('events');

/**
 * Enterprise-grade WebSocket Service for Real-time Monitoring
 * Provides secure, scalable real-time communication for healthcare applications
 */
class WebSocketService extends EventEmitter {
  constructor(server) {
    super();
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws',
      clientTracking: true,
      maxPayload: 4 * 1024 * 1024, // Reduced from 16MB to 4MB
      compression: 'deflate'
    });
    
    this.clients = new Map(); // Enhanced client tracking with metadata
    this.rooms = new Map(); // Room-based subscriptions
    this.messageQueue = new Map(); // Message queuing for offline clients
    this.heartbeatInterval = 60000; // Increased from 30s to 60s
    this.connectionId = 0;
    this.maxClients = 100; // Maximum number of concurrent clients
    this.maxMessageQueueSize = 50; // Maximum messages per client queue
    
    this.setupWebSocket();
    this.startHeartbeat();
    this.startCleanup();
    
    console.log('🔌 WebSocket Service initialized with enterprise features');
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const connectionId = ++this.connectionId;
      const clientInfo = {
        id: connectionId,
        ip: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        connectedAt: new Date(),
        lastPing: new Date(),
        subscriptions: new Set(),
        authenticated: false,
        userId: null,
        role: null
      };
      
      // Store client info
      this.clients.set(ws, clientInfo);
      
      console.log(`🔌 New WebSocket connection: ${connectionId} from ${clientInfo.ip}`);
      
      // Send initial connection confirmation
      this.sendToClient(ws, {
        type: 'CONNECTION_ESTABLISHED',
        connectionId,
        timestamp: new Date().toISOString(),
        message: 'Real-time monitoring active',
        serverInfo: {
          version: '1.0.0',
          features: ['real-time-updates', 'push-notifications', 'room-subscriptions']
        }
      });

      // Handle incoming messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error(`WebSocket message parsing error from ${connectionId}:`, error);
          this.sendError(ws, 'INVALID_MESSAGE_FORMAT', 'Message must be valid JSON');
        }
      });

      // Handle client disconnect
      ws.on('close', (code, reason) => {
        console.log(`🔌 WebSocket connection ${connectionId} closed: ${code} - ${reason}`);
        this.handleClientDisconnect(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for connection ${connectionId}:`, error);
        this.handleClientDisconnect(ws);
      });

      // Handle pong responses
      ws.on('pong', () => {
        const client = this.clients.get(ws);
        if (client) {
          client.lastPing = new Date();
        }
      });
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket Server error:', error);
    });
  }

  handleClientMessage(ws, data) {
    const client = this.clients.get(ws);
    if (!client) return;

    // Update last activity
    client.lastPing = new Date();

    switch (data.type) {
      case 'AUTHENTICATE':
        this.handleAuthentication(ws, data);
        break;
        
      case 'SUBSCRIBE':
        this.handleSubscription(ws, data);
        break;
        
      case 'UNSUBSCRIBE':
        this.handleUnsubscription(ws, data);
        break;
        
      case 'PING':
        this.sendToClient(ws, { type: 'PONG', timestamp: new Date().toISOString() });
        break;
        
      case 'GET_STATUS':
        this.sendConnectionStatus(ws);
        break;
        
      case 'JOIN_ROOM':
        this.handleJoinRoom(ws, data);
        break;
        
      case 'LEAVE_ROOM':
        this.handleLeaveRoom(ws, data);
        break;
        
      default:
        console.log(`Unknown message type from ${client.id}:`, data.type);
        this.sendError(ws, 'UNKNOWN_MESSAGE_TYPE', `Unknown message type: ${data.type}`);
    }
  }

  handleAuthentication(ws, data) {
    const client = this.clients.get(ws);
    if (!client) return;

    // In a real implementation, validate the token
    // For now, we'll simulate authentication
    if (data.token && data.userId) {
      client.authenticated = true;
      client.userId = data.userId;
      client.role = data.role || 'user';
      
      this.sendToClient(ws, {
        type: 'AUTHENTICATED',
        success: true,
        userId: client.userId,
        role: client.role,
        permissions: this.getPermissions(client.role)
      });
      
      console.log(`✅ Client ${client.id} authenticated as ${client.userId} (${client.role})`);
    } else {
      this.sendError(ws, 'AUTHENTICATION_FAILED', 'Invalid credentials');
    }
  }

  handleSubscription(ws, data) {
    const client = this.clients.get(ws);
    if (!client) return;

    const { channels } = data;
    if (!Array.isArray(channels)) {
      return this.sendError(ws, 'INVALID_SUBSCRIPTION', 'Channels must be an array');
    }

    // Validate subscription permissions
    const allowedChannels = this.getAllowedChannels(client.role);
    const validChannels = channels.filter(channel => allowedChannels.includes(channel));
    
    validChannels.forEach(channel => {
      client.subscriptions.add(channel);
    });

    this.sendToClient(ws, {
      type: 'SUBSCRIPTION_CONFIRMED',
      subscribedChannels: Array.from(client.subscriptions),
      rejectedChannels: channels.filter(c => !validChannels.includes(c))
    });

    console.log(`📡 Client ${client.id} subscribed to: ${validChannels.join(', ')}`);
  }

  handleUnsubscription(ws, data) {
    const client = this.clients.get(ws);
    if (!client) return;

    const { channels } = data;
    if (!Array.isArray(channels)) {
      return this.sendError(ws, 'INVALID_UNSUBSCRIPTION', 'Channels must be an array');
    }

    channels.forEach(channel => {
      client.subscriptions.delete(channel);
    });

    this.sendToClient(ws, {
      type: 'UNSUBSCRIPTION_CONFIRMED',
      unsubscribedChannels: channels,
      remainingChannels: Array.from(client.subscriptions)
    });
  }

  handleJoinRoom(ws, data) {
    const client = this.clients.get(ws);
    if (!client) return;

    const { room } = data;
    if (!room || typeof room !== 'string') {
      return this.sendError(ws, 'INVALID_ROOM', 'Room name must be a string');
    }

    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }

    this.rooms.get(room).add(ws);
    this.sendToClient(ws, {
      type: 'ROOM_JOINED',
      room,
      memberCount: this.rooms.get(room).size
    });

    console.log(`🏠 Client ${client.id} joined room: ${room}`);
  }

  handleLeaveRoom(ws, data) {
    const client = this.clients.get(ws);
    if (!client) return;

    const { room } = data;
    if (this.rooms.has(room)) {
      this.rooms.get(room).delete(ws);
      
      // Clean up empty rooms
      if (this.rooms.get(room).size === 0) {
        this.rooms.delete(room);
      }
    }

    this.sendToClient(ws, {
      type: 'ROOM_LEFT',
      room,
      memberCount: this.rooms.has(room) ? this.rooms.get(room).size : 0
    });
  }

  handleClientDisconnect(ws) {
    const client = this.clients.get(ws);
    if (client) {
      // Remove from all rooms
      this.rooms.forEach((members, room) => {
        if (members.has(ws)) {
          members.delete(ws);
          if (members.size === 0) {
            this.rooms.delete(room);
          }
        }
      });

      // Clean up message queue
      this.messageQueue.delete(client.id);
      
      console.log(`🔌 Client ${client.id} disconnected and cleaned up`);
    }
    
    this.clients.delete(ws);
  }

  // Broadcasting methods
  broadcastToSubscribers(channel, data) {
    const message = {
      type: 'BROADCAST',
      channel,
      timestamp: new Date().toISOString(),
      data
    };

    let sentCount = 0;
    this.clients.forEach((client, ws) => {
      if (client.subscriptions.has(channel) && ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, message);
        sentCount++;
      }
    });

    console.log(`📡 Broadcast to ${sentCount} subscribers on channel: ${channel}`);
    return sentCount;
  }

  broadcastToRoom(room, data) {
    if (!this.rooms.has(room)) return 0;

    const message = {
      type: 'ROOM_BROADCAST',
      room,
      timestamp: new Date().toISOString(),
      data
    };

    let sentCount = 0;
    this.rooms.get(room).forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, message);
        sentCount++;
      }
    });

    console.log(`🏠 Room broadcast to ${sentCount} members in room: ${room}`);
    return sentCount;
  }

  // Specific broadcast methods for radiation health events
  broadcastAlert(alert) {
    return this.broadcastToSubscribers('alerts', {
      type: 'ALERT_UPDATE',
      alert,
      priority: this.getAlertPriority(alert.severity)
    });
  }

  broadcastReading(reading) {
    return this.broadcastToSubscribers('readings', {
      type: 'READING_UPDATE',
      reading,
      isAnomalous: this.isAnomalousReading(reading)
    });
  }

  broadcastPersonnelUpdate(personnel) {
    return this.broadcastToSubscribers('personnel', {
      type: 'PERSONNEL_UPDATE',
      personnel
    });
  }

  broadcastDeviceUpdate(device) {
    return this.broadcastToSubscribers('devices', {
      type: 'DEVICE_UPDATE',
      device,
      status: this.getDeviceStatus(device)
    });
  }

  // Utility methods
  sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error sending message to client:', error);
      }
    }
  }

  sendError(ws, code, message) {
    this.sendToClient(ws, {
      type: 'ERROR',
      error: { code, message },
      timestamp: new Date().toISOString()
    });
  }

  sendConnectionStatus(ws) {
    const client = this.clients.get(ws);
    if (!client) return;

    this.sendToClient(ws, {
      type: 'CONNECTION_STATUS',
      status: {
        connectionId: client.id,
        connectedAt: client.connectedAt,
        authenticated: client.authenticated,
        subscriptions: Array.from(client.subscriptions),
        totalConnections: this.clients.size,
        serverUptime: process.uptime()
      }
    });
  }

  // Permission and security methods
  getPermissions(role) {
    const permissions = {
      admin: ['alerts', 'readings', 'personnel', 'devices', 'notifications', 'system'],
      doctor: ['alerts', 'readings', 'personnel', 'notifications'],
      nurse: ['alerts', 'readings', 'notifications'],
      technician: ['readings', 'devices', 'notifications'],
      user: ['readings', 'notifications']
    };
    
    return permissions[role] || permissions.user;
  }

  getAllowedChannels(role) {
    return this.getPermissions(role);
  }

  // Health check methods
  getAlertPriority(severity) {
    const priorities = {
      'CRITICAL': 1,
      'HIGH': 2,
      'MEDIUM': 3,
      'LOW': 4
    };
    return priorities[severity] || 5;
  }

  isAnomalousReading(reading) {
    // Simple anomaly detection - in production, use more sophisticated algorithms
    return reading.hp10_msv > 50 || reading.rate_usv_h > 1000;
  }

  getDeviceStatus(device) {
    // Determine device status based on various factors
    const now = new Date();
    const calibDue = new Date(device.calib_due);
    
    if (calibDue < now) return 'CALIBRATION_DUE';
    if (device.rf_policy === 'NO_RF') return 'RF_DISABLED';
    return 'OPERATIONAL';
  }

  // Heartbeat and connection management
  startHeartbeat() {
    setInterval(() => {
      const now = new Date();
      
      this.clients.forEach((client, ws) => {
        const timeSinceLastPing = now - client.lastPing;
        
        if (timeSinceLastPing > this.heartbeatInterval * 2) {
          // Client hasn't responded to ping in too long
          console.log(`⚠️ Terminating unresponsive client ${client.id}`);
          ws.terminate();
        } else if (ws.readyState === WebSocket.OPEN) {
          // Send ping
          ws.ping();
        }
      });
    }, this.heartbeatInterval);
  }

  // Statistics and monitoring
  getConnectionStats() {
    const stats = {
      totalConnections: this.clients.size,
      authenticatedConnections: 0,
      subscriptionCounts: {},
      roomCounts: {}
    };

    this.clients.forEach(client => {
      if (client.authenticated) {
        stats.authenticatedConnections++;
      }
      
      client.subscriptions.forEach(sub => {
        stats.subscriptionCounts[sub] = (stats.subscriptionCounts[sub] || 0) + 1;
      });
    });

    this.rooms.forEach((members, room) => {
      stats.roomCounts[room] = members.size;
    });

    return stats;
  }

  // Graceful shutdown
  async shutdown() {
    console.log('🔌 Shutting down WebSocket service...');
    
    // Notify all clients of shutdown
    this.clients.forEach((client, ws) => {
      this.sendToClient(ws, {
        type: 'SERVER_SHUTDOWN',
        message: 'Server is shutting down',
        timestamp: new Date().toISOString()
      });
    });

    // Close all connections
    this.wss.clients.forEach(ws => {
      ws.terminate();
    });

    // Close the server
    await new Promise((resolve) => {
      this.wss.close(resolve);
    });

    console.log('🔌 WebSocket service shutdown complete');
  }

  // Start periodic cleanup
  startCleanup() {
    // Cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveClients();
      this.cleanupMessageQueues();
    }, 300000);
  }

  // Cleanup inactive clients
  cleanupInactiveClients() {
    const now = new Date();
    const inactiveThreshold = 10 * 60 * 1000; // 10 minutes
    
    for (const [ws, client] of this.clients.entries()) {
      if (now - client.lastPing > inactiveThreshold) {
        console.log(`🔌 Cleaning up inactive client: ${client.id}`);
        this.removeClient(ws);
      }
    }
  }

  // Cleanup message queues
  cleanupMessageQueues() {
    for (const [clientId, queue] of this.messageQueue.entries()) {
      if (queue.length > this.maxMessageQueueSize) {
        // Keep only the most recent messages
        this.messageQueue.set(clientId, queue.slice(-this.maxMessageQueueSize));
        console.log(`🧹 Cleaned up message queue for client ${clientId}`);
      }
    }
  }

  // Remove client and cleanup
  removeClient(ws) {
    const client = this.clients.get(ws);
    if (client) {
      // Remove from rooms
      for (const room of client.rooms) {
        this.leaveRoom(ws, { room });
      }
      
      // Remove from subscriptions
      client.subscriptions.clear();
      
      // Remove from clients map
      this.clients.delete(ws);
      
      // Remove message queue
      this.messageQueue.delete(client.id);
      
      console.log(`🔌 Client ${client.id} removed and cleaned up`);
    }
  }
}

module.exports = WebSocketService;
