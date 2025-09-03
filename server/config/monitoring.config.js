module.exports = {
  // System health check intervals (in milliseconds)
  intervals: {
    systemHealth: 30000,        // 30 seconds
    databaseHealth: 60000,      // 1 minute
    performanceMetrics: 300000, // 5 minutes
    alertCleanup: 3600000,      // 1 hour
    radiationModuleHealth: 60000, // 1 minute
    deviceStatusCheck: 120000,  // 2 minutes
    personnelStatusCheck: 300000, // 5 minutes
  },

  // Alert thresholds
  thresholds: {
    // System thresholds
    criticalAlerts: 5,           // Max critical alerts before escalation
    memoryUsagePercent: 80,      // Memory usage warning threshold
    cpuUsagePercent: 70,         // CPU usage warning threshold
    databaseConnections: 20,     // Max database connections
    apiResponseTimeMs: 5000,     // API response time warning (5 seconds)
    errorRatePercent: 10,        // Error rate warning threshold
    
    // Radiation module specific thresholds
    radiationCriticalAlerts: 3,  // Max critical radiation alerts
    deviceCalibrationOverdue: 0, // Any overdue calibration triggers alert
    deviceInactivityPercent: 20, // More than 20% inactive devices
    noReadingsThreshold: 3600000, // No readings for 1 hour triggers alert
    doseSpikeThreshold: 100,     // Dose rate spike threshold (uSv/h)
    batteryLowThreshold: 20,     // Low battery threshold (%)
    
    // Performance thresholds
    slowQueryThreshold: 1000,    // Slow query threshold (1 second)
    connectionPoolThreshold: 0.8, // Connection pool usage threshold (80%)
    diskSpaceThreshold: 90,      // Disk space warning threshold (%)
  },

  // Notification settings
  notifications: {
    email: {
      enabled: process.env.EMAIL_NOTIFICATIONS === 'true',
      recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
      smtp: {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      },
      templates: {
        critical: {
          subject: '[CRITICAL] Radiation Health System Alert',
          priority: 'high'
        },
        warning: {
          subject: '[WARNING] Radiation Health System Alert',
          priority: 'normal'
        },
        info: {
          subject: '[INFO] Radiation Health System Update',
          priority: 'normal'
        }
      }
    },

    slack: {
      enabled: process.env.SLACK_NOTIFICATIONS === 'true',
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channel: process.env.SLACK_CHANNEL || '#radiation-health-alerts',
      username: process.env.SLACK_USERNAME || 'Radiation Health Monitor',
      iconEmoji: ':radioactive:',
      colors: {
        CRITICAL: '#ff0000',
        WARNING: '#ffa500',
        INFO: '#36a64f'
      }
    },

    console: {
      enabled: true, // Always enabled for development
      logLevel: process.env.LOG_LEVEL || 'info',
      timestampFormat: 'ISO'
    },

    database: {
      enabled: true, // Always enabled
      auditTable: 'radiation_audit_log',
      retentionDays: 90
    }
  },

  // Alert escalation rules
  escalation: {
    enabled: true,
    levels: [
      {
        level: 1,
        delay: 300000, // 5 minutes
        actions: ['console', 'database', 'email']
      },
      {
        level: 2,
        delay: 900000, // 15 minutes
        actions: ['console', 'database', 'email', 'slack']
      },
      {
        level: 3,
        delay: 1800000, // 30 minutes
        actions: ['console', 'database', 'email', 'slack', 'escalation']
      }
    ],
    escalationContacts: process.env.ESCALATION_CONTACTS?.split(',') || [],
    escalationPhone: process.env.ESCALATION_PHONE,
    escalationPager: process.env.ESCALATION_PAGER
  },

  // Health check configurations
  healthChecks: {
    database: {
      timeout: 10000, // 10 seconds
      retries: 3,
      queries: [
        'SELECT 1 as health_check',
        'SELECT COUNT(*) FROM radiation_personnel',
        'SELECT COUNT(*) FROM radiation_devices'
      ]
    },
    
    radiationModule: {
      timeout: 15000, // 15 seconds
      checks: [
        'personnel',
        'devices',
        'readings',
        'alerts',
        'reconciliations'
      ]
    },
    
    externalServices: {
      timeout: 10000,
      services: [
        {
          name: 'Database Connection Pool',
          check: 'pool_status'
        },
        {
          name: 'File System',
          check: 'disk_space'
        },
        {
          name: 'Memory Usage',
          check: 'memory_status'
        }
      ]
    }
  },

  // Performance monitoring
  performance: {
    metrics: {
      enabled: true,
      collectionInterval: 60000, // 1 minute
      retentionPeriod: 86400000, // 24 hours
      aggregation: {
        hourly: true,
        daily: true,
        weekly: true
      }
    },
    
    apm: {
      enabled: process.env.APM_ENABLED === 'true',
      sampleRate: 0.1, // 10% of requests
      slowQueryThreshold: 1000, // 1 second
      errorSampling: 1.0 // 100% of errors
    }
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    transports: ['console', 'file'],
    file: {
      enabled: process.env.FILE_LOGGING === 'true',
      path: process.env.LOG_FILE_PATH || './logs/monitoring.log',
      maxSize: '10m',
      maxFiles: 5
    },
    console: {
      enabled: true,
      colorize: true
    }
  },

  // Maintenance and cleanup
  maintenance: {
    cleanup: {
      enabled: true,
      schedule: '0 2 * * *', // Daily at 2 AM
      retention: {
        alerts: 30,      // Keep alerts for 30 days
        metrics: 90,     // Keep metrics for 90 days
        logs: 180        // Keep logs for 180 days
      }
    },
    
    backups: {
      enabled: process.env.BACKUP_ENABLED === 'true',
      schedule: '0 1 * * *', // Daily at 1 AM
      retention: 7, // Keep backups for 7 days
      includeMonitoringData: true
    }
  },

  // Security settings
  security: {
    authentication: {
      required: true,
      method: 'jwt', // or 'session'
      roles: ['admin', 'monitor']
    },
    
    rateLimiting: {
      enabled: true,
      windowMs: 900000, // 15 minutes
      maxRequests: 100
    },
    
    cors: {
      enabled: true,
      origins: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://172.31.24.38:5173',
        'http://172.31.24.38:5174'
      ],
      credentials: true
    }
  },

  // Environment-specific overrides
  environments: {
    development: {
      intervals: {
        systemHealth: 60000,      // 1 minute in dev
        databaseHealth: 120000,   // 2 minutes in dev
      },
      notifications: {
        email: { enabled: false },
        slack: { enabled: false }
      },
      logging: {
        level: 'debug'
      }
    },
    
    production: {
      intervals: {
        systemHealth: 30000,      // 30 seconds in prod
        databaseHealth: 60000,    // 1 minute in prod
      },
      notifications: {
        email: { enabled: true },
        slack: { enabled: true }
      },
      logging: {
        level: 'warn'
      },
      escalation: {
        enabled: true
      }
    }
  }
};
