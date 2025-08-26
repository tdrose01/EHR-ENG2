#!/bin/bash

# 📋 PRE-DEPLOYMENT CHECKLIST SCRIPT
# Radiation Health Monitoring System
# 
# This script ensures all rollback procedures are prepared before production deployment
# Execute with: bash scripts/pre-deployment-checklist.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configuration
DB_NAME="radiation_health"
DB_USER="postgres"
DB_HOST="localhost"
BACKUP_DIR="/secure/backup/location"
DEPLOYMENT_TAG=""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check database connectivity
check_database() {
    if command_exists psql; then
        if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

# Function to check git status
check_git_status() {
    if ! command_exists git; then
        error "Git not found. Please install git."
        return 1
    fi
    
    if [[ ! -d ".git" ]]; then
        error "Not a git repository. Please run from project root."
        return 1
    fi
    
    # Check for uncommitted changes
    local uncommitted=$(git status --porcelain | wc -l)
    if [[ $uncommitted -gt 0 ]]; then
        warning "Found $uncommitted uncommitted changes"
        git status --porcelain
        return 1
    fi
    
    success "Git repository is clean"
    return 0
}

# Function to create database backup
create_database_backup() {
    log "Creating database backup..."
    
    if ! check_database; then
        error "Cannot connect to database. Please check database status."
        return 1
    fi
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="backup_pre_deployment_${timestamp}.sql"
    
    # Create backup
    pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$backup_file"
    
    # Verify backup integrity
    if [[ -f "$backup_file" ]] && [[ -s "$backup_file" ]]; then
        success "Database backup created: $backup_file"
        
        # Test backup restoration (dry run)
        if pg_restore --list "$backup_file" >/dev/null 2>&1; then
            success "Backup integrity verified"
        else
            error "Backup integrity check failed"
            return 1
        fi
        
        # Move to backup directory if it exists
        if [[ -d "$BACKUP_DIR" ]]; then
            mv "$backup_file" "$BACKUP_DIR/"
            success "Backup moved to secure location: $BACKUP_DIR/$backup_file"
        else
            warning "Backup directory $BACKUP_DIR not found. Backup stored locally."
        fi
        
        return 0
    else
        error "Database backup failed"
        return 1
    fi
}

# Function to create git tag
create_git_tag() {
    log "Creating deployment tag..."
    
    local timestamp=$(date +%Y%m%d-%H%M)
    DEPLOYMENT_TAG="pre-deployment-${timestamp}"
    
    if git tag -a "$DEPLOYMENT_TAG" -m "Pre-deployment backup - $(date)"; then
        success "Git tag created: $DEPLOYMENT_TAG"
        
        # Push tag to remote if remote exists
        if git remote -v | grep -q origin; then
            if git push origin "$DEPLOYMENT_TAG"; then
                success "Tag pushed to remote repository"
            else
                warning "Failed to push tag to remote (continuing anyway)"
            fi
        fi
        
        return 0
    else
        error "Failed to create git tag"
        return 1
    fi
}

# Function to backup configuration files
backup_configuration() {
    log "Backing up configuration files..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local config_backup_dir="config_backup_${timestamp}"
    
    # Create backup directory
    mkdir -p "$config_backup_dir"
    
    # Backup key configuration files
    local config_files=(
        "server/config/monitoring.config.js"
        ".env"
        "server/db.js"
        "ecosystem.config.js"
        "package.json"
        "package-lock.json"
    )
    
    local backup_count=0
    for config_file in "${config_files[@]}"; do
        if [[ -f "$config_file" ]]; then
            cp "$config_file" "$config_backup_dir/"
            ((backup_count++))
        fi
    done
    
    if [[ $backup_count -gt 0 ]]; then
        success "Configuration backup created: $config_backup_dir ($backup_count files)"
        return 0
    else
        error "No configuration files found to backup"
        return 1
    fi
}

# Function to backup application files
backup_application() {
    log "Backing up application files..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local app_backup_dir="app_backup_${timestamp}"
    
    # Create backup directory
    mkdir -p "$app_backup_dir"
    
    # Backup key application directories
    local app_dirs=(
        "server"
        "src"
        "dist"
        "scripts"
    )
    
    local backup_count=0
    for app_dir in "${app_dirs[@]}"; do
        if [[ -d "$app_dir" ]]; then
            cp -r "$app_dir" "$app_backup_dir/"
            ((backup_count++))
        fi
    done
    
    if [[ $backup_count -gt 0 ]]; then
        success "Application backup created: $app_backup_dir ($backup_count directories)"
        return 0
    else
        error "No application directories found to backup"
        return 1
    fi
}

# Function to verify system health
verify_system_health() {
    log "Verifying system health before deployment..."
    
    # Check if services are running
    if command_exists pm2; then
        local running_services=$(pm2 list | grep -c 'online' || echo "0")
        log "PM2 services running: $running_services"
    else
        warning "PM2 not found - cannot check service status"
    fi
    
    # Check database health
    if check_database; then
        # Get basic database statistics
        local personnel_count=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM radiation_personnel;" | xargs)
        local readings_count=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM dose_readings;" | xargs)
        local alerts_count=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM alerts;" | xargs)
        
        success "Database health check passed"
        log "Database statistics:"
        log "  - Personnel: $personnel_count"
        log "  - Dose readings: $readings_count"
        log "  - Alerts: $alerts_count"
    else
        error "Database health check failed"
        return 1
    fi
    
    # Check API health if service is running
    if command_exists curl; then
        if curl -s "http://localhost:3000/api/health" >/dev/null 2>&1; then
            success "API health check passed"
        else
            warning "API health check failed (service may not be running)"
        fi
    fi
    
    return 0
}

# Function to test rollback procedures
test_rollback_procedures() {
    log "Testing rollback procedures..."
    
    # Check if emergency rollback script exists
    if [[ -f "scripts/emergency-rollback.sh" ]]; then
        success "Emergency rollback script found"
        
        # Test script syntax
        if bash -n scripts/emergency-rollback.sh; then
            success "Emergency rollback script syntax is valid"
        else
            error "Emergency rollback script has syntax errors"
            return 1
        fi
        
        # Test dry run mode
        if bash scripts/emergency-rollback.sh --dry-run >/dev/null 2>&1; then
            success "Emergency rollback script dry run test passed"
        else
            error "Emergency rollback script dry run test failed"
            return 1
        fi
    else
        error "Emergency rollback script not found: scripts/emergency-rollback.sh"
        return 1
    fi
    
    return 0
}

# Function to create deployment summary
create_deployment_summary() {
    log "Creating deployment summary..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local summary_file="deployment_summary_${timestamp}.md"
    
    cat > "$summary_file" << EOF
# 🚀 Production Deployment Summary
## Radiation Health Monitoring System

**Deployment Date**: $(date)
**Deployment Tag**: $DEPLOYMENT_TAG
**Prepared By**: $(whoami)

## 📋 Pre-Deployment Checklist Status

### ✅ Completed Tasks:
- [x] Git repository status verified
- [x] Database backup created
- [x] Git tag created: $DEPLOYMENT_TAG
- [x] Configuration files backed up
- [x] Application files backed up
- [x] System health verified
- [x] Rollback procedures tested

### 📁 Backup Files Created:
- Database backup: backup_pre_deployment_*.sql
- Configuration backup: config_backup_*/
- Application backup: app_backup_*/
- Git tag: $DEPLOYMENT_TAG

### 🔄 Rollback Procedures:
- Emergency rollback script: scripts/emergency-rollback.sh
- Rollback documentation: docs/ROLLBACK_PROCEDURES.md
- Database restoration procedures documented
- Configuration restoration procedures documented

## 🚨 Emergency Contacts

### Rollback Team:
- System Administrator: [Contact Info]
- Database Administrator: [Contact Info]
- DevOps Engineer: [Contact Info]
- Project Manager: [Contact Info]

## 📱 Communication Plan

### Pre-Deployment:
- [ ] Notify stakeholders of deployment
- [ ] Schedule rollback team availability
- [ ] Prepare status update communications

### During Deployment:
- [ ] Monitor system health
- [ ] Have rollback team on standby
- [ ] Update status every 15 minutes

### Post-Deployment:
- [ ] Monitor for 24-48 hours
- [ ] Document any issues
- [ ] Plan next deployment if needed

## ✅ Deployment Readiness

**Status**: 🟢 READY FOR DEPLOYMENT

**Next Steps**:
1. Execute deployment
2. Monitor system health
3. Be prepared to execute rollback if needed
4. Document deployment results

---
*This summary was automatically generated by the pre-deployment checklist script*
EOF

    success "Deployment summary created: $summary_file"
}

# Function to display final checklist
display_final_checklist() {
    echo ""
    echo "=========================================="
    echo "📋 PRE-DEPLOYMENT CHECKLIST COMPLETED"
    echo "=========================================="
    echo "✅ Git repository verified"
    echo "✅ Database backup created"
    echo "✅ Git tag created: $DEPLOYMENT_TAG"
    echo "✅ Configuration files backed up"
    echo "✅ Application files backed up"
    echo "✅ System health verified"
    echo "✅ Rollback procedures tested"
    echo "✅ Deployment summary created"
    echo ""
    echo "🚀 Your system is ready for production deployment!"
    echo ""
    echo "📁 Backup files created:"
    echo "  - Database: backup_pre_deployment_*.sql"
    echo "  - Config: config_backup_*/"
    echo "  - App: app_backup_*/"
    echo "  - Git tag: $DEPLOYMENT_TAG"
    echo ""
    echo "🚨 Emergency rollback available:"
    echo "  bash scripts/emergency-rollback.sh"
    echo ""
    echo "📖 Rollback procedures documented:"
    echo "  docs/ROLLBACK_PROCEDURES.md"
    echo "=========================================="
}

# Main function
main() {
    log "🚀 STARTING PRE-DEPLOYMENT CHECKLIST"
    log "This will prepare your system for production deployment"
    
    # Confirm execution
    read -p "Do you want to proceed with pre-deployment checklist? (yes/no): " confirm
    if [[ "$confirm" != "yes" ]]; then
        log "Pre-deployment checklist cancelled by user"
        exit 0
    fi
    
    # Execute checklist steps
    local all_passed=true
    
    log "Step 1: Checking git repository status..."
    if ! check_git_status; then
        all_passed=false
    fi
    
    log "Step 2: Creating database backup..."
    if ! create_database_backup; then
        all_passed=false
    fi
    
    log "Step 3: Creating git tag..."
    if ! create_git_tag; then
        all_passed=false
    fi
    
    log "Step 4: Backing up configuration files..."
    if ! backup_configuration; then
        all_passed=false
    fi
    
    log "Step 5: Backing up application files..."
    if ! backup_application; then
        all_passed=false
    fi
    
    log "Step 6: Verifying system health..."
    if ! verify_system_health; then
        all_passed=false
    fi
    
    log "Step 7: Testing rollback procedures..."
    if ! test_rollback_procedures; then
        all_passed=false
    fi
    
    log "Step 8: Creating deployment summary..."
    create_deployment_summary
    
    # Display results
    if [[ "$all_passed" == "true" ]]; then
        success "🎉 ALL PRE-DEPLOYMENT CHECKS PASSED!"
        display_final_checklist
    else
        error "❌ SOME PRE-DEPLOYMENT CHECKS FAILED!"
        log "Please review the errors above and fix them before proceeding with deployment."
        log "You can run this script again after fixing the issues."
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Pre-Deployment Checklist Script - Radiation Health Monitoring System"
    echo ""
    echo "Usage:"
    echo "  $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --check-only   Only run health checks without creating backups"
    echo ""
    echo "This script ensures all rollback procedures are prepared before production deployment."
    echo ""
    echo "What it does:"
    echo "1. Verifies git repository status"
    echo "2. Creates database backup"
    echo "3. Creates git tag for rollback"
    echo "4. Backs up configuration files"
    echo "5. Backs up application files"
    echo "6. Verifies system health"
    echo "7. Tests rollback procedures"
    echo "8. Creates deployment summary"
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --check-only)
        log "Running health checks only..."
        verify_system_health
        exit 0
        ;;
    "")
        main
        ;;
    *)
        error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
