const EventEmitter = require('events');

/**
 * Enterprise Notification Service for Healthcare Real-time Monitoring
 * Handles push notifications, alert prioritization, and delivery confirmation
 */
class NotificationService extends EventEmitter {
  constructor(wsService) {
    super();
    this.wsService = wsService;
    this.notificationQueue = [];
    this.deliveryLog = new Map();
    this.isProcessing = false;
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
    
    // Notification templates
    this.templates = {
      CRITICAL_ALERT: {
        title: '🚨 CRITICAL Radiation Alert',
        priority: 'high',
        requiresAcknowledgment: true,
        sound: 'emergency.wav',
        vibration: [200, 100, 200, 100, 200]
      },
      HIGH_ALERT: {
        title: '⚠️ High Radiation Alert',
        priority: 'high',
        requiresAcknowledgment: true,
        sound: 'alert.wav',
        vibration: [200, 100, 200]
      },
      MEDIUM_ALERT: {
        title: '⚠️ Radiation Alert',
        priority: 'normal',
        requiresAcknowledgment: false,
        sound: 'notification.wav',
        vibration: [200]
      },
      LOW_ALERT: {
        title: 'ℹ️ Radiation Notice',
        priority: 'low',
        requiresAcknowledgment: false,
        sound: 'soft.wav',
        vibration: [100]
      },
      DOSE_READING: {
        title: '📊 New Dose Reading',
        priority: 'normal',
        requiresAcknowledgment: false,
        sound: 'chime.wav',
        vibration: [100]
      },
      DEVICE_STATUS: {
        title: '🔧 Device Status Update',
        priority: 'normal',
        requiresAcknowledgment: false,
        sound: 'notification.wav',
        vibration: [100]
      },
      PERSONNEL_UPDATE: {
        title: '👤 Personnel Update',
        priority: 'low',
        requiresAcknowledgment: false,
        sound: 'soft.wav',
        vibration: [100]
      }
    };
    
    console.log('📱 Notification Service initialized');
  }

  // Main notification methods
  async sendCriticalAlert(alert) {
    const notification = await this.createNotification('CRITICAL_ALERT', {
      alertId: alert.id,
      message: this.formatAlertMessage(alert),
      deviceId: alert.device_id,
      personnelId: alert.personnel_id,
      threshold: alert.threshold,
      value: alert.value,
      severity: alert.severity,
      timestamp: alert.measured_ts || new Date().toISOString(),
      actions: [
        {
          id: 'acknowledge',
          label: 'Acknowledge Alert',
          type: 'primary',
          endpoint: `/api/radiation/alerts/${alert.id}/acknowledge`,
          requiresConfirmation: true
        },
        {
          id: 'view_details',
          label: 'View Details',
          type: 'secondary',
          url: `/radiation-dashboard?alert=${alert.id}`,
          openInNewTab: true
        },
        {
          id: 'contact_safety',
          label: 'Contact Safety Officer',
          type: 'danger',
          phone: '+1-555-SAFETY',
          requiresConfirmation: true
        }
      ]
    });

    return this.queueNotification(notification);
  }

  async sendHighAlert(alert) {
    const notification = await this.createNotification('HIGH_ALERT', {
      alertId: alert.id,
      message: this.formatAlertMessage(alert),
      deviceId: alert.device_id,
      personnelId: alert.personnel_id,
      threshold: alert.threshold,
      value: alert.value,
      severity: alert.severity,
      timestamp: alert.measured_ts || new Date().toISOString(),
      actions: [
        {
          id: 'acknowledge',
          label: 'Acknowledge',
          type: 'primary',
          endpoint: `/api/radiation/alerts/${alert.id}/acknowledge`
        },
        {
          id: 'view_details',
          label: 'View Details',
          type: 'secondary',
          url: `/radiation-dashboard?alert=${alert.id}`
        }
      ]
    });

    return this.queueNotification(notification);
  }

