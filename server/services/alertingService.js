const nodemailer = require('nodemailer');

class AlertingService {
  constructor() {
    this.notificationChannels = {
      email: this.sendEmailNotification.bind(this),
      slack: this.sendSlackNotification.bind(this),
      console: this.sendConsoleNotification.bind(this),
      database: this.sendDatabaseNotification.bind(this)
    };
    
    this.alertLevels = {
      INFO: { priority: 1, color: '#36a64f' },
      WARNING: { priority: 2, color: '#ffa500' },
      CRITICAL: { priority: 3, color: '#ff0000' },
      EMERGENCY: { priority: 4, color: '#8b0000' }
    };
    
    this.notificationSettings = {
      email: {
        enabled: process.env.EMAIL_NOTIFICATIONS === 'true',
        recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
        smtp: {
          host: process.env.SMTP_HOST || 'localhost',
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        }
      },
      slack: {
        enabled: process.env.SLACK_NOTIFICATIONS === 'true',
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        channel: process.env.SLACK_CHANNEL || '#alerts',
        username: process.env.SLACK_USERNAME || 'Radiation Health Monitor'
      },
      console: {
        enabled: true // Always enabled for development
      },
      database: {
        enabled: true // Always enabled
      }
    };
  }

  // Send notification through all configured channels
  async sendNotification(alert) {
    const promises = [];
    
    // Determine which channels to use based on alert severity
    const channels = this.getChannelsForSeverity(alert.severity);
    
    for (const channel of channels) {
      if (this.notificationSettings[channel]?.enabled) {
        try {
          const promise = this.notificationChannels[channel](alert);
          promises.push(promise);
        } catch (error) {
          console.error(`Failed to send ${channel} notification:`, error);
        }
      }
    }
    
    try {
      await Promise.allSettled(promises);
      console.log(`Alert notification sent through ${channels.length} channels`);
    } catch (error) {
      console.error('Failed to send notifications:', error);
    }
  }

  // Determine which channels to use based on alert severity
  getChannelsForSeverity(severity) {
    const level = this.alertLevels[severity];
    if (!level) return ['console'];
    
    switch (severity) {
      case 'INFO':
        return ['console', 'database'];
      case 'WARNING':
        return ['console', 'database', 'email'];
      case 'CRITICAL':
        return ['console', 'database', 'email', 'slack'];
      case 'EMERGENCY':
        return ['console', 'database', 'email', 'slack'];
      default:
        return ['console', 'database'];
    }
  }

  // Send email notification
  async sendEmailNotification(alert) {
    if (!this.notificationSettings.email.enabled || 
        this.notificationSettings.email.recipients.length === 0) {
      return;
    }

    try {
      const transporter = nodemailer.createTransporter(this.notificationSettings.email.smtp);
      
      const mailOptions = {
        from: this.notificationSettings.email.smtp.auth.user,
        to: this.notificationSettings.email.recipients.join(', '),
        subject: `[${alert.severity}] ${alert.type} - ${alert.message}`,
        html: this.generateEmailContent(alert),
        priority: this.alertLevels[alert.severity]?.priority === 3 ? 'high' : 'normal'
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email notification sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email notification failed:', error);
      throw error;
    }
  }

  // Generate email content
  generateEmailContent(alert) {
    const level = this.alertLevels[alert.severity];
    const color = level?.color || '#000000';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${color}; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${alert.severity} ALERT</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">${alert.type}</p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: ${color}; margin-top: 0;">${alert.message}</h2>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Alert Details</h3>
            <p><strong>Type:</strong> ${alert.type}</p>
            <p><strong>Severity:</strong> ${alert.severity}</p>
            <p><strong>Time:</strong> ${alert.timestamp.toISOString()}</p>
            <p><strong>ID:</strong> ${alert.id}</p>
          </div>
          
          ${alert.details ? `
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
              <h3 style="margin-top: 0;">Additional Information</h3>
              <pre style="white-space: pre-wrap; font-family: monospace;">${JSON.stringify(alert.details, null, 2)}</pre>
            </div>
          ` : ''}
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              This alert was generated by the Radiation Health Module monitoring system.<br>
              Please acknowledge this alert in the system dashboard.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  // Send Slack notification
  async sendSlackNotification(alert) {
    if (!this.notificationSettings.slack.enabled || !this.notificationSettings.slack.webhookUrl) {
      return;
    }

    try {
      const level = this.alertLevels[alert.severity];
      const color = level?.color || '#000000';
      
      const slackMessage = {
        channel: this.notificationSettings.slack.channel,
        username: this.notificationSettings.slack.username,
        attachments: [{
          color: color,
          title: `${alert.severity} ALERT: ${alert.type}`,
          text: alert.message,
          fields: [
            {
              title: 'Severity',
              value: alert.severity,
              short: true
            },
            {
              title: 'Time',
              value: alert.timestamp.toISOString(),
              short: true
            },
            {
              title: 'Alert ID',
              value: alert.id.toString(),
              short: true
            }
          ],
          footer: 'Radiation Health Module Monitor',
          ts: Math.floor(alert.timestamp.getTime() / 1000)
        }]
      };

      if (alert.details) {
        slackMessage.attachments[0].fields.push({
          title: 'Details',
          value: JSON.stringify(alert.details, null, 2),
          short: false
        });
      }

      const response = await fetch(this.notificationSettings.slack.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slackMessage)
      });

      if (!response.ok) {
        throw new Error(`Slack API responded with status: ${response.status}`);
      }

      console.log('Slack notification sent successfully');
      return response;
    } catch (error) {
      console.error('Slack notification failed:', error);
      throw error;
    }
  }

