# Monitoring and Alerting System

## Overview

The Radiation Health Module includes a comprehensive monitoring and alerting system that provides real-time visibility into system health, performance metrics, and critical alerts. This system ensures operational reliability and enables proactive issue resolution.

## Features

### 🔍 **Real-time Monitoring**
- **System Health Checks**: Continuous monitoring of system components
- **Database Performance**: Connection pool monitoring and query performance tracking
- **Memory & CPU Usage**: Resource utilization monitoring
- **API Response Times**: Endpoint performance tracking
- **Radiation Module Health**: Specific monitoring for radiation-related components

### 🚨 **Intelligent Alerting**
- **Multi-level Severity**: INFO, WARNING, CRITICAL, EMERGENCY
- **Smart Thresholds**: Configurable thresholds for different metrics
- **Escalation Rules**: Automated escalation for critical issues
- **Multi-channel Notifications**: Email, Slack, Console, Database logging

### 📊 **Performance Metrics**
- **Real-time Dashboards**: Live system status and metrics
- **Historical Data**: Performance trends and patterns
- **Customizable Views**: Tabbed interface for different monitoring aspects
- **Auto-refresh**: Automatic data updates every 30 seconds

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Monitoring    │
│   Dashboard     │◄──►│   Endpoints      │◄──►│   Service       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Alerting       │    │   Database      │
                       │   Service        │    │   Health        │
                       └──────────────────┘    │   Checks        │
                                               └─────────────────┘
```

## Components

### 1. **Monitoring Service** (`server/services/monitoringService.js`)
- **System Health Monitoring**: Overall system status tracking
- **Database Health Checks**: Connection pool and query performance
- **Resource Monitoring**: Memory, CPU, and system resources
- **Radiation Module Monitoring**: Specific health checks for radiation components

### 2. **Alerting Service** (`server/services/alertingService.js`)
- **Multi-channel Notifications**: Email, Slack, Console, Database
- **Alert Escalation**: Automated escalation for critical issues
- **Template Management**: Rich HTML email templates and Slack formatting
- **Delivery Tracking**: Notification delivery status and retry logic

### 3. **Monitoring Routes** (`server/routes/monitoring.js`)
- **Health Check Endpoints**: System status and health information
- **Metrics API**: Performance and system metrics
- **Alert Management**: Alert retrieval and acknowledgment
- **Configuration API**: Monitoring settings and thresholds

### 4. **Frontend Dashboard** (`src/components/MonitoringDashboard.vue`)
- **Real-time Status**: Live system health indicators
- **Tabbed Interface**: Organized monitoring views
- **Interactive Alerts**: Alert management and acknowledgment
- **Responsive Design**: Mobile-friendly monitoring interface

## API Endpoints

### Health Checks
- `GET /api/monitoring/health` - Comprehensive system health check
- `GET /api/monitoring/health/quick` - Lightweight health status
- `GET /api/monitoring/radiation/health` - Radiation module specific health

### Metrics & Status
- `GET /api/monitoring/status` - System status overview
- `GET /api/monitoring/metrics` - Detailed performance metrics
- `GET /api/monitoring/performance` - Performance-specific metrics
- `GET /api/monitoring/config` - Monitoring configuration

### Alert Management
- `GET /api/monitoring/alerts` - List active alerts
- `POST /api/monitoring/alerts/:id/acknowledge` - Acknowledge alert
- `POST /api/monitoring/test-alert` - Generate test alert

## Configuration

### Environment Variables

```bash
# Email Notifications
EMAIL_NOTIFICATIONS=true
ALERT_EMAIL_RECIPIENTS=admin@example.com,ops@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Slack Notifications
SLACK_NOTIFICATIONS=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_CHANNEL=#radiation-health-alerts
SLACK_USERNAME=Radiation Health Monitor

# Monitoring Configuration
LOG_LEVEL=info
APM_ENABLED=false
BACKUP_ENABLED=true
FILE_LOGGING=false

