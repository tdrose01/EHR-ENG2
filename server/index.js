// This file was modified by the DeveloperAgent
try {
  require('dotenv').config()
} catch {
  console.warn('dotenv not installed; skipping .env loading')
}

const express = require('express')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const cors = require('cors')
const helmet = require('helmet')
const pool = require('./db')
const { limiter, sanitizeInput, errorHandler } = require('./middleware/security')
const { login, verifyToken } = require('./middleware/auth')

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set, using default')
  process.env.DATABASE_URL = 'postgresql://postgres@localhost:5432/ehr_eng2'
}

const app = express()
const PORT = process.env.PORT || 3005;

// Import routes
const patientRoutes = require('./routes/patients')
const environmentRoutes = require('./routes/environments')
const navyRoutes = require('./routes/navy')
const radiationRoutes = require('./routes/radiation')
const exposureRoutes = require('./routes/exposures')
const waterTestRoutes = require('./routes/waterTests')
const monitoringRoutes = require('./routes/monitoring')
const userRoutes = require('./routes/users')

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://172.31.24.38:5173',
    'http://172.31.24.38:5174'
  ],
  credentials: true
}))

app.use(express.json())
app.use(helmet())
app.use(limiter)
app.use(sanitizeInput)

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Use routes
app.use('/api/patients', patientRoutes)
app.use('/api/environments', environmentRoutes)
app.use('/api/navy', navyRoutes)
app.use('/api/radiation', radiationRoutes)
app.use('/api/exposures', exposureRoutes)
app.use('/api/water-tests', waterTestRoutes)
app.use('/api/monitoring', monitoringRoutes)
app.use('/api/users', userRoutes)

console.log('Loading admin routes...');
const adminRoutes = require('./routes/admin');
console.log('Admin routes loaded successfully');
app.use('/api/admin', adminRoutes);
console.log('Admin routes registered at /api/admin');


// Debug endpoint to list all registered routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods);
      methods.forEach(method => {
        routes.push(`${method.toUpperCase()} ${middleware.route.path}`);
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods);
          methods.forEach(method => {
            routes.push(`${method.toUpperCase()} ${middleware.regexp.source.replace(/\\\//g, '/').replace(/^\^/, '').replace(/\$/, '')}${handler.route.path}`);
          });
        }
      });
    }
  });
  res.json({ routes });
});

// Use JWT-based login
app.post('/api/login', login)

// Health status endpoint
app.get('/api/v1/health/status', async (req, res) => {
  const status = { api: 'online', database: 'online' }
  try {
    await pool.query('SELECT 1')
    res.json(status)
  } catch (err) {
    console.error('Database health check failed:', err)
    status.database = 'offline'
    res.status(503).json(status)
  }
})

// Environmental Dashboard API
app.get('/api/environmental/latest', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pm25, pm10, o3, lead, arsenic, status_air, status_water, recorded_at
       FROM environmental_data
       ORDER BY recorded_at DESC
       LIMIT 1`
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }
    const row = result.rows[0];
    res.json({
      airQuality: {
        pm25: row.pm25,
        pm10: row.pm10,
        o3: row.o3,
        status: row.status_air
      },
      waterQuality: {
        lead: row.lead,
        arsenic: row.arsenic,
        status: row.status_water
      },
      lastUpdated: row.recorded_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Real-time monitoring endpoints
app.get('/api/realtime/status', (req, res) => {
  const wsService = app.get('wsService');
  const notificationService = app.get('notificationService');
  const dbListenerService = app.get('dbListenerService');
  
  if (!wsService || !notificationService || !dbListenerService) {
    return res.status(503).json({
      success: false,
      error: 'Real-time services not initialized'
    });
  }
  
  const wsStats = wsService.getConnectionStats();
  const notifStats = notificationService.getNotificationStats();
  const dbStats = dbListenerService.getStatus();
  
  res.json({
    success: true,
    realtime: {
      websocket: wsStats,
      notifications: notifStats,
      databaseListener: dbStats,
      serverUptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

app.get('/api/realtime/health', async (req, res) => {
  try {
    const dbListenerService = app.get('dbListenerService');
    const wsService = app.get('wsService');
    
    if (!dbListenerService || !wsService) {
      return res.status(503).json({
        success: false,
        error: 'Real-time services not available'
      });
    }
    
    const dbHealth = await dbListenerService.performHealthCheck();
    const wsHealth = {
      status: wsService.wss.readyState === 1 ? 'healthy' : 'unhealthy',
      connections: wsService.getConnectionStats().totalConnections
    };
    
    const overallHealth = dbHealth.status === 'healthy' && wsHealth.status === 'healthy' 
      ? 'healthy' : 'unhealthy';
    
    res.json({
      success: true,
      health: {
        overall: overallHealth,
        websocket: wsHealth,
        databaseListener: dbHealth,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    });
  }
});

if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`)
    console.log('Available routes:')
    console.log('- GET    /api/patients')
    console.log('- GET    /api/patients/:id')
    console.log('- POST   /api/patients')
    console.log('- PUT    /api/patients/:id')
    console.log('- DELETE /api/patients/:id')
    console.log('- GET    /api/patients/:id/water-tests')
    console.log('- POST   /api/patients/:id/water-tests')
    console.log('- GET    /api/patients/search/:query')
    console.log('- GET    /api/users/:id')
    console.log('- GET    /api/environments')
    console.log('- GET    /api/environments/:id')
    console.log('- GET    /api/v1/health/status')
    console.log('- POST   /api/admin/backup/create')
    console.log('- GET    /api/admin/backup/list')
    console.log('- POST   /api/admin/backup/restore')
    console.log('- DELETE /api/admin/backup/delete')
    console.log('- GET    /api/admin/backup/locations')
    console.log('- GET    /api/realtime/status')
    console.log('- GET    /api/realtime/health')
  });

  // Import and initialize real-time services
  const WebSocketService = require('./services/websocketService');
  const NotificationService = require('./services/notificationService');
  const DatabaseListenerService = require('./services/databaseListenerService');
  const MemoryManager = require('./services/memoryManager');

  // Initialize real-time services
  const wsService = new WebSocketService(server);
  const notificationService = new NotificationService(wsService);
  const dbListenerService = new DatabaseListenerService(wsService, notificationService);

  // Start database listener
  dbListenerService.startListening().catch(error => {
    console.error('❌ Failed to start database listener:', error);
  });

  // Make services available to routes
  app.set('wsService', wsService);
  app.set('notificationService', notificationService);
  app.set('dbListenerService', dbListenerService);
  app.set('memoryManager', MemoryManager);

  // Set up memory monitoring event handlers
  MemoryManager.on('memoryWarning', (memoryInfo) => {
    console.log(`⚠️ Memory warning: ${memoryInfo.system.percent}% used`);
  });

  MemoryManager.on('memoryCritical', (memoryInfo) => {
    console.log(`🚨 Memory critical: ${memoryInfo.system.percent}% used`);
  });

  MemoryManager.on('cleanupPerformed', (type) => {
    console.log(`🧹 Memory cleanup performed: ${type}`);
  });

  console.log('🔌 Real-time monitoring services initialized');
  console.log('🧠 Memory management system active');
  console.log('📡 WebSocket endpoint: ws://localhost:' + PORT + '/ws');
  console.log('📊 Real-time status: http://localhost:' + PORT + '/api/realtime/status');
}

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app
