# 🚨 **Production Deployment Rollback Procedures**
## Radiation Health Monitoring System

---

## 📋 **Overview**
This document outlines the complete rollback procedures for the Radiation Health Monitoring System production deployment. These procedures ensure rapid recovery in case of critical issues during or after deployment.

---

## 🚨 **Emergency Rollback Contacts**

### **Primary Rollback Team:**
- **System Administrator**: [Name] - [Phone] - [Email]
- **Database Administrator**: [Name] - [Phone] - [Email]
- **DevOps Engineer**: [Name] - [Phone] - [Email]
- **Project Manager**: [Name] - [Phone] - [Email]

### **Escalation Path:**
1. **Level 1**: Primary rollback team (0-15 minutes)
2. **Level 2**: Senior management (15-30 minutes)
3. **Level 3**: Executive leadership (30+ minutes)

---

## 🔄 **Rollback Scenarios & Triggers**

### **Immediate Rollback (< 5 minutes):**
- ❌ System completely down
- ❌ Database connection failures
- ❌ Critical security vulnerabilities
- ❌ Data corruption detected
- ❌ Radiation monitoring alerts not working

### **Fast Rollback (< 15 minutes):**
- ⚠️ Performance degradation (> 500ms response times)
- ⚠️ High error rates (> 5%)
- ⚠️ Memory usage > 95%
- ⚠️ Database connection pool exhaustion
- ⚠️ WebSocket connection failures

### **Planned Rollback (< 1 hour):**
- 🔶 Minor functionality issues
- 🔶 UI/UX problems
- 🔶 Non-critical feature failures
- 🔶 Monitoring system issues

---

## 🗄️ **Database Rollback Procedures**

### **Pre-Deployment Backup:**
```bash
# 1. Create full database backup
pg_dump -h localhost -U postgres -d radiation_health > backup_pre_deployment_$(date +%Y%m%d_%H%M%S).sql

# 2. Verify backup integrity
pg_restore --list backup_pre_deployment_*.sql

# 3. Store backup in secure location
cp backup_pre_deployment_*.sql /secure/backup/location/
```

### **Emergency Database Rollback:**
```bash
# 1. Stop application services
pm2 stop radiation-monitoring
pm2 stop csv-polling-service
pm2 stop data-retention-service

# 2. Drop current database (if necessary)
psql -h localhost -U postgres -c "DROP DATABASE radiation_health;"

# 3. Restore from backup
psql -h localhost -U postgres -c "CREATE DATABASE radiation_health;"
psql -h localhost -U postgres -d radiation_health < backup_pre_deployment_*.sql

# 4. Verify restoration
psql -h localhost -U postgres -d radiation_health -c "SELECT COUNT(*) FROM radiation_personnel;"
psql -h localhost -U postgres -d radiation_health -c "SELECT COUNT(*) FROM dose_readings;"
```

### **Schema Rollback (If Only Schema Changed):**
```sql
-- Rollback specific migrations if needed
-- Example: Rollback table changes
DROP TABLE IF EXISTS new_feature_table CASCADE;

-- Restore previous table structure
CREATE TABLE previous_table_structure (
    -- Previous schema definition
);
```

---

## 🖥️ **Application Rollback Procedures**

### **Pre-Deployment Preparation:**
```bash
# 1. Tag current version
git tag -a "pre-deployment-$(date +%Y%m%d-%H%M)" -m "Pre-deployment backup"

# 2. Create deployment package backup
cp -r dist/ dist_backup_$(date +%Y%m%d_%H%M%S)/
cp -r server/ server_backup_$(date +%Y%m%d_%H%M%S)/

# 3. Backup configuration files
cp server/config/monitoring.config.js server/config/monitoring.config.js.backup
cp .env .env.backup
```

### **Application Rollback:**
```bash
# 1. Stop current services
pm2 stop all

# 2. Revert to previous version
git checkout pre-deployment-$(date +%Y%m%d-%H%M)

# 3. Restore previous configuration
cp server/config/monitoring.config.js.backup server/config/monitoring.config.js
cp .env.backup .env

# 4. Restart services
pm2 start ecosystem.config.js

# 5. Verify services are running
pm2 status
pm2 logs --lines 50
```

### **Service-Specific Rollback:**
```bash
# Radiation monitoring service
pm2 restart radiation-monitoring

# CSV polling service
pm2 restart csv-polling-service

# Data retention service
pm2 restart data-retention-service

# WebSocket service
pm2 restart websocket-service
```

---

## ⚙️ **Configuration Rollback Procedures**

### **Environment Variables Rollback:**
```bash
# 1. Backup current environment
cp .env .env.current

# 2. Restore previous environment
cp .env.backup .env

# 3. Reload environment
source .env

# 4. Restart services to pick up new config
pm2 restart all
```

### **Database Configuration Rollback:**
```bash
# 1. Backup current database config
cp server/db.js server/db.js.current

# 2. Restore previous database config
cp server/db.js.backup server/db.js

# 3. Restart database service
pm2 restart radiation-monitoring
```

### **Monitoring Configuration Rollback:**
```bash
# 1. Backup current monitoring config
cp server/config/monitoring.config.js server/config/monitoring.config.js.current

# 2. Restore previous monitoring config
cp server/config/monitoring.config.js.backup server/config/monitoring.config.js

# 3. Restart monitoring services
pm2 restart data-retention-service
pm2 restart anomaly-detection-service
```

---

## 🔍 **Health Check & Validation Procedures**

