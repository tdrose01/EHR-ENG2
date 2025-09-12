# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Essential Development Commands

```powershell
# Start development environment (both frontend and backend)
npm run start                    # Starts both servers via script
npm run dev                     # Frontend only (Vite dev server) - Port 5173
npm run start:server            # Backend only (Express server) - Port 3005
npm run start:optimized         # Memory-optimized backend server

# Stop services
npm run stop                    # Stops all servers
npm run stop:server             # Kills server on port 3000 specifically

# Build and testing
npm run build                   # Build frontend for production
npm run test                    # Run Jest test suite
npm run test:unit               # Run Vitest unit tests
npm run lint                    # ESLint code checking

# Specialized testing commands
npm run test:backup             # Test backup system functionality
npm run test:monitoring         # Test monitoring services
npm run test:websocket          # Test WebSocket connections
npm run test:alerts             # Test alert system
npm run test:dose-alerts        # Test radiation dose alerts
npm run setup:test-data         # Set up test database data
npm run generate:test-data      # Generate test data for development
```

### Database Commands

```powershell
# Run database schema
psql -d ehr_eng2 -f schema.sql

# Test database connections and functionality
npm run test:backup-api         # Test backup API endpoints
npm run test:backup-locations   # Test backup location functionality
```

## Architecture Overview

### Technology Stack
- **Frontend**: Vue 3 + Vite + Tailwind CSS + Chart.js
- **Backend**: Node.js + Express + PostgreSQL + Socket.IO
- **Database**: PostgreSQL with comprehensive schema
- **Real-time**: WebSocket for live monitoring and alerts
- **Testing**: Jest + Vitest + Puppeteer

### High-Level Architecture

This is a **dual-module Electronic Health Record (EHR) system** with a modular microservices-inspired backend:

#### Frontend Architecture (`src/`)
```
src/
├── components/         # Reusable Vue components
├── views/             # Page-level components (LandingDashboard, RadiationDashboard, etc.)
├── router/            # Vue Router configuration with auth guards
├── services/          # API service layer
├── composables/       # Vue composition functions
└── utils/             # Utility functions
```

#### Backend Architecture (`server/`)
```
server/
├── routes/            # REST API endpoints (patients, radiation, navy, admin, etc.)
├── services/          # Business logic services
│   ├── websocketService.js      # Real-time WebSocket management
│   ├── notificationService.js   # Alert and notification system
│   ├── monitoringService.js     # System monitoring
│   └── memoryManager.js         # Memory optimization
├── models/            # Database models and data access layer
├── config/            # Configuration management
├── tests/             # Backend-specific tests
└── specialized services/
    ├── anomaly_detection_service/
    ├── csv_polling_service/
    ├── data_retention_service/
    ├── grpc_service/
    ├── hl7_listener/
    ├── mqtt_bridge/
    └── nifi_sftp_loader/
```

### Core System Modules

#### 1. Electronic Health (EH) Module
- **Patient Management**: Complete CRUD operations for patient records
- **Medical History**: Detailed medical history tracking with audit trails
- **Environmental Dashboard**: Environmental exposure tracking with data visualization
- **System Monitoring**: Real-time system health metrics and performance monitoring

#### 2. Radiation Health (RH) Module ✅ **PRODUCTION READY**
- **Radiation Monitoring**: 29 API endpoints for comprehensive radiation tracking
- **Device Management**: Complete device inventory with BLE MAC, firmware, calibration tracking
- **Personnel Management**: Unit hierarchy with UIC codes and personnel assignment
- **Dose Readings**: Real-time dose measurement with manual entry capability
- **NAVMED Forms**: Official Navy radiation health reporting (6470/1 implemented)
- **Real-time Dashboard**: WebSocket-based live monitoring with Chart.js visualization
- **Alert System**: Rate threshold alerts with validation and notification system

### Real-Time Architecture

The system implements a **multi-channel WebSocket architecture**:

#### WebSocket Channels
- `alerts` - Critical dose and device alerts
- `readings` - Live dose measurements
- `personnel` - Personnel status updates  
- `devices` - Device status changes
- `system` - System-wide notifications