  async sendDoseReadingNotification(reading, personnel, device) {
    const isHigh = reading.hp10_msv > 25;
    const notificationType = isHigh ? 'HIGH_ALERT' : 'DOSE_READING';
    
    const notification = await this.createNotification(notificationType, {
      readingId: reading.id,
      message: this.formatReadingMessage(reading, personnel, device),
      deviceId: reading.device_id,
      personnelId: personnel?.id,
      hp10_msv: reading.hp10_msv,
      hp007_msv: reading.hp007_msv,
      rate_usv_h: reading.rate_usv_h,
      batteryPct: reading.battery_pct,
      timestamp: reading.measured_ts,
      isAnomalous: isHigh,
      actions: isHigh ? [
        {
          id: 'view_reading',
          label: 'View Reading',
          type: 'primary',
          url: `/radiation-dashboard?reading=${reading.id}`
        },
        {
          id: 'contact_personnel',
          label: 'Contact Personnel',
          type: 'secondary',
          personnelId: personnel?.id
        }
      ] : [
        {
          id: 'view_reading',
          label: 'View Reading',
          type: 'secondary',
          url: `/radiation-dashboard?reading=${reading.id}`
        }
      ]
    });

    return this.queueNotification(notification);
  }

  async sendDeviceStatusNotification(device, status) {
    const notification = await this.createNotification('DEVICE_STATUS', {
      deviceId: device.id,
      message: this.formatDeviceMessage(device, status),
      serial: device.serial,
      status: status,
      rfPolicy: device.rf_policy,
      calibrationDue: device.calib_due,
      firmware: device.firmware,
      timestamp: new Date().toISOString(),
      actions: [
        {
          id: 'view_device',
          label: 'View Device',
          type: 'primary',
          url: `/radiation-dashboard?device=${device.id}`
        },
        {
          id: 'calibrate',
          label: 'Schedule Calibration',
          type: 'secondary',
          endpoint: `/api/radiation/devices/${device.id}/calibrate`,
          condition: status === 'CALIBRATION_DUE'
        }
      ].filter(action => !action.condition || action.condition === true)
    });

    return this.queueNotification(notification);
  }

  async sendPersonnelUpdateNotification(personnel, updateType) {
    const notification = await this.createNotification('PERSONNEL_UPDATE', {
      personnelId: personnel.id,
      message: this.formatPersonnelMessage(personnel, updateType),
      edipi: personnel.edipi,
      name: `${personnel.fname} ${personnel.lname}`,
      rank: personnel.rank_rate,
      updateType: updateType,
      timestamp: new Date().toISOString(),
      actions: [
        {
          id: 'view_personnel',
          label: 'View Personnel',
          type: 'primary',
          url: `/radiation-dashboard?personnel=${personnel.id}`
        }
      ]
    });

    return this.queueNotification(notification);
  }

  // Notification creation and management
  async createNotification(type, data) {
    const template = this.templates[type];
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    const notification = {
      id: this.generateNotificationId(),
      type,
      title: template.title,
      message: data.message,
      priority: template.priority,
      requiresAcknowledgment: template.requiresAcknowledgment,
      createdAt: new Date().toISOString(),
      expiresAt: this.calculateExpiration(template.priority),
      data,
      actions: data.actions || [],
      delivery: {
        attempts: 0,
        maxAttempts: this.retryAttempts,
        lastAttempt: null,
        delivered: false,
        acknowledged: false
      },
      presentation: {
        sound: template.sound,
        vibration: template.vibration,
        icon: this.getNotificationIcon(type),
        badge: this.getNotificationBadge(template.priority),
        tag: `radiation_${type}_${data.deviceId || data.personnelId || 'system'}`,
        renotify: template.priority === 'high'
      }
    };

    return notification;
  }

  async queueNotification(notification) {
    // Add to queue
    this.notificationQueue.push(notification);
    
    // Log creation
    this.deliveryLog.set(notification.id, {
      created: new Date().toISOString(),
      status: 'queued',
      attempts: []
    });

    console.log(`📱 Notification queued: ${notification.type} - ${notification.title}`);
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processNotificationQueue();
    }