### **Post-Rollback Health Checks:**
```bash
# 1. Check service status
pm2 status
pm2 logs --lines 100

# 2. Test API endpoints
curl -X GET http://localhost:3000/api/health
curl -X GET http://localhost:3000/api/radiation/personnel
curl -X GET http://localhost:3000/api/radiation/devices

# 3. Test database connectivity
psql -h localhost -U postgres -d radiation_health -c "SELECT version();"

# 4. Test WebSocket connection
# Use test script: scripts/test-websocket-connection.js

# 5. Verify data integrity
psql -h localhost -U postgres -d radiation_health -c "SELECT COUNT(*) FROM radiation_personnel;"
psql -h localhost -U postgres -d radiation_health -c "SELECT COUNT(*) FROM dose_readings;"
psql -h localhost -U postgres -d radiation_health -c "SELECT COUNT(*) FROM alerts;"
```

### **Performance Validation:**
```bash
# 1. Test response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/radiation/personnel"

# 2. Check memory usage
pm2 monit

# 3. Monitor database connections
psql -h localhost -U postgres -d radiation_health -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 📱 **Communication & Notification Procedures**

### **Immediate Notification (0-5 minutes):**
```bash
# 1. Alert rollback team
# Send SMS/email to primary contacts

# 2. Update status page
# Mark system as "UNDERGOING ROLLBACK"

# 3. Notify stakeholders
# Send immediate alert to project management
```

### **Status Updates (Every 15 minutes):**
- **Rollback Progress**: Current step and estimated completion
- **System Status**: Health check results
- **Next Steps**: What will happen next
- **Timeline**: Expected completion time

### **Post-Rollback Communication:**
- **Rollback Summary**: What was rolled back and why
- **System Status**: Current health and performance
- **Next Actions**: When deployment will be attempted again
- **Lessons Learned**: What went wrong and how to prevent it

---

## 📊 **Rollback Decision Matrix**

| Issue Type | Severity | Rollback Speed | Decision Maker |
|------------|----------|----------------|----------------|
| System Down | Critical | Immediate | System Admin |
| Data Corruption | Critical | Immediate | DBA + System Admin |
| Security Issue | Critical | Immediate | Security Team |
| Performance > 500ms | High | Fast | DevOps Engineer |
| High Error Rate | High | Fast | DevOps Engineer |
| UI Issues | Medium | Planned | Project Manager |
| Minor Features | Low | Planned | Project Manager |

---

## 🧪 **Testing Rollback Procedures**

### **Pre-Production Testing:**
```bash
# 1. Test in staging environment
# Deploy to staging, then test rollback procedures

# 2. Time rollback procedures
# Document actual time taken for each step

# 3. Validate data integrity
# Ensure no data loss during rollback

# 4. Test communication procedures
# Verify all notifications work correctly
```

### **Rollback Drills:**
- **Monthly**: Test rollback procedures in staging
- **Quarterly**: Full rollback simulation with team
- **Pre-Deployment**: Test rollback procedures 24h before deployment

---

## 📝 **Post-Rollback Analysis**

### **Immediate Actions (0-2 hours):**
1. **Document Incident**: What happened and when
2. **Assess Impact**: How many users affected, data loss?
3. **Stabilize System**: Ensure system is fully operational
4. **Communicate Status**: Update all stakeholders

### **Root Cause Analysis (2-24 hours):**
1. **Investigate Cause**: Why did the deployment fail?
2. **Identify Gaps**: What could have prevented this?
3. **Update Procedures**: Improve rollback procedures
4. **Plan Next Deployment**: When and how to try again

### **Lessons Learned (24-48 hours):**
1. **Document Findings**: Complete incident report
2. **Update Procedures**: Improve deployment and rollback processes
3. **Team Training**: Share lessons learned with team
4. **Process Improvement**: Update deployment checklist

---

## 🚀 **Quick Rollback Commands**

### **Emergency Rollback (Copy & Paste):**
```bash
# STOP ALL SERVICES
pm2 stop all

# ROLLBACK TO PREVIOUS VERSION
git checkout pre-deployment-$(date +%Y%m%d-%H%M)

# RESTORE CONFIGURATION
cp server/config/monitoring.config.js.backup server/config/monitoring.config.js
cp .env.backup .env

# RESTART SERVICES
pm2 start ecosystem.config.js

# VERIFY HEALTH
curl http://localhost:3000/api/health
```

### **Database Emergency Rollback:**
```bash
# STOP SERVICES
pm2 stop all

# RESTORE DATABASE
psql -h localhost -U postgres -c "DROP DATABASE radiation_health;"
psql -h localhost -U postgres -c "CREATE DATABASE radiation_health;"
psql -h localhost -U postgres -d radiation_health < backup_pre_deployment_*.sql

# RESTART SERVICES
pm2 start all
```

---

## 📞 **Emergency Contact Information**

### **24/7 Support:**
- **Emergency Hotline**: [Phone Number]
- **Emergency Email**: [Email Address]
- **Slack Channel**: #radiation-system-emergency

### **Escalation Schedule:**
- **Business Hours**: Primary team available
- **After Hours**: On-call engineer + escalation
- **Weekends**: On-call team + emergency contacts

---

## ✅ **Rollback Checklist**

### **Pre-Deployment:**
- [ ] Create database backup
- [ ] Tag git commit
- [ ] Backup configuration files
- [ ] Test rollback procedures
- [ ] Notify rollback team

### **During Rollback:**
- [ ] Stop all services
- [ ] Execute rollback procedures
- [ ] Verify system health
- [ ] Communicate status updates
- [ ] Document all actions taken

### **Post-Rollback:**
- [ ] Complete health checks
- [ ] Notify stakeholders
- [ ] Document incident
- [ ] Plan next deployment
- [ ] Update procedures

---

**Last Updated**: [Date]
**Version**: 1.0
**Next Review**: [Date + 30 days]
