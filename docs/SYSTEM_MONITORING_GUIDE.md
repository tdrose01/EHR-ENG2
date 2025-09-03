# System Monitoring Guide

## Overview

This guide provides comprehensive information about monitoring the EHR-ENG2 system, including performance metrics, health checks, and troubleshooting procedures for optimal system operation.

## Current System Status

### Memory Usage Monitoring
- **Current Range**: 80-92% during development
- **Threshold**: 80% (warning level)
- **Impact**: System remains operational but performance may degrade
- **Action Required**: Monitor and restart servers as needed

### System Health Metrics
- **Database Connections**: Stable (3-6 active connections)
- **Response Times**: <200ms for most operations
- **WebSocket Connections**: Active and functional
- **Overall Status**: Operational with monitoring recommendations

## Monitoring Components

### 1. Memory Usage Monitoring

#### Warning Signs
- Memory usage above 80%
- System health check failures
- Degraded response times
- High connection counts

#### Recommended Actions
1. **Immediate**: Monitor memory usage trends
2. **Short-term**: Restart development servers every 2-3 hours
3. **Long-term**: Implement memory optimization strategies

#### Memory Usage Patterns
```
[WARNING] MEMORY_USAGE: High memory usage detected {
  usage: '86.00%',
  threshold: '80%',
  timestamp: '2025-09-03T13:30:22.759Z'
}
```

### 2. System Health Checks

#### Health Check Components
- **Database Health**: Connection status and response times
- **Memory Health**: Usage percentage and thresholds
- **Service Health**: Individual service status
- **Overall Health**: Combined system status

#### Health Check Output
```json
{
  "status": "degraded",
  "checks": [
    {
      "status": "healthy",
      "responseTime": 105,
      "connections": 5,
      "timestamp": "2025-09-03T13:30:22.863Z"
    },
    {
      "status": "degraded",
      "usage": "86.00%",
      "details": {...}
    }
  ]
}
```

### 3. API Endpoint Monitoring

#### Key Endpoints to Monitor
- `GET /api/v1/health/status` - System health overview
- `GET /api/radiation/units` - Unit management operations
- `POST /api/admin/backup/create` - Backup operations
- `GET /api/realtime/status` - Real-time system status

#### Response Time Targets
- **Health Checks**: <100ms
- **Database Operations**: <200ms
- **File Operations**: <500ms
- **Complex Queries**: <1000ms

## Monitoring Procedures

### Daily Monitoring Checklist

#### System Health
- [ ] Check memory usage levels
- [ ] Verify database connection stability
- [ ] Monitor response times
- [ ] Review error logs

#### Service Status
- [ ] Backend server (port 3005) operational
- [ ] Frontend server (port 5173/5174) operational
- [ ] Database connection (port 5432) stable
- [ ] WebSocket connections active

#### Performance Metrics
- [ ] API response times within targets
- [ ] Memory usage below 90%
- [ ] Database connections stable
- [ ] No critical errors in logs

### Weekly Monitoring Tasks

#### System Optimization
- [ ] Review memory usage trends
- [ ] Analyze performance bottlenecks
- [ ] Check for memory leaks
- [ ] Optimize database queries

#### Maintenance Tasks
- [ ] Restart development servers
- [ ] Clear temporary files
- [ ] Review log files
- [ ] Update monitoring thresholds

## Troubleshooting Guide

### High Memory Usage

#### Symptoms
- Memory usage warnings in logs
- Slow response times
- System health check failures
- Degraded performance

#### Solutions
1. **Immediate**: Restart development servers
2. **Short-term**: Monitor memory usage patterns
3. **Long-term**: Implement memory optimization

#### Prevention
- Regular server restarts during development
- Monitor memory usage trends
- Implement memory management best practices

### Database Connection Issues

#### Symptoms
- Connection refused errors
- High connection counts
- Slow database queries
- Connection timeouts

#### Solutions
1. **Check connection pool settings**
2. **Monitor active connections**
3. **Optimize database queries**
4. **Restart database service if needed**

### Performance Degradation

#### Symptoms
- Response times above targets
- High CPU usage
- Slow page loads
- Timeout errors

#### Solutions
1. **Monitor system resources**
2. **Check for memory leaks**
3. **Optimize database queries**
4. **Restart services if needed**

## Monitoring Tools and Commands

### System Health Check
```bash
# Check system health
curl http://localhost:3005/api/v1/health/status

# Check real-time status
curl http://localhost:3005/api/realtime/status
```

### Memory Usage Monitoring
```bash
# Check Node.js process memory usage
ps aux | grep node

# Monitor system memory
free -h
```

### Database Monitoring
```bash
# Check database connections
psql -h localhost -p 5432 -U postgres -d ehr_eng2 -c "SELECT count(*) FROM pg_stat_activity;"

# Check database size
psql -h localhost -p 5432 -U postgres -d ehr_eng2 -c "SELECT pg_size_pretty(pg_database_size('ehr_eng2'));"
```

## Best Practices

### Development Environment
1. **Regular Restarts**: Restart servers every 2-3 hours
2. **Memory Monitoring**: Keep memory usage below 90%
3. **Log Review**: Check logs for warnings and errors
4. **Performance Tracking**: Monitor response times

### Production Environment
1. **Automated Monitoring**: Implement automated health checks
2. **Alerting**: Set up alerts for critical thresholds
3. **Logging**: Comprehensive logging and monitoring
4. **Backup**: Regular system backups and recovery testing

## Alert Thresholds

### Warning Levels
- **Memory Usage**: 80% (warning)
- **Response Time**: 200ms (warning)
- **Database Connections**: 10+ (warning)
- **Error Rate**: 5% (warning)

### Critical Levels
- **Memory Usage**: 95% (critical)
- **Response Time**: 1000ms (critical)
- **Database Connections**: 20+ (critical)
- **Error Rate**: 10% (critical)

## Maintenance Schedule

### Daily
- Monitor system health
- Check memory usage
- Review error logs
- Verify service status

### Weekly
- Restart development servers
- Review performance metrics
- Check for memory leaks
- Update monitoring thresholds

### Monthly
- Comprehensive system review
- Performance optimization
- Security updates
- Documentation updates

---

**Last Updated**: September 3, 2025  
**Version**: 2.1.0  
**Status**: Active Monitoring ✅
