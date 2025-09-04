# Changelog

All notable changes to the EHR ENG2 project will be documented in this file.

## [2.2.0] - 2025-01-27

### Added
- **Device Edit Functionality**: Complete device editing capabilities for Radiation Health module
  - Full device editing form with all device properties (model, serial, BLE MAC, firmware, calibration due, RF policy)
  - Device model selection dropdown with vendor and model information
  - Form validation with required field indicators
  - Create and edit modes with proper form population
  - Unsaved changes warning when closing modal
  - API integration with existing backend endpoints

- **Device Readings Modal**: Comprehensive device readings viewer with advanced filtering
  - Device information card showing firmware, calibration due, RF policy, and total readings
  - Advanced filtering by date range and personnel
  - Paginated table displaying readings with dose rates, cumulative doses, and status indicators
  - Status color coding (High/Medium/Normal based on dose rates)
  - Real-time data fetching from the API
  - Responsive design with proper dark theme styling

### Fixed
- **Modal Visibility Issue**: Fixed DeviceEditModal appearing automatically and blocking interface
  - Added proper `v-if` conditions to control modal visibility
  - DeviceEditModal now only renders when `showDeviceEditModal` is true
  - DeviceReadingsModal updated to use consistent `v-if` condition
  - Interface no longer blocked by automatically appearing modals

### Technical Changes
- **New Components**:
  - `src/components/DeviceEditModal.vue`: Modal component for device CRUD operations
  - `src/components/DeviceReadingsModal.vue`: Modal component for viewing device readings
- **Updated Components**:
  - `src/views/RadiationDashboard.vue`: Added device edit and readings functionality
  - Enhanced device buttons with proper click handlers and tooltips
  - Added modal state management and control methods
  - Integrated device model fetching on component initialization
- **Backend Integration**:
  - Full integration with existing device CRUD endpoints (`/api/radiation/devices`)
  - Device model fetching from `/api/radiation/device-models`
  - Device readings fetching from `/api/radiation/readings`
- **User Experience Enhancements**:
  - Tooltips on device buttons showing device serial numbers
  - Loading states with spinners
  - Error handling with console logging (ready for toast notifications)
  - Form validation with required field indicators
  - Responsive design that works on different screen sizes
  - Consistent styling with existing dark theme

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
