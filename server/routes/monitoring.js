const express = require('express');
const router = express.Router();
const monitoringService = require('../services/monitoringService');
const MemoryManager = require('../services/memoryManager');

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const healthSummary = await monitoringService.checkSystemHealth();
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: healthSummary
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Quick health check (lightweight)
router.get('/health/quick', (req, res) => {
  const healthSummary = monitoringService.getHealthSummary();
  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: healthSummary
  });
});

// Get detailed metrics
router.get('/metrics', (req, res) => {
  try {
    const metrics = monitoringService.getMetrics();
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: metrics
    });
  } catch (error) {
    console.error('Metrics fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch metrics',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get system status
router.get('/status', async (req, res) => {
  try {
    const [healthSummary, metrics] = await Promise.all([
      monitoringService.checkSystemHealth(),
      monitoringService.getMetrics()
    ]);

    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        system: healthSummary,
        metrics: {
          uptime: metrics.uptime,
          memoryUsage: metrics.memoryUsage,
          databaseConnections: metrics.databaseConnections,
          activeAlerts: metrics.activeAlerts,
          criticalAlerts: metrics.criticalAlerts
        }
      }
    });
  } catch (error) {
    console.error('Status fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch system status',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get active alerts
router.get('/alerts', (req, res) => {
  try {
    const alerts = monitoringService.alerts.filter(a => !a.acknowledged);
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        alerts,
        count: alerts.length
      }
    });
  } catch (error) {
    console.error('Alerts fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch alerts',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Acknowledge an alert
router.post('/alerts/:alertId/acknowledge', (req, res) => {
  try {
    const { alertId } = req.params;
    monitoringService.acknowledgeAlert(parseFloat(alertId));
    
    res.json({
      status: 'success',
      message: 'Alert acknowledged successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Alert acknowledgment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to acknowledge alert',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get radiation module specific health
router.get('/radiation/health', async (req, res) => {
  try {
    const radiationHealth = await monitoringService.checkRadiationModuleHealth();
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: radiationHealth
    });
  } catch (error) {
    console.error('Radiation health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check radiation module health',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get database health
router.get('/database/health', async (req, res) => {
  try {
    const dbHealth = await monitoringService.checkDatabaseHealth();
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: dbHealth
    });
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check database health',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get performance metrics
router.get('/performance', (req, res) => {
  try {
    const metrics = monitoringService.getMetrics();
    const performanceData = {
      uptime: metrics.uptime,
      memoryUsage: metrics.memoryUsage,
      cpuUsage: metrics.cpuUsage,
      apiResponseTime: metrics.apiResponseTime,
      errorCount: metrics.errorCount,
      lastError: metrics.lastError
    };

    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: performanceData
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch performance metrics',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Reset metrics (admin only)
router.post('/metrics/reset', (req, res) => {
  try {
    monitoringService.resetMetrics();
    res.json({
      status: 'success',
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Metrics reset error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset metrics',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get monitoring configuration
router.get('/config', (req, res) => {
  try {
    const config = {
      alertThresholds: monitoringService.alertThresholds,
      monitoringIntervals: {
        systemHealth: '30 seconds',
        databaseHealth: '1 minute',
        performanceMetrics: '5 minutes',
        alertCleanup: '1 hour'
      }
    };

    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: config
    });
  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch monitoring configuration',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test alert generation (for testing purposes)
router.post('/test-alert', (req, res) => {
  try {
    const { type, severity, message, details } = req.body;
    const alert = monitoringService.generateAlert(
      type || 'TEST_ALERT',
      severity || 'INFO',
      message || 'Test alert generated',
      details || { test: true, timestamp: new Date() }
    );

    res.json({
      status: 'success',
      message: 'Test alert generated successfully',
      timestamp: new Date().toISOString(),
      data: alert
    });
  } catch (error) {
    console.error('Test alert generation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate test alert',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Memory management endpoints
router.get('/memory', (req, res) => {
  try {
    const memoryStats = MemoryManager.getMemoryStats();
    res.json({
      status: 'success',
      data: memoryStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Memory stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get memory statistics',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Force memory cleanup
router.post('/memory/cleanup', (req, res) => {
  try {
    const { type = 'standard' } = req.body;
    
    switch (type) {
      case 'standard':
        MemoryManager.performStandardCleanup();
        break;
      case 'aggressive':
        MemoryManager.performAggressiveCleanup();
        break;
      case 'emergency':
        MemoryManager.performEmergencyCleanup();
        break;
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid cleanup type. Use: standard, aggressive, or emergency'
        });
    }
    
    const memoryStats = MemoryManager.getMemoryStats();
    
    res.json({
      status: 'success',
      message: `Memory cleanup performed: ${type}`,
      data: memoryStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Memory cleanup error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to perform memory cleanup',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Set memory thresholds
router.post('/memory/thresholds', (req, res) => {
  try {
    const { warning, critical, max } = req.body;
    
    if (!warning || !critical || !max) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: warning, critical, max'
      });
    }
    
    MemoryManager.setThresholds(warning, critical, max);
    
    res.json({
      status: 'success',
      message: 'Memory thresholds updated',
      thresholds: { warning, critical, max },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Memory thresholds error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update memory thresholds',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