# Escalation Contacts
ESCALATION_CONTACTS=oncall@example.com,manager@example.com
ESCALATION_PHONE=+1-555-0123
ESCALATION_PAGER=+1-555-0124
```

### Configuration File (`server/config/monitoring.config.js`)
- **Thresholds**: Configurable alert thresholds for all metrics
- **Intervals**: Monitoring check frequencies
- **Notification Settings**: Channel-specific configurations
- **Escalation Rules**: Automated escalation logic
- **Environment Overrides**: Development vs. production settings

## Alert Types

### System Alerts
- **SYSTEM_HEALTH**: Overall system health status
- **DATABASE_HEALTH**: Database connection and performance issues
- **MEMORY_USAGE**: High memory utilization warnings
- **CPU_USAGE**: High CPU utilization warnings

### Radiation Module Alerts
- **RADIATION_ALERTS**: Too many critical radiation alerts
- **DEVICE_CALIBRATION**: Devices overdue for calibration
- **DEVICE_ACTIVITY**: High number of inactive devices
- **READINGS_ACTIVITY**: No recent dose readings

### Performance Alerts
- **DATABASE_PERFORMANCE**: Slow database response times
- **DATABASE_CONNECTIONS**: High connection pool usage
- **API_RESPONSE_TIME**: Slow API endpoint responses

## Dashboard Features

### 1. **System Status Overview**
- **Status Cards**: Visual indicators for system health, uptime, alerts
- **Color Coding**: Green (healthy), Yellow (degraded), Red (critical)
- **Real-time Updates**: Automatic refresh every 30 seconds

### 2. **System Health Tab**
- **Health Checks**: Detailed status of all system components
- **Performance Metrics**: Memory usage, database connections, response times
- **Component Status**: Individual health status for each monitored component

### 3. **Alerts Tab**
- **Active Alerts**: List of all unacknowledged alerts
- **Severity Levels**: Color-coded alert severity indicators
- **Alert Management**: Acknowledge and manage alerts
- **Detailed Information**: Expandable alert details and context

### 4. **Metrics Tab**
- **System Metrics**: Uptime, memory usage, database connections
- **Alert Metrics**: Total, active, and critical alert counts
- **Performance Data**: Response times, error counts, system health

### 5. **Configuration Tab**
- **Monitoring Intervals**: Health check frequencies and schedules
- **Alert Thresholds**: Configurable thresholds for all metrics
- **System Settings**: Current monitoring configuration

## Monitoring Intervals

| Component | Interval | Description |
|-----------|----------|-------------|
| System Health | 30 seconds | Overall system status check |
| Database Health | 1 minute | Database connection and performance |
| Performance Metrics | 5 minutes | Resource usage and performance data |
| Alert Cleanup | 1 hour | Cleanup old alerts and metrics |
| Radiation Module | 1 minute | Radiation-specific health checks |
| Device Status | 2 minutes | Device activity and calibration status |
| Personnel Status | 5 minutes | Personnel and assignment monitoring |

## Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|---------|
| Critical Alerts | 3 | 5 | Escalation |
| Memory Usage | 80% | 90% | Notification |
| Database Connections | 15 | 20 | Warning |
| API Response Time | 3s | 5s | Performance Alert |
| Device Calibration | 1 overdue | Any overdue | Maintenance Alert |
| Device Inactivity | 15% | 20% | Operational Alert |

## Notification Channels

### 1. **Email Notifications**
- **Rich HTML Templates**: Professional alert formatting
- **Priority Levels**: High priority for critical alerts
- **Recipient Management**: Configurable recipient lists
- **SMTP Support**: Flexible email server configuration

### 2. **Slack Notifications**
- **Rich Attachments**: Detailed alert information
- **Color Coding**: Severity-based color schemes
- **Channel Management**: Dedicated alert channels
- **Webhook Integration**: Easy Slack workspace integration

### 3. **Console Notifications**
- **Development Support**: Always enabled for debugging
- **Structured Logging**: Consistent log format
- **Severity Indicators**: Visual alert indicators
- **Real-time Display**: Immediate alert visibility

### 4. **Database Logging**
- **Audit Trail**: Complete alert history
- **Compliance**: Regulatory and audit requirements
- **Data Retention**: Configurable retention periods
- **Query Support**: Historical alert analysis

## Escalation Rules

### Level 1 (5 minutes)
- **Actions**: Console, Database, Email
- **Triggers**: Warnings and non-critical alerts
- **Response**: Automated notification

### Level 2 (15 minutes)
- **Actions**: Console, Database, Email, Slack
- **Triggers**: Critical alerts and repeated warnings
- **Response**: Enhanced notification and team awareness

### Level 3 (30 minutes)
- **Actions**: Console, Database, Email, Slack, Escalation
- **Triggers**: Emergency alerts and unresolved critical issues
- **Response**: On-call escalation and management notification

## Installation & Setup

### 1. **Install Dependencies**
```bash
npm install nodemailer
```

### 2. **Environment Configuration**
```bash
# Copy and configure environment variables
cp .env.example .env
# Edit .env with your monitoring configuration
```

### 3. **Database Setup**
```bash
# Ensure radiation_audit_log table exists
# Run database migrations if needed
```

### 4. **Start Monitoring**
```bash
# Start the server (monitoring starts automatically)
npm run start:server
```

### 5. **Access Dashboard**
```
http://localhost:5173/monitoring-dashboard
```

## Testing

### Test Alert Generation
```bash
# Generate test alert via API
curl -X POST http://localhost:3005/api/monitoring/test-alert \
  -H "Content-Type: application/json" \
  -d '{"type":"TEST","severity":"INFO","message":"Test alert"}'
