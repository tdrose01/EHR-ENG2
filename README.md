# EHR-ENG2 System

A comprehensive Electronic Health Record system designed for military and healthcare environments, featuring multiple specialized modules and robust data management capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- PostgreSQL 12.0 or higher
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd EHR-ENG2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start the development servers
npm run dev          # Frontend (Vite) - Port 5173
npm run start:server # Backend (Express) - Port 3005
```

## 🏥 System Modules

### Electronic Health (EH) Module
- **Patient Management**: Comprehensive patient records and demographics
- **Medical History**: Detailed medical history tracking
- **Treatment Plans**: Structured treatment and care planning
- **Environmental Dashboard**: Advanced environmental data visualization and exposure tracking
- **System Monitoring**: Real-time system health and performance metrics
- **Database Backup & Restore**: Admin-only secure backup system
- **User Management**: Admin-only user and role management system

### Radiation Health (RH) Module  
- **Radiation Monitoring**: Personnel exposure tracking
- **Device Management**: Radiation device inventory and calibration
- **Dose Readings**: Real-time dose measurement logging
- **Real-Time Monitoring**: Live WebSocket-based dashboard with live updates
- **Database Backup & Restore**: Admin-only secure backup system

#### 🆕 **Real-Time Monitoring Features**
- **Live Dashboard**: Real-time radiation monitoring dashboard
- **WebSocket Integration**: Instant updates via WebSocket connections
- **Live Charts**: Chart.js integration for real-time data visualization
- **Push Notifications**: Browser notifications for critical alerts
- **Auto-Reconnection**: Robust connection management with automatic recovery
- **Multi-Channel Support**: Alerts, readings, personnel, and device updates

### Administrative Features
- **User Management**: Role-based access control with admin interface
- **Audit Logging**: Comprehensive system activity tracking
- **Data Export**: Secure data export capabilities
- **System Monitoring**: Performance and health monitoring
- **Database Backup & Restore**: Secure encrypted backup system

## 🔐 Database Backup & Restore System

The system includes a **fully operational** backup and restore system with the following features:

### ✅ **Current Status: FULLY OPERATIONAL**
- **Encryption**: AES-256-CBC military-grade encryption
- **Compression**: Gzip compression (60-80% size reduction)
- **Multiple Locations**: Default, Desktop, Documents, Downloads, Custom paths
- **Admin Access**: Restricted to admin users only
- **Dual Module Access**: Available in both EH and RH modules

### 🔧 **Recent Fixes Applied**
- ✅ **Crypto API**: Updated to modern Node.js crypto standards
- ✅ **Database Permissions**: Full table and sequence access granted
- ✅ **Server Configuration**: Both frontend and backend operational
- ✅ **Route Protection**: Admin middleware properly configured

### 📍 **Access Points**
- **EH Module**: Purple "Database Backup & Restore" card (dark theme styled)
- **RH Module**: Yellow "Database Backup & Restore" card (dark theme styled)
- **Direct URL**: `/admin/backup-restore` (admin access required)

## 🛠️ Development

### Project Structure
```
EHR-ENG2/
├── frontend/          # Vue.js frontend application
├── server/            # Node.js/Express backend
├── db/               # Database schemas and migrations
├── docs/             # System documentation
├── tests/            # Test suites and test data
└── scripts/          # Utility and deployment scripts
```

### Available Scripts
```bash
npm run dev              # Start frontend development server
npm run start:server     # Start backend server
npm run build            # Build frontend for production
npm run test             # Run test suite
npm run lint             # Lint code for style consistency
```

### Environment Variables
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Backup System
BACKUP_ENCRYPTION_KEY=your_encryption_key_here

# Server Configuration
PORT=3005
NODE_ENV=development
```

## 📚 Documentation

- **[Backup & Restore System](docs/backup-restore-system.md)** - Complete backup system documentation
- **[Monitoring & Alerting System](docs/monitoring-system.md)** - Comprehensive system monitoring and alerting
- **[UI/UX Improvements](docs/UI_UX_IMPROVEMENTS.md)** - Design system standards and UI consistency updates
- **[API Documentation](docs/api/)**: Backend API endpoints and usage
- **[User Guides](docs/user/)**: End-user documentation and tutorials
- **[Security Documentation](docs/security/)**: Security features and compliance

## 🔒 Security Features

- **Role-Based Access Control**: Granular permission management
- **Data Encryption**: AES-256 encryption for sensitive data
- **Audit Logging**: Comprehensive activity tracking
- **Secure Authentication**: Multi-factor authentication support
- **HIPAA Compliance**: Healthcare data protection standards

## 🧪 Testing

The system includes comprehensive testing capabilities:
- **Unit Tests**: Individual component testing
- **Integration Tests**: Module interaction testing  
- **End-to-End Tests**: Complete workflow validation
- **Security Tests**: Vulnerability and penetration testing

## 🚀 Deployment

### Production Deployment
```bash
# Build frontend
npm run build

# Start production server
npm run start:prod

# Environment setup
NODE_ENV=production
DATABASE_URL=your_production_db_url
```

### Docker Deployment
```bash
# Build and run with Docker
docker build -t ehr-eng2 .
docker run -p 3005:3005 ehr-eng2
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For technical support or questions:
- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: Create an issue in the repository
- **Security**: Report security issues to the development team

---

**Last Updated**: August 22, 2025  
**Version**: 2.0.1  
**Status**: ✅ **PRODUCTION READY** - All systems operational with enhanced UI consistency