  // Send console notification
  sendConsoleNotification(alert) {
    const level = this.alertLevels[alert.severity];
    const color = level?.color || '#000000';
    
    console.log('\n' + '='.repeat(80));
    console.log(`🚨 ${alert.severity} ALERT 🚨`);
    console.log('='.repeat(80));
    console.log(`Type: ${alert.type}`);
    console.log(`Message: ${alert.message}`);
    console.log(`Time: ${alert.timestamp.toISOString()}`);
    console.log(`ID: ${alert.id}`);
    
    if (alert.details) {
      console.log('Details:', JSON.stringify(alert.details, null, 2));
    }
    
    console.log('='.repeat(80) + '\n');
  }

  // Send database notification (store in audit log)
  async sendDatabaseNotification(alert) {
    try {
      const pool = require('../db');
      
      await pool.query(`
        INSERT INTO radiation_audit_log (ts, actor, action, obj_schema, obj_table, obj_id, before, after)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        alert.timestamp,
        'SYSTEM',
        'ALERT_GENERATED',
        'monitoring',
        'alerts',
        alert.id,
        null,
        JSON.stringify(alert)
      ]);
      
      console.log('Alert logged to database audit log');
    } catch (error) {
      console.error('Failed to log alert to database:', error);
    }
  }

  // Send escalation notification for critical alerts
  async sendEscalationNotification(alert) {
    if (alert.severity === 'CRITICAL' || alert.severity === 'EMERGENCY') {
      // Add escalation logic here
      console.log(`ESCALATION: Critical alert ${alert.id} requires immediate attention`);
      
      // Could add phone/SMS notifications here
      // Could add pager notifications here
      // Could add escalation to on-call personnel here
    }
  }

  // Test notification system
  async testNotification(channel = 'all') {
    const testAlert = {
      id: Date.now(),
      type: 'TEST_ALERT',
      severity: 'INFO',
      message: 'This is a test notification to verify the alerting system',
      details: { test: true, timestamp: new Date() },
      timestamp: new Date()
    };

    if (channel === 'all') {
      await this.sendNotification(testAlert);
    } else if (this.notificationChannels[channel]) {
      await this.notificationChannels[channel](testAlert);
    } else {
      throw new Error(`Unknown notification channel: ${channel}`);
    }

    return testAlert;
  }

  // Update notification settings
  updateNotificationSettings(settings) {
    this.notificationSettings = { ...this.notificationSettings, ...settings };
    console.log('Notification settings updated:', this.notificationSettings);
  }

  // Get current notification settings
  getNotificationSettings() {
    return this.notificationSettings;
  }

  // Get notification statistics
  getNotificationStats() {
    return {
      channels: Object.keys(this.notificationSettings),
      enabledChannels: Object.entries(this.notificationSettings)
        .filter(([_, config]) => config.enabled)
        .map(([name, _]) => name),
      alertLevels: this.alertLevels
    };
  }
}

module.exports = new AlertingService();