```

### Health Check Testing
```bash
# Test system health
curl http://localhost:3005/api/monitoring/health

# Test quick health check
curl http://localhost:3005/api/monitoring/health/quick
```

### Metrics Testing
```bash
# Get system metrics
curl http://localhost:3005/api/monitoring/metrics

# Get performance data
curl http://localhost:3005/api/monitoring/performance
```

## Troubleshooting

### Common Issues

#### 1. **Monitoring Service Not Starting**
- Check database connection
- Verify environment variables
- Check console for error messages

#### 2. **Alerts Not Being Generated**
- Verify alert thresholds configuration
- Check monitoring service status
- Review database connectivity

#### 3. **Notifications Not Sending**
- Verify SMTP/Slack configuration
- Check network connectivity
- Review notification service logs

#### 4. **Dashboard Not Loading**
- Verify API endpoints are accessible
- Check browser console for errors
- Verify authentication status

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm run start:server
```

### Health Check Verification
```bash
# Check all monitoring endpoints
curl http://localhost:3005/api/monitoring/health
curl http://localhost:3005/api/monitoring/status
curl http://localhost:3005/api/monitoring/metrics
```

## Maintenance

### Regular Tasks
- **Daily**: Review active alerts and system status
- **Weekly**: Analyze performance trends and metrics
- **Monthly**: Review and adjust alert thresholds
- **Quarterly**: Update notification contacts and escalation rules

### Data Retention
- **Alerts**: 30 days (configurable)
- **Metrics**: 90 days (configurable)
- **Logs**: 180 days (configurable)
- **Backups**: 7 days (configurable)

### Performance Optimization
- **Database Indexing**: Optimize monitoring queries
- **Caching**: Implement metric caching for frequently accessed data
- **Aggregation**: Use time-based aggregation for historical data
- **Cleanup**: Regular cleanup of old monitoring data

## Security Considerations

### Authentication & Authorization
- **Role-based Access**: Admin and monitor roles
- **API Protection**: Rate limiting and request validation
- **Secure Communication**: HTTPS and secure SMTP

### Data Protection
- **Sensitive Data**: No sensitive information in alerts
- **Audit Logging**: Complete audit trail for all actions
- **Access Control**: Restricted access to monitoring data

### Compliance
- **HIPAA Compliance**: Healthcare data protection
- **Audit Requirements**: Complete monitoring audit trail
- **Data Retention**: Configurable retention policies

## Future Enhancements

### Planned Features
- **WebSocket Integration**: Real-time dashboard updates
- **Mobile App**: Native mobile monitoring application
- **Advanced Analytics**: Machine learning for anomaly detection
- **Integration APIs**: Third-party monitoring system integration

### Scalability Improvements
- **Distributed Monitoring**: Multi-server monitoring support
- **Load Balancing**: Monitoring service load balancing
- **High Availability**: Monitoring service redundancy
- **Performance Optimization**: Enhanced metric collection and storage

## Support & Documentation

### Additional Resources
- **API Documentation**: Complete endpoint documentation
- **Configuration Guide**: Detailed configuration options
- **Troubleshooting Guide**: Common issues and solutions
- **Performance Tuning**: Optimization recommendations

### Contact Information
- **Technical Support**: tech-support@example.com
- **Documentation**: docs.example.com/monitoring
- **Issue Tracking**: github.com/example/monitoring-issues

---

**Last Updated**: August 2025  
**Version**: 1.0.0  
**Status**: Production Ready
