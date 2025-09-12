const { Pool } = require('pg');
const pool = require('../db');

class MonitoringService {
  constructor() {
    this.metrics = {
      systemHealth: 'healthy',
      lastCheck: new Date(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      databaseConnections: 0,
      activeAlerts: 0,
      criticalAlerts: 0,
      apiResponseTime: [], // Limited to last 100 entries
      errorCount: 0,
      lastError: null
    };
    
    // Memory optimization: Limit response time array size
    this.maxResponseTimeEntries = 100;
    
    this.alertThresholds = {
      criticalAlerts: 5,
      memoryUsagePercent: 85,  // Increased from 80% to 85% for process memory
      cpuUsagePercent: 70,
      databaseConnections: 20,
      apiResponseTimeMs: 5000,
      errorRatePercent: 10
    };
    
    this.alerts = [];
    this.startMonitoring();
  }

  // Start continuous monitoring
  startMonitoring() {
    // System health check every 2 minutes (reduced from 60s to reduce overhead)
    this.healthCheckInterval = setInterval(() => {
      this.checkSystemHealth();
    }, 120000);

    // Database health check every 5 minutes (reduced from 2 minutes)
    this.dbCheckInterval = setInterval(() => {
      this.checkDatabaseHealth();
    }, 300000);

    // Performance metrics every 15 minutes (reduced from 10 minutes)
    this.perfCheckInterval = setInterval(() => {
      this.collectPerformanceMetrics();
    }, 900000);

    // Cleanup old alerts every 30 minutes (unchanged)
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldAlerts();
    }, 1800000);
  }

  // Check overall system health
  async checkSystemHealth() {
    try {
      const healthChecks = await Promise.all([
        this.checkDatabaseHealth(),
        this.checkMemoryUsage(),
        this.checkCpuUsage(),
        this.checkRadiationModuleHealth()
      ]);

      const allHealthy = healthChecks.every(check => check.status === 'healthy');
      this.metrics.systemHealth = allHealthy ? 'healthy' : 'degraded';
      this.metrics.lastCheck = new Date();
      this.metrics.uptime = process.uptime();

      // Generate system health alert if needed
      if (!allHealthy) {
        this.generateAlert('SYSTEM_HEALTH', 'WARNING', 'System health check failed', {
          checks: healthChecks,
          timestamp: new Date()
        });
      }

      return { status: this.metrics.systemHealth, checks: healthChecks };
    } catch (error) {
      console.error('System health check failed:', error);
      this.metrics.systemHealth = 'critical';
      this.generateAlert('SYSTEM_HEALTH', 'CRITICAL', 'System health check error', {
        error: error.message,
        timestamp: new Date()
      });
      return { status: 'critical', error: error.message };
    }
  }

  // Check database health
  async checkDatabaseHealth() {
    try {
      const startTime = Date.now();
      const result = await pool.query('SELECT 1 as health_check');
      const responseTime = Date.now() - startTime;

      // Check connection pool status
      const poolStatus = pool.totalCount || 0;
      this.metrics.databaseConnections = poolStatus;

      const status = responseTime < this.alertThresholds.apiResponseTimeMs ? 'healthy' : 'degraded';
      
      if (responseTime > this.alertThresholds.apiResponseTimeMs) {
        this.generateAlert('DATABASE_PERFORMANCE', 'WARNING', 'Database response time slow', {
          responseTime,
          threshold: this.alertThresholds.apiResponseTimeMs,
          timestamp: new Date()
        });
      }

      if (poolStatus > this.alertThresholds.databaseConnections) {
        this.generateAlert('DATABASE_CONNECTIONS', 'WARNING', 'High database connection count', {
          connections: poolStatus,
          threshold: this.alertThresholds.databaseConnections,
          timestamp: new Date()
        });
      }

      return {
        status,
        responseTime,
        connections: poolStatus,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      this.generateAlert('DATABASE_HEALTH', 'CRITICAL', 'Database connection failed', {
        error: error.message,
        timestamp: new Date()
      });
      return { status: 'critical', error: error.message };
    }
  }

  // Check memory usage
  checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const memoryPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    this.metrics.memoryUsage = memUsage;
    
    // Only alert if process memory usage is high (not system-wide)
    if (memoryPercent > this.alertThresholds.memoryUsagePercent) {
      this.generateAlert('MEMORY_USAGE', 'WARNING', 'High process memory usage detected', {
        usage: memoryPercent.toFixed(2) + '%',
        threshold: this.alertThresholds.memoryUsagePercent + '%',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        timestamp: new Date()
      });
    }

    return {
      status: memoryPercent < this.alertThresholds.memoryUsagePercent ? 'healthy' : 'degraded',
      usage: memoryPercent.toFixed(2) + '%',
      details: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      }
    };
  }

  // Check CPU usage
  checkCpuUsage() {
    const cpuUsage = process.cpuUsage();
    // Note: This is a simple check. For production, consider using system-level monitoring
    
    return {
      status: 'healthy',
      details: cpuUsage
    };
  }

  // Check Radiation Health Module specific health
  async checkRadiationModuleHealth() {
    try {
      const checks = await Promise.all([
        this.checkRadiationAlerts(),
        this.checkRadiationDevices(),
        this.checkRadiationPersonnel(),
        this.checkRadiationReadings()
      ]);

      const allHealthy = checks.every(check => check.status === 'healthy');
      
      return {
        status: allHealthy ? 'healthy' : 'degraded',
        checks,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Radiation module health check failed:', error);
      return { status: 'critical', error: error.message };
    }
  }

  // Check radiation alerts
  async checkRadiationAlerts() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_alerts,
          COUNT(CASE WHEN ack_ts IS NULL THEN 1 END) as pending_alerts,
          COUNT(CASE WHEN severity = 'CRITICAL' AND ack_ts IS NULL THEN 1 END) as critical_pending
        FROM radiation_alerts
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      `);

      const data = result.rows[0];
      this.metrics.activeAlerts = data.pending_alerts;
      this.metrics.criticalAlerts = data.critical_pending;

      // Alert if too many critical alerts
      if (data.critical_pending > this.alertThresholds.criticalAlerts) {
        this.generateAlert('RADIATION_ALERTS', 'CRITICAL', 'Too many critical radiation alerts', {
          criticalAlerts: data.critical_pending,
          threshold: this.alertThresholds.criticalAlerts,
          timestamp: new Date()
        });
      }

      return {
        status: data.critical_pending <= this.alertThresholds.criticalAlerts ? 'healthy' : 'degraded',
        totalAlerts: data.total_alerts,
        pendingAlerts: data.pending_alerts,
        criticalPending: data.critical_pending
      };
    } catch (error) {
      return { status: 'critical', error: error.message };
    }
  }

  // Check radiation devices
  async checkRadiationDevices() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_devices,
          COUNT(CASE WHEN retired_at IS NULL THEN 1 END) as active_devices,
          COUNT(CASE WHEN calib_due < NOW() THEN 1 END) as overdue_calibration,
          COUNT(CASE WHEN last_reading < NOW() - INTERVAL '24 hours' THEN 1 END) as inactive_devices
        FROM radiation_devices
      `);

      const data = result.rows[0];
      
      // Alert for overdue calibrations
      if (data.overdue_calibration > 0) {
        this.generateAlert('DEVICE_CALIBRATION', 'WARNING', 'Devices overdue for calibration', {
          overdueCount: data.overdue_calibration,
          timestamp: new Date()
        });
      }

      // Alert for inactive devices
      if (data.inactive_devices > data.active_devices * 0.2) { // More than 20% inactive
        this.generateAlert('DEVICE_ACTIVITY', 'WARNING', 'High number of inactive devices', {
          inactiveCount: data.inactive_devices,
          activeCount: data.active_devices,
          timestamp: new Date()
        });
      }

      return {
        status: 'healthy',
        totalDevices: data.total_devices,
        activeDevices: data.active_devices,
        overdueCalibration: data.overdue_calibration,
        inactiveDevices: data.inactive_devices
      };
    } catch (error) {
      return { status: 'critical', error: error.message };
    }
  }

  // Check radiation personnel
  async checkRadiationPersonnel() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_personnel,
          COUNT(CASE WHEN active = true THEN 1 END) as active_personnel,
          COUNT(CASE WHEN active = false THEN 1 END) as inactive_personnel
        FROM radiation_personnel
      `);

      const data = result.rows[0];
      
      return {
        status: 'healthy',
        totalPersonnel: data.total_personnel,
        activePersonnel: data.active_personnel,
        inactivePersonnel: data.inactive_personnel
      };
    } catch (error) {
      return { status: 'critical', error: error.message };
    }
  }

  // Check radiation readings
  async checkRadiationReadings() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_readings,
          COUNT(CASE WHEN measured_ts >= NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour,
          COUNT(CASE WHEN measured_ts >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h,
          MAX(measured_ts) as latest_reading
        FROM radiation_dose_readings
      `);

      const data = result.rows[0];
      
      // Alert if no recent readings
      if (data.last_hour === 0) {
        this.generateAlert('READINGS_ACTIVITY', 'WARNING', 'No recent dose readings', {
          lastReading: data.latest_reading,
          timestamp: new Date()
        });
      }

      return {
        status: 'healthy',
        totalReadings: data.total_readings,
        lastHour: data.last_hour,
        last24h: data.last_24h,
        latestReading: data.latest_reading
      };
    } catch (error) {
      return { status: 'critical', error: error.message };
    }
  }

  // Generate alerts
  generateAlert(type, severity, message, details) {
    const alert = {
      id: Date.now() + Math.random(),
      type,
      severity,
      message,
      details,
      timestamp: new Date(),
      acknowledged: false
    };

    this.alerts.push(alert);
    
    // Log alert
    console.log(`[${severity}] ${type}: ${message}`, details);
    
    // Store in database if it's a radiation-related alert
    if (type.startsWith('RADIATION_')) {
      this.storeAlertInDatabase(alert);
    }

    return alert;
  }

  // Store alert in database
  async storeAlertInDatabase(alert) {
    try {
      await pool.query(`
        INSERT INTO radiation_alerts (type, severity, threshold, value, details, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        alert.type,
        alert.severity,
        JSON.stringify(alert.details),
        alert.message,
        JSON.stringify(alert.details),
        alert.timestamp
      ]);
    } catch (error) {
      console.error('Failed to store alert in database:', error);
    }
  }

  // Collect performance metrics
  collectPerformanceMetrics() {
    // Track API response times
    if (this.metrics.apiResponseTime.length > 100) {
      this.metrics.apiResponseTime = this.metrics.apiResponseTime.slice(-50);
    }
  }

  // Cleanup old alerts
  cleanupOldAlerts() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const beforeCount = this.alerts.length;
    
    // Remove old alerts
    this.alerts = this.alerts.filter(alert => alert.timestamp > oneDayAgo);
    
    // Limit alerts to maximum 1000 entries
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 1000);
    }
    
    // Limit response time array
    if (this.metrics.apiResponseTime.length > this.maxResponseTimeEntries) {
      this.metrics.apiResponseTime = this.metrics.apiResponseTime
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.maxResponseTimeEntries);
    }
    
    const afterCount = this.alerts.length;
    if (beforeCount !== afterCount) {
      console.log(`🧹 Cleaned up ${beforeCount - afterCount} old alerts. Current: ${afterCount}`);
    }
  }

  // Get current metrics
  getMetrics() {
    return {
      ...this.metrics,
      alerts: this.alerts.filter(a => !a.acknowledged),
      alertCount: this.alerts.filter(a => !a.acknowledged).length
    };
  }

  // Get system health summary
  getHealthSummary() {
    return {
      status: this.metrics.systemHealth,
      uptime: this.metrics.uptime,
      lastCheck: this.metrics.lastCheck,
      criticalAlerts: this.metrics.criticalAlerts,
      activeAlerts: this.metrics.activeAlerts,
      databaseConnections: this.metrics.databaseConnections
    };
  }

  // Acknowledge alert
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date();
    }
  }

  // Reset metrics
  resetMetrics() {
    this.metrics.errorCount = 0;
    this.metrics.lastError = null;
    this.metrics.apiResponseTime = [];
  }

  // Cleanup method for graceful shutdown
  cleanup() {
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    if (this.dbCheckInterval) clearInterval(this.dbCheckInterval);
    if (this.perfCheckInterval) clearInterval(this.perfCheckInterval);
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    
    // Clear arrays to free memory
    this.alerts = [];
    this.metrics.apiResponseTime = [];
    
    console.log('🧹 Monitoring service cleaned up');
  }
}

module.exports = new MonitoringService();
