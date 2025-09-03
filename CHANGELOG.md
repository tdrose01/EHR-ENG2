# Changelog

All notable changes to the EHR ENG2 project will be documented in this file.

## [2.1.0] - 2025-09-03

### Added
- **Unit Management System**: Complete organizational unit hierarchy management for Radiation Health module
  - Full CRUD operations for organizational units with UIC codes
  - Hierarchical parent-child relationships between units
  - Personnel assignment tracking and visualization
  - Interactive unit hierarchy tree display
  - Safety checks for unit deletion (prevents deletion of units with children or assigned personnel)
  - Real-time hierarchy preview in unit creation/editing forms
  - Integration with existing personnel management system

### Fixed
- **Backup Creation Error**: Fixed "Invalid DATABASE_URL format" error in backup service
  - Enhanced `parseDatabaseUrl()` method to support both password and non-password database connection formats
  - Updated `pg_dump` and `psql` command generation to handle passwordless connections
  - Added support for default PostgreSQL configuration format: `postgresql://postgres@localhost:5432/ehr_eng2`
  - Backup creation now works with all DATABASE_URL formats including default configuration
- **Vue Component Error**: Fixed "Cannot access 'resetForm' before initialization" error in UnitManagementModal
  - Moved function definition before watchers that use it
  - Eliminated Vue warnings and improved component stability

### Technical Changes
- **New Components**:
  - `src/components/UnitManagementModal.vue`: Modal component for unit CRUD operations
  - `src/components/UnitHierarchyNode.vue`: Recursive component for hierarchy visualization
- **Updated Components**:
  - `src/views/RadiationDashboard.vue`: Added Units tab with complete unit management interface
- **Backend Enhancements**:
  - `server/routes/radiation.js`: Added complete CRUD endpoints for unit management
  - Enhanced GET `/api/radiation/units` to return full unit data including UIC and parent relationships
  - Added DELETE `/api/radiation/units/:id` with safety checks for dependencies
- **Database Integration**:
  - Full integration with existing `radiation_units` table
  - Support for hierarchical relationships via `parent_uic` field
  - Personnel count calculations and unit assignment tracking
- Modified `server/services/backupService.js`:
  - Enhanced regex pattern matching for database URLs
  - Added fallback parsing for passwordless connections
  - Updated command argument generation for `pg_dump` and `psql`
  - Improved error handling and validation

### Documentation
- **New Documentation**:
  - `docs/UNIT_MANAGEMENT_SYSTEM.md`: Comprehensive documentation for the unit management system
  - Complete usage guide, technical implementation details, and troubleshooting information
- **Updated Documentation**:
  - `README.md`: Added unit management feature to Radiation Health module description
  - `docs/backup-restore-system.md`: Updated with DATABASE_URL format support information
  - `TROUBLESHOOTING_FIXED.md`: Added new fix details and testing results
  - Added technical implementation details and code examples

### Testing
- **Unit Management System**:
  - Successfully tested all CRUD operations (Create, Read, Update, Delete)
  - Verified hierarchical relationship creation and validation
  - Tested safety checks for unit deletion with dependencies
  - Confirmed personnel count calculations and unit assignment tracking
  - Validated frontend-backend integration and real-time updates
- **Backup System**:
  - Successfully tested backup creation with default DATABASE_URL format
  - Verified backup file generation: `backup_2025-09-03T13-00-07-711Z_test_backup_with_fixed_service.sql.gz.enc`
  - Confirmed system compatibility with both password and non-password database configurations
- **System Integration**:
  - Verified frontend and backend server connectivity
  - Confirmed API endpoint functionality and response times
  - Tested Vue component error resolution and stability

## [2.0.0] - 2025-08-22

### Added
- Complete backup and restore system implementation
- AES-256-CBC encryption for backup files
- Gzip compression for backup files
- Multiple backup storage locations
- Admin-only access control
- Real-time monitoring and health checks

### Fixed
- Crypto API compatibility issues (Node.js 17+)
- Database permission errors
- Server connection and port management issues
- Route and middleware configuration problems
- Frontend component and navigation issues

### Security
- Military-grade encryption for all backup files
- Admin-only access to backup functionality
- Secure file storage with multiple location options

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/) format.
