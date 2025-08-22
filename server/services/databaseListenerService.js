const { Client } = require('pg');
const EventEmitter = require('events');

/**
 * Database Listener Service for Real-time Updates
 * Listens to PostgreSQL NOTIFY events and triggers appropriate actions
 */
class DatabaseListenerService extends EventEmitter {
  constructor(wsService, notificationService) {
    super();
    this.wsService = wsService;
    this.notificationService = notificationService;
    this.client = null;
    this.isListening = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.eventCounts = new Map();
    this.lastEventTime = null;
    
    console.log('🔍 Database Listener Service initialized');
  }

  async startListening() {
    try {
      // Use the same connection configuration as the main application
      this.client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'ehr_eng2',
        user: 'postgres',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000
      });

      await this.client.connect();
      console.log('🔍 Database listener connected successfully');

      // Listen for all notification channels
      await this.client.query('LISTEN dose_reading_changes');
      await this.client.query('LISTEN alert_changes');
      await this.client.query('LISTEN personnel_changes');
      await this.client.query('LISTEN device_changes');

      this.isListening = true;
      this.reconnectAttempts = 0;
      this.setupNotificationHandlers();

      console.log('🔍 Database listener active - monitoring all channels');
      
      // Emit ready event
      this.emit('ready');
      
    } catch (error) {
      console.error('🔍 Database listener connection failed:', error);
      this.isListening = false;
      await this.handleReconnection();
      throw error;
    }
  }

  setupNotificationHandlers() {
    this.client.on('notification', async (msg) => {
      try {
        this.lastEventTime = new Date();
        this.incrementEventCount(msg.channel);
        
        const data = JSON.parse(msg.payload);
        console.log(`🔍 Database event received: ${msg.channel} - ${data.operation} (ID: ${data.record_id})`);
        
        // Route to appropriate handler
        switch (msg.channel) {
          case 'dose_reading_changes':
            await this.handleDoseReadingChange(data);
            break;
          case 'alert_changes':
            await this.handleAlertChange(data);
            break;
          case 'personnel_changes':
            await this.handlePersonnelChange(data);
            break;
          case 'device_changes':
            await this.handleDeviceChange(data);
            break;
          default:
            console.warn(`🔍 Unknown notification channel: ${msg.channel}`);
        }
        
        // Emit generic event for monitoring
        this.emit('databaseEvent', {
          channel: msg.channel,
          operation: data.operation,
          recordId: data.record_id,
          timestamp: data.timestamp
        });
        
      } catch (error) {
        console.error('🔍 Error handling database notification:', error);
        this.emit('error', error);
      }
    });

    this.client.on('error', async (error) => {
      console.error('🔍 Database listener connection error:', error);
      this.isListening = false;
      await this.handleReconnection();
    });

    this.client.on('end', async () => {
      console.log('🔍 Database listener connection ended');
      this.isListening = false;
      await this.handleReconnection();
    });
  }

  async handleDoseReadingChange(data) {
    try {
      if (data.operation === 'DELETE') {
        // For deletions, we only have the ID
        this.wsService.broadcastToSubscribers('readings', {
          type: 'READING_DELETED',
          readingId: data.record_id,
          timestamp: data.timestamp
        });
        return;
      }

      // Fetch the updated reading with related data
      const readingQuery = `
        SELECT 
          dr.*,
          rp.fname, rp.lname, rp.rank_rate, rp.edipi,
          rd.serial as device_serial, rd.rf_policy,
          ru.name as unit_name
        FROM radiation_dose_readings dr
        LEFT JOIN radiation_devices rd ON dr.device_id = rd.id
        LEFT JOIN radiation_assignments ra ON rd.id = ra.device_id 
          AND ra.end_ts IS NULL
        LEFT JOIN radiation_personnel rp ON ra.personnel_id = rp.id
        LEFT JOIN radiation_units ru ON rp.unit_id = ru.id
        WHERE dr.id = $1
      `;

      const result = await this.client.query(readingQuery, [data.record_id]);

      if (result.rows.length > 0) {
        const reading = result.rows[0];
        
        // Determine if this is an anomalous reading
        const isAnomalous = this.isAnomalousReading(reading);
        const isHigh = reading.hp10_msv > 25;
        
        // Broadcast via WebSocket
        this.wsService.broadcastReading({
          ...reading,
          isAnomalous,
          isHigh,
          operation: data.operation
        });

        // Send notification if needed
        if (isHigh) {
          const personnel = reading.fname ? {
            id: reading.personnel_id,
            fname: reading.fname,
            lname: reading.lname,
            rank_rate: reading.rank_rate,
            edipi: reading.edipi
          } : null;

          const device = {
            id: reading.device_id,
            serial: reading.device_serial,
            rf_policy: reading.rf_policy
          };

          await this.notificationService.sendDoseReadingNotification(reading, personnel, device);
        }

        // Log the event
        console.log(`📊 Dose reading ${data.operation}: ${reading.hp10_msv} mSv (${isHigh ? 'HIGH' : 'normal'})`);
      }
      
    } catch (error) {
      console.error('🔍 Error handling dose reading change:', error);
    }
  }

  async handleAlertChange(data) {
    try {
      if (data.operation === 'DELETE') {
        // For deletions, we only have the ID
        this.wsService.broadcastToSubscribers('alerts', {
          type: 'ALERT_DELETED',
          alertId: data.record_id,
          timestamp: data.timestamp
        });
        return;
      }

      // Fetch the updated alert with related data
      const alertQuery = `
        SELECT 
          ra.*,
          rp.fname, rp.lname, rp.rank_rate, rp.edipi,
          rd.serial as device_serial,
          ru.name as unit_name
        FROM radiation_alerts ra
        LEFT JOIN radiation_personnel rp ON ra.personnel_id = rp.id
        LEFT JOIN radiation_devices rd ON ra.device_id = rd.id
        LEFT JOIN radiation_units ru ON rp.unit_id = ru.id
        WHERE ra.id = $1
      `;

      const result = await this.client.query(alertQuery, [data.record_id]);

      if (result.rows.length > 0) {
        const alert = result.rows[0];
        
        // Broadcast via WebSocket
        this.wsService.broadcastAlert({
          ...alert,
          operation: data.operation
        });

        // Send notification based on severity
        if (data.operation === 'INSERT' && !alert.ack_ts) {
          // Only send notifications for new, unacknowledged alerts
          switch (alert.severity) {
            case 'CRITICAL':
              await this.notificationService.sendCriticalAlert(alert);
              break;
            case 'HIGH':
              await this.notificationService.sendHighAlert(alert);
              break;
            // Medium and Low alerts are handled by the general broadcast
          }
        }

        // Log the event
        console.log(`🚨 Alert ${data.operation}: ${alert.severity} - ${alert.type} (ID: ${alert.id})`);
      }
      
    } catch (error) {
      console.error('🔍 Error handling alert change:', error);
    }
  }

  async handlePersonnelChange(data) {
    try {
      if (data.operation === 'DELETE') {
        // For deletions, we only have the ID
        this.wsService.broadcastToSubscribers('personnel', {
          type: 'PERSONNEL_DELETED',
          personnelId: data.record_id,
          timestamp: data.timestamp
        });
        return;
      }

      // Fetch the updated personnel with related data
      const personnelQuery = `
        SELECT 
          rp.*,
          ru.name as unit_name,
          ru.parent_uic,
          COUNT(ra.id) as active_assignments
        FROM radiation_personnel rp
        LEFT JOIN radiation_units ru ON rp.unit_id = ru.id
        LEFT JOIN radiation_assignments ra ON rp.id = ra.personnel_id 
          AND ra.end_ts IS NULL
        WHERE rp.id = $1
        GROUP BY rp.id, ru.name, ru.parent_uic
      `;

      const result = await this.client.query(personnelQuery, [data.record_id]);

      if (result.rows.length > 0) {
        const personnel = result.rows[0];
        
        // Broadcast via WebSocket
        this.wsService.broadcastPersonnelUpdate({
          ...personnel,
          operation: data.operation
        });

        // Send notification for significant changes
        if (data.operation === 'INSERT') {
          await this.notificationService.sendPersonnelUpdateNotification(personnel, 'ADDED');
        } else if (data.operation === 'UPDATE') {
          // In a real implementation, we'd check what specifically changed
          await this.notificationService.sendPersonnelUpdateNotification(personnel, 'UPDATED');
        }

        // Log the event
        console.log(`👤 Personnel ${data.operation}: ${personnel.rank_rate} ${personnel.fname} ${personnel.lname}`);
      }
      
    } catch (error) {
      console.error('🔍 Error handling personnel change:', error);
    }
  }

  async handleDeviceChange(data) {
    try {
      if (data.operation === 'DELETE') {
        // For deletions, we only have the ID
        this.wsService.broadcastToSubscribers('devices', {
          type: 'DEVICE_DELETED',
          deviceId: data.record_id,
          timestamp: data.timestamp
        });
        return;
      }

      // Fetch the updated device with related data
      const deviceQuery = `
        SELECT 
          rd.*,
          rdm.vendor, rdm.model, rdm.firmware_min,
          rp.fname, rp.lname, rp.rank_rate,
          ra.start_ts as assignment_start
        FROM radiation_devices rd
        LEFT JOIN radiation_device_models rdm ON rd.model_id = rdm.id
        LEFT JOIN radiation_assignments ra ON rd.id = ra.device_id 
          AND ra.end_ts IS NULL
        LEFT JOIN radiation_personnel rp ON ra.personnel_id = rp.id
        WHERE rd.id = $1
      `;

      const result = await this.client.query(deviceQuery, [data.record_id]);

      if (result.rows.length > 0) {
        const device = result.rows[0];
        
        // Determine device status
        const status = this.getDeviceStatus(device);
        
        // Broadcast via WebSocket
        this.wsService.broadcastDeviceUpdate({
          ...device,
          status,
          operation: data.operation
        });

        // Send notification for status changes
        if (data.operation === 'UPDATE' && (status === 'CALIBRATION_DUE' || status === 'LOW_BATTERY')) {
          await this.notificationService.sendDeviceStatusNotification(device, status);
        }

        // Log the event
        console.log(`🔧 Device ${data.operation}: ${device.serial} (${status})`);
      }
      
    } catch (error) {
      console.error('🔍 Error handling device change:', error);
    }
  }

  // Utility methods
  isAnomalousReading(reading) {
    // Enhanced anomaly detection logic
    const hp10Threshold = 50; // mSv
    const hp007Threshold = 50; // mSv
    const rateThreshold = 1000; // µSv/h
    
    return (
      reading.hp10_msv > hp10Threshold ||
      reading.hp007_msv > hp007Threshold ||
      reading.rate_usv_h > rateThreshold ||
      reading.battery_pct < 10
    );
  }

  getDeviceStatus(device) {
    const now = new Date();
    
    // Check calibration due date
    if (device.calib_due) {
      const calibDue = new Date(device.calib_due);
      if (calibDue < now) {
        return 'CALIBRATION_DUE';
      }
    }
    
    // Check RF policy
    if (device.rf_policy === 'NO_RF') {
      return 'RF_DISABLED';
    }
    
    // Check firmware version
    if (device.firmware_min && device.firmware) {
      const currentVersion = this.parseVersion(device.firmware);
      const minVersion = this.parseVersion(device.firmware_min);
      
      if (this.compareVersions(currentVersion, minVersion) < 0) {
        return 'FIRMWARE_OUTDATED';
      }
    }
    
    return 'OPERATIONAL';
  }

  parseVersion(version) {
    return version.split('.').map(Number);
  }

  compareVersions(v1, v2) {
    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const num1 = v1[i] || 0;
      const num2 = v2[i] || 0;
      
      if (num1 < num2) return -1;
      if (num1 > num2) return 1;
    }
    return 0;
  }

  incrementEventCount(channel) {
    const count = this.eventCounts.get(channel) || 0;
    this.eventCounts.set(channel, count + 1);
  }

  // Connection management
  async handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`🔍 Max reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    console.log(`🔍 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(async () => {
      try {
        await this.startListening();
        console.log('🔍 Database listener reconnected successfully');
      } catch (error) {
        console.error('🔍 Reconnection failed:', error);
        await this.handleReconnection();
      }
    }, delay);
  }

  // Monitoring and statistics
  getStatus() {
    return {
      isListening: this.isListening,
      isConnected: this.client ? !this.client.ended : false,
      reconnectAttempts: this.reconnectAttempts,
      lastEventTime: this.lastEventTime,
      eventCounts: Object.fromEntries(this.eventCounts),
      totalEvents: Array.from(this.eventCounts.values()).reduce((sum, count) => sum + count, 0)
    };
  }

  getEventStatistics() {
    const totalEvents = Array.from(this.eventCounts.values()).reduce((sum, count) => sum + count, 0);
    const stats = {
      totalEvents,
      eventsByChannel: Object.fromEntries(this.eventCounts),
      averageEventsPerChannel: totalEvents > 0 ? totalEvents / this.eventCounts.size : 0,
      lastEventTime: this.lastEventTime,
      uptime: this.isListening ? Date.now() - (this.lastEventTime || Date.now()) : 0
    };

    return stats;
  }

  // Health check
  async performHealthCheck() {
    try {
      if (!this.client || this.client.ended) {
        return { status: 'unhealthy', reason: 'No database connection' };
      }

      // Test the connection with a simple query
      await this.client.query('SELECT 1');
      
      return {
        status: 'healthy',
        isListening: this.isListening,
        eventCounts: Object.fromEntries(this.eventCounts),
        lastEventTime: this.lastEventTime
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        reason: error.message,
        reconnectAttempts: this.reconnectAttempts
      };
    }
  }

  // Graceful shutdown
  async stopListening() {
    console.log('🔍 Stopping database listener...');
    
    this.isListening = false;
    
    if (this.client) {
      try {
        // Unlisten from all channels
        await this.client.query('UNLISTEN *');
        await this.client.end();
        console.log('🔍 Database listener stopped gracefully');
      } catch (error) {
        console.error('🔍 Error stopping database listener:', error);
      }
    }
    
    this.client = null;
    this.emit('stopped');
  }

  // Reset statistics
  resetStatistics() {
    this.eventCounts.clear();
    this.lastEventTime = null;
    console.log('🔍 Database listener statistics reset');
  }
}

module.exports = DatabaseListenerService;