    return notification.id;
  }

  async processNotificationQueue() {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`📱 Processing ${this.notificationQueue.length} notifications...`);

    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      
      try {
        await this.deliverNotification(notification);
      } catch (error) {
        console.error(`Error delivering notification ${notification.id}:`, error);
        await this.handleDeliveryFailure(notification, error);
      }
      
      // Small delay to prevent overwhelming clients
      await this.sleep(100);
    }

    this.isProcessing = false;
    console.log('📱 Notification queue processing complete');
  }

  async deliverNotification(notification) {
    const deliveryLog = this.deliveryLog.get(notification.id);
    const attempt = {
      timestamp: new Date().toISOString(),
      success: false,
      error: null,
      recipients: 0
    };

    try {
      // Update delivery attempt
      notification.delivery.attempts++;
      notification.delivery.lastAttempt = new Date().toISOString();

      // Determine recipients based on notification type and priority
      const recipients = this.getNotificationRecipients(notification);
      
      if (recipients.length === 0) {
        throw new Error('No eligible recipients found');
      }

      // Send via WebSocket
      const wsDelivered = this.wsService.broadcastToSubscribers('notifications', {
        type: 'NOTIFICATION',
        notification: this.formatForDelivery(notification)
      });

      // Send push notification for high priority items
      if (notification.priority === 'high') {
        await this.sendPushNotification(notification, recipients);
      }

      // Mark as delivered
      notification.delivery.delivered = true;
      attempt.success = true;
      attempt.recipients = wsDelivered;

      console.log(`✅ Notification delivered: ${notification.id} to ${wsDelivered} recipients`);
      
    } catch (error) {
      attempt.error = error.message;
      throw error;
    } finally {
      deliveryLog.attempts.push(attempt);
      this.deliveryLog.set(notification.id, deliveryLog);
    }
  }

  async handleDeliveryFailure(notification, error) {
    const deliveryLog = this.deliveryLog.get(notification.id);
    
    if (notification.delivery.attempts < notification.delivery.maxAttempts) {
      // Retry with exponential backoff
      const delay = this.retryDelay * Math.pow(2, notification.delivery.attempts - 1);
      
      console.log(`⚠️ Retrying notification ${notification.id} in ${delay}ms (attempt ${notification.delivery.attempts + 1})`);
      
      setTimeout(() => {
        this.notificationQueue.unshift(notification); // Add back to front of queue
        if (!this.isProcessing) {
          this.processNotificationQueue();
        }
      }, delay);
    } else {
      console.error(`❌ Failed to deliver notification ${notification.id} after ${notification.delivery.maxAttempts} attempts:`, error);
      
      deliveryLog.status = 'failed';
      deliveryLog.finalError = error.message;
      this.deliveryLog.set(notification.id, deliveryLog);
      
      // Emit failure event
      this.emit('notificationFailed', notification, error);
    }
  }

  // Message formatting methods
  formatAlertMessage(alert) {
    const severity = alert.severity.toLowerCase();
    const deviceInfo = alert.device_id ? ` (Device ${alert.device_id})` : '';
    
    switch (alert.type) {
      case 'DOSE_THRESHOLD':
        return `${severity.toUpperCase()}: Dose threshold exceeded - ${alert.value} mSv > ${alert.threshold} mSv${deviceInfo}`;
      case 'RATE_SPIKE':
        return `${severity.toUpperCase()}: Radiation rate spike detected - ${alert.value} µSv/h${deviceInfo}`;
      case 'DEVICE_MALFUNCTION':
        return `${severity.toUpperCase()}: Device malfunction detected${deviceInfo}`;
      case 'BATTERY_LOW':
        return `Device battery low${deviceInfo} - ${alert.value}%`;
      case 'CALIBRATION_DUE':
        return `Device calibration overdue${deviceInfo}`;
      default:
        return `${severity.toUpperCase()}: ${alert.details?.message || 'Radiation monitoring alert'}${deviceInfo}`;
    }
  }

  formatReadingMessage(reading, personnel, device) {
    const personnelInfo = personnel ? ` for ${personnel.rank_rate} ${personnel.lname}` : '';
    const deviceInfo = device ? ` from ${device.serial}` : '';
    
    return `New dose reading: ${reading.hp10_msv} mSv (HP10), ${reading.hp007_msv} mSv (HP07)${personnelInfo}${deviceInfo}`;
  }

  formatDeviceMessage(device, status) {
    const statusMessages = {
      'OPERATIONAL': `Device ${device.serial} is operational`,
      'CALIBRATION_DUE': `Device ${device.serial} calibration is overdue`,
      'RF_DISABLED': `Device ${device.serial} RF communication disabled`,
      'LOW_BATTERY': `Device ${device.serial} battery is low`,
      'MALFUNCTION': `Device ${device.serial} malfunction detected`
    };
    
    return statusMessages[status] || `Device ${device.serial} status: ${status}`;
  }

  formatPersonnelMessage(personnel, updateType) {
    const name = `${personnel.rank_rate} ${personnel.fname} ${personnel.lname}`;
    
    switch (updateType) {
      case 'ADDED':
        return `New personnel added: ${name}`;
      case 'UPDATED':
        return `Personnel updated: ${name}`;
      case 'REMOVED':
        return `Personnel removed: ${name}`;
      case 'ASSIGNMENT_CHANGED':
        return `Assignment changed for: ${name}`;
      default:
        return `Personnel update: ${name}`;
    }
  }

  // Utility methods
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateExpiration(priority) {
    const expirationTimes = {
      'high': 24 * 60 * 60 * 1000, // 24 hours
      'normal': 12 * 60 * 60 * 1000, // 12 hours
      'low': 6 * 60 * 60 * 1000 // 6 hours
    };
    
    return new Date(Date.now() + expirationTimes[priority]).toISOString();
  }

  getNotificationIcon(type) {
    const icons = {
      'CRITICAL_ALERT': '🚨',
      'HIGH_ALERT': '⚠️',
      'MEDIUM_ALERT': '⚠️',
      'LOW_ALERT': 'ℹ️',
      'DOSE_READING': '📊',
      'DEVICE_STATUS': '🔧',
      'PERSONNEL_UPDATE': '👤'
    };
    
    return icons[type] || '📱';
  }

  getNotificationBadge(priority) {
    const badges = {
      'high': 'urgent',
      'normal': 'info',
      'low': 'low'
    };
    
    return badges[priority] || 'info';
  }

  getNotificationRecipients(notification) {
    // In a real implementation, this would query the database for users
    // who should receive this type of notification based on their role,
    // location, assignment, etc.
    
    const recipients = [];
    
    // For now, return all connected authenticated users
    this.wsService.clients.forEach((client, ws) => {
      if (client.authenticated && client.subscriptions.has('notifications')) {
        recipients.push({
          connectionId: client.id,
          userId: client.userId,
          role: client.role,
          ws: ws
        });
      }
    });
    
    return recipients;
  }

  formatForDelivery(notification) {
    // Remove internal delivery tracking info for client
    const { delivery, ...clientNotification } = notification;
    return clientNotification;
  }

  async sendPushNotification(notification, recipients) {
    // Placeholder for actual push notification service integration
    // In production, integrate with services like:
    // - Firebase Cloud Messaging (FCM)
    // - Apple Push Notification Service (APNs)
    // - Web Push Protocol
    
    console.log(`📱 Push notification sent: ${notification.title} to ${recipients.length} recipients`);
    
    // For now, just log the push notification
    return Promise.resolve();
  }

  // Statistics and monitoring
  getNotificationStats() {
    const stats = {
      totalSent: this.deliveryLog.size,
      queued: this.notificationQueue.length,
      processing: this.isProcessing,
      byType: {},
      byPriority: {},
      deliveryRate: 0,
      averageDeliveryTime: 0
    };

    let successfulDeliveries = 0;
    let totalDeliveryTime = 0;

    this.deliveryLog.forEach((log, id) => {
      // Count by status
      if (log.status === 'delivered') successfulDeliveries++;
      
      // Calculate delivery time
      if (log.status === 'delivered' && log.attempts.length > 0) {
        const created = new Date(log.created);
        const delivered = new Date(log.attempts[log.attempts.length - 1].timestamp);
        totalDeliveryTime += (delivered - created);
      }
    });

    stats.deliveryRate = this.deliveryLog.size > 0 ? (successfulDeliveries / this.deliveryLog.size) * 100 : 0;
    stats.averageDeliveryTime = successfulDeliveries > 0 ? totalDeliveryTime / successfulDeliveries : 0;

    return stats;
  }

  // Cleanup and maintenance
  cleanupExpiredNotifications() {
    const now = new Date();
    let cleanedCount = 0;

    this.deliveryLog.forEach((log, id) => {
      // Remove logs older than 30 days
      const created = new Date(log.created);
      const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 30) {
        this.deliveryLog.delete(id);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired notification logs`);
    }

    return cleanedCount;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Graceful shutdown
  async shutdown() {
    console.log('📱 Shutting down Notification Service...');
    
    // Process remaining notifications
    if (this.notificationQueue.length > 0) {
      console.log(`📱 Processing ${this.notificationQueue.length} remaining notifications...`);
      await this.processNotificationQueue();
    }
    
    console.log('📱 Notification Service shutdown complete');
  }
}

module.exports = NotificationService;