#### WebSocket Implementation
- **Server**: `websocketService.js` handles connection management, broadcasting, and channel routing
- **Client**: Auto-reconnecting WebSocket clients with connection recovery
- **Database Integration**: `databaseListenerService.js` bridges PostgreSQL changes to WebSocket events

### Database Architecture

#### Key Database Patterns
- **PostgreSQL with extensive schema** (20+ tables)
- **Audit logging** for all critical operations
- **Foreign key constraints** with CASCADE deletes for data integrity
- **Indexed columns** for performance optimization
- **Real-time triggers** for WebSocket event generation

#### Critical Tables
- `radiation_dose_readings` - Core dose measurement data with `data_source` tracking
- `radiation_devices` - Device inventory with calibration and status tracking
- `radiation_personnel` - Personnel assignments and unit hierarchy
- `radiation_alerts` - Alert system with threshold validation
- `users` - Authentication with role-based access control

### Memory Management

The system includes **comprehensive memory optimization**:
- **Automatic monitoring** with configurable thresholds
- **Garbage collection** with `--expose-gc` flag
- **Connection pooling** for PostgreSQL connections
- **Memory cleanup modes**: standard, aggressive, and emergency
- **50%+ memory reduction** achieved with optimizations

## Development Guidelines

### API Development Patterns
- **RESTful APIs** with consistent response structures
- **Validation middleware** with comprehensive error handling
- **WebSocket integration** for real-time features
- **Admin-only endpoints** protected with role-based middleware
- **Audit logging** for all data modifications

### Frontend Development Patterns
- **Vue 3 Composition API** preferred over Options API
- **Router guards** for authentication and authorization
- **Component-based architecture** with reusable components
- **Dark theme** as primary UI theme
- **Responsive design** with Tailwind CSS utilities

### Database Development Guidelines
- **Use stored procedures** for complex business logic (as per cursor rules)
- **Never embed SQL directly in frontend** - always use backend APIs
- **Centralized logic** in PostgreSQL functions when appropriate
- **Proper indexing** on frequently queried columns
- **Foreign key constraints** with appropriate CASCADE behavior

### Testing Requirements
- **Use MCP servers for testing** after code fixes or new features (as per cursor rules)
- **Comprehensive test coverage** for validation scenarios
- **WebSocket testing** for real-time features
- **Database integration testing** for data integrity
- **Memory performance testing** for optimization validation

### Security Implementation
- **Role-based access control** with `requiresAuth` and `requiresAdmin` guards
- **Password hashing** with bcrypt
- **CORS configuration** for cross-origin requests
- **Input validation** with comprehensive sanitization
- **Audit logging** for security events

### WebSocket Development
- **Multi-channel architecture** for different data types
- **Automatic reconnection** with exponential backoff
- **Connection state management** with proper cleanup
- **Broadcast patterns** for system-wide notifications
- **Database change listeners** for real-time data synchronization

## Environment Configuration

### Required Environment Variables
```bash
DATABASE_URL=postgresql://username:password@host:port/database
BACKUP_ENCRYPTION_KEY=your_encryption_key_here
PORT=3005
NODE_ENV=development
```

### Development Ports
- **Frontend (Vite)**: 5173
- **Backend (Express)**: 3005
- **Database (PostgreSQL)**: 5432

### Proxy Configuration
- Frontend proxies `/api/*` requests to `http://127.0.0.1:3005`
- CORS configured for local development origins
- WebSocket connections handled via Socket.IO

## Memory Optimization

### Memory Management Commands
```powershell
npm run start:optimized                           # Start with memory optimization
node scripts/optimize-memory.js stats           # Monitor memory usage
node scripts/optimize-memory.js cleanup standard # Perform memory cleanup
```

### Performance Results
- **50%+ memory usage reduction** with garbage collection
- **Sub-200ms response times** for API endpoints
- **Optimized monitoring intervals** for reduced CPU overhead
- **Automatic cleanup** prevents memory leaks