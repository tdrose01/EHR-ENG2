#!/bin/bash

# 🚨 EMERGENCY ROLLBACK SCRIPT
# Radiation Health Monitoring System
# 
# This script provides quick rollback procedures for production emergencies
# Execute with: bash scripts/emergency-rollback.sh

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
BACKUP_DIR="/secure/backup/location"
DB_NAME="radiation_health"
DB_USER="postgres"
DB_HOST="localhost"
APP_PORT="3000"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
   exit 1
fi

# Function to check if service is running
check_service() {
    local service_name=$1
    if pm2 list | grep -q "$service_name"; then
        return 0
    else
        return 1
    fi
}

# Function to check database connectivity
check_database() {
    if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to create backup before rollback
create_emergency_backup() {
    log "Creating emergency backup before rollback..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="emergency_backup_${timestamp}.sql"
    
    if check_database; then
        pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$backup_file"
        success "Emergency backup created: $backup_file"
    else
        warning "Database not accessible, skipping backup"
    fi
}

# Function to stop all services
stop_services() {
    log "Stopping all PM2 services..."
    
    if command -v pm2 >/dev/null 2>&1; then
        pm2 stop all
        success "All services stopped"
    else
        error "PM2 not found. Please install PM2 or stop services manually."
        exit 1
    fi
}

# Function to rollback application
rollback_application() {
    log "Rolling back application to previous version..."
    
    # Check if git is available
    if ! command -v git >/dev/null 2>&1; then
        error "Git not found. Please rollback manually."
        return 1
    fi
    
    # Get the most recent pre-deployment tag
    local latest_tag=$(git tag --list "pre-deployment-*" | sort -V | tail -n 1)
    
    if [[ -z "$latest_tag" ]]; then
        warning "No pre-deployment tag found. Rolling back to last commit."
        git checkout HEAD~1
    else
        log "Rolling back to tag: $latest_tag"
        git checkout "$latest_tag"
    fi
    
    success "Application rolled back"
}

# Function to restore configuration
restore_configuration() {
    log "Restoring configuration files..."
    
    # Restore monitoring config if backup exists
    if [[ -f "server/config/monitoring.config.js.backup" ]]; then
        cp server/config/monitoring.config.js.backup server/config/monitoring.config.js
        success "Monitoring configuration restored"
    else
        warning "No monitoring config backup found"
    fi
    
    # Restore environment file if backup exists
    if [[ -f ".env.backup" ]]; then
        cp .env.backup .env
        success "Environment configuration restored"
    else
        warning "No environment backup found"
    fi
}

# Function to rollback database
rollback_database() {
    log "Checking if database rollback is needed..."
    
    # Look for the most recent backup file
    local latest_backup=$(ls -t backup_pre_deployment_*.sql 2>/dev/null | head -n 1)
    
    if [[ -n "$latest_backup" ]]; then
        warning "Found backup file: $latest_backup"
        read -p "Do you want to rollback the database? This will DESTROY current data! (yes/no): " confirm
        
        if [[ "$confirm" == "yes" ]]; then
            log "Rolling back database from backup: $latest_backup"
            
            # Drop and recreate database
            psql -h "$DB_HOST" -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;"
            psql -h "$DB_HOST" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"
            
            # Restore from backup
            psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" < "$latest_backup"
            
            success "Database rolled back successfully"
        else
            log "Database rollback skipped"
        fi
    else
        log "No database backup found, skipping database rollback"
    fi
}

# Function to restart services
restart_services() {
    log "Restarting services..."
    
    # Check if ecosystem file exists
    if [[ -f "ecosystem.config.js" ]]; then
        pm2 start ecosystem.config.js
    else
        # Start services individually
        pm2 start server/index.js --name "radiation-monitoring"
        pm2 start server/csv_polling_service/main.py --name "csv-polling-service" --interpreter python3
        pm2 start server/data_retention_service/main.py --name "data-retention-service" --interpreter python3
    fi
    
    success "Services restarted"
}

# Function to verify system health
verify_health() {
    log "Verifying system health..."
    
    # Wait for services to start
    sleep 5
    
    # Check service status
    log "Service status:"
    pm2 status
    
    # Check if main service is responding
    local max_attempts=10
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -s "http://localhost:$APP_PORT/api/health" >/dev/null 2>&1; then
            success "Main service is responding"
            break
        else
            warning "Attempt $attempt: Service not responding, waiting..."
            sleep 5
            ((attempt++))
        fi
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        error "Service health check failed after $max_attempts attempts"
        return 1
    fi
    
    # Check database connectivity
    if check_database; then
        success "Database connectivity verified"
    else
        error "Database connectivity failed"
        return 1
    fi
    
    # Basic data verification
    log "Verifying data integrity..."
    local personnel_count=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM radiation_personnel;" | xargs)
    local readings_count=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM dose_readings;" | xargs)
    
    log "Personnel count: $personnel_count"
    log "Dose readings count: $readings_count"
    
    success "System health verification completed"
}

# Function to display rollback summary
show_summary() {
    echo ""
    echo "=========================================="
    echo "🚨 ROLLBACK SUMMARY"
    echo "=========================================="
    echo "Timestamp: $(date)"
    echo "Services Status: $(pm2 status --no-daemon | grep -c 'online') services online"
    echo "Database: $DB_NAME"
    echo "Application Port: $APP_PORT"
    echo ""
    echo "Next Steps:"
    echo "1. Monitor system performance"
    echo "2. Verify all functionality"
    echo "3. Document incident details"
    echo "4. Plan next deployment attempt"
    echo "=========================================="
}

# Main rollback function
main_rollback() {
    log "🚨 STARTING EMERGENCY ROLLBACK PROCEDURE"
    log "This will rollback the system to the previous working state"
    
    # Confirm rollback
    read -p "Are you sure you want to proceed with emergency rollback? (yes/no): " confirm
    if [[ "$confirm" != "yes" ]]; then
        log "Rollback cancelled by user"
        exit 0
    fi
    
    # Execute rollback steps
    create_emergency_backup
    stop_services
    rollback_application
    restore_configuration
    rollback_database
    restart_services
    verify_health
    
    if [[ $? -eq 0 ]]; then
        success "🎉 ROLLBACK COMPLETED SUCCESSFULLY"
        show_summary
    else
        error "❌ ROLLBACK FAILED - Manual intervention required"
        log "Please check the logs and contact the rollback team"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Emergency Rollback Script - Radiation Health Monitoring System"
    echo ""
    echo "Usage:"
    echo "  $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --dry-run      Show what would be done without executing"
    echo "  --verify       Only verify system health"
    echo ""
    echo "Examples:"
    echo "  $0              Execute full rollback"
    echo "  $0 --verify     Check system health only"
    echo "  $0 --dry-run    Show rollback plan"
}

# Function for dry run
dry_run() {
    log "🔍 DRY RUN MODE - No changes will be made"
    
    echo "Rollback Plan:"
    echo "1. Create emergency backup"
    echo "2. Stop all PM2 services"
    echo "3. Rollback application to previous version"
    echo "4. Restore configuration files"
    echo "5. Rollback database (if backup exists)"
    echo "6. Restart services"
    echo "7. Verify system health"
    
    echo ""
    echo "Current Status:"
    echo "- PM2 services: $(pm2 list | grep -c 'online') online"
    echo "- Database accessible: $(check_database && echo 'Yes' || echo 'No')"
    echo "- Git repository: $(git status --porcelain | wc -l) changes"
    
    log "Dry run completed"
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --dry-run)
        dry_run
        exit 0
        ;;
    --verify)
        verify_health
        exit 0
        ;;
    "")
        main_rollback
        ;;
    *)
        error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
