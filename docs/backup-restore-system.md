# Database Backup & Restore System

## Overview

The Database Backup & Restore System provides secure, encrypted database backups for the EHR system. This system is accessible only to admin users and supports multiple storage locations with automatic encryption and compression.

## Features

- **🔒 Admin-Only Access**: Restricted to users with admin privileges
- **🔐 AES-256-CBC Encryption**: Military-grade encryption for all backup files
- **📦 Gzip Compression**: Reduces backup file size by up to 80%
- **📍 Flexible Storage**: Multiple backup location options
- **🔄 Full Restore**: Complete database restoration capability
- **📱 Dual Module Access**: Available in both EH and Radiation Health modules

## System Requirements

- **Node.js**: Version 18.0.0 or higher (required for modern crypto API)
- **PostgreSQL**: 12.0 or higher with `pg_dump` and `psql` utilities
- **Database Permissions**: Admin user must have `SELECT` and `USAGE` on all tables and sequences
- **Environment Variables**: `DATABASE_URL` and `BACKUP_ENCRYPTION_KEY` must be configured

## Access Points

### 1. Electronic Health (EH) Module
- Navigate to EH Modules Screen
- Look for purple "Database Backup & Restore" card
- Click to access backup management interface

### 2. Radiation Health (RH) Module
- Navigate to Radiation Dashboard or RH Module
- Look for yellow "Database Backup & Restore" card
- Click to access backup management interface

## Backup Locations

### Default Locations
- **Default**: System backup directory (`./backups`)
- **Desktop**: User's desktop folder (`~/Desktop/EHR-Backups`)
- **Documents**: User's documents folder (`~/Documents/EHR-Backups`)
- **Downloads**: User's downloads folder (`~/Downloads/EHR-Backups`)
- **Custom**: User-defined path with browse functionality

### Custom Path Support
- Users can specify any custom directory path
- System automatically creates directories if they don't exist
- Full path validation and error handling

## Usage Instructions

### Creating a Backup

1. **Access the backup interface** from EH or RH module
2. **Enter a description** for the backup (e.g., "Monthly backup - August 2025")
3. **Select backup location** from dropdown or enter custom path
4. **Click "Create Backup"**
5. **Wait for completion** - process includes:
   - Database dump via `pg_dump`
   - Gzip compression
   - AES-256-CBC encryption
   - File storage in selected location

### Restoring a Backup

1. **Select a backup** from the list
2. **Click "Restore Backup"**
3. **Confirm the action** (destructive operation)
4. **Wait for completion** - process includes:
   - File decryption
   - Decompression
   - Database restoration via `psql`

### Managing Backups

- **View all backups** across all locations
- **Filter by location** to find specific backups
- **Download backups** for external storage
- **Delete old backups** to free up space

## Technical Implementation

### Crypto Implementation
- **Algorithm**: AES-256-CBC
- **Key Management**: Uses `BACKUP_ENCRYPTION_KEY` environment variable
- **IV Generation**: Random 16-byte Initialization Vector for each backup
- **API**: Modern Node.js `crypto.createCipheriv()` and `crypto.createDecipheriv()`

### Compression
- **Format**: Gzip with maximum compression (level 9)
- **Process**: SQL dump → Gzip compression → AES encryption → File storage
- **Benefits**: 60-80% size reduction depending on data content

### Database Operations
- **Backup**: `pg_dump` with verbose output and full schema
- **Restore**: `psql` with transaction safety
- **Permissions**: Requires `SELECT` and `USAGE` on all tables and sequences

## API Endpoints

### Admin Routes (`/api/admin/backup/`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `POST` | `/create` | Create new backup | `description`, `location`, `customPath` |
| `GET` | `/list` | List all backups | None |
| `POST` | `/restore` | Restore from backup | `backupId` |
| `DELETE` | `/delete` | Delete backup | `backupId` |
| `GET` | `/download/:id` | Download backup file | `id` (URL param) |
| `GET` | `/locations` | Get available locations | None |

### Request Examples

#### Create Backup
```json
POST /api/admin/backup/create
{
  "description": "Monthly backup - August 2025",
  "location": "desktop",
  "customPath": null
}
```

#### Restore Backup
```json
POST /api/admin/backup/restore
{
  "backupId": "backup_2025-08-22T15-07-19-123Z_test_backup.sql.gz.enc"
}
```

## Security Features

### Access Control
- **Admin-Only**: All backup operations require admin privileges
- **Route Protection**: Middleware validation on all backup endpoints
- **Session Validation**: User authentication and role verification

### Data Protection
- **Encryption**: AES-256-CBC with unique IV per backup
- **Key Security**: Encryption key stored in environment variables
- **File Integrity**: Encrypted files cannot be read without proper key

### Audit Trail
- **Operation Logging**: All backup/restore operations logged
- **User Tracking**: Admin user identification for all operations
- **Timestamp Recording**: Precise timing of all operations

## Troubleshooting

### Common Issues

#### 1. Crypto API Errors
**Problem**: `"crypto.createCipher is not a function"`
**Solution**: Ensure Node.js version 18.0.0+ is installed
**Status**: ✅ **RESOLVED** - Updated to modern crypto API

#### 2. Database Permission Errors
**Problem**: `"permission denied for table/sequence"`
**Solution**: Run as PostgreSQL superuser:
```sql
-- Grant table permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO admin;

-- Grant sequence permissions  
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO admin;
```
**Status**: ✅ **RESOLVED** - Permissions properly configured

#### 3. Connection Refused Errors
**Problem**: `ERR_CONNECTION_REFUSED`
**Solution**: Ensure both servers are running:
```bash
# Backend server
npm run start:server  # Port 3005

# Frontend server  
npm run dev          # Port 5173
```
**Status**: ✅ **RESOLVED** - Both servers operational

#### 4. Port Already in Use
**Problem**: `EADDRINUSE: address already in use :::3005`
**Solution**: Kill conflicting processes:
```bash
npx kill-port 3005
npm run start:server
```
**Status**: ✅ **RESOLVED** - Port management implemented

### Error Resolution Steps

1. **Check Server Status**: Verify both frontend and backend are running
2. **Verify Permissions**: Ensure database user has required access
3. **Check Logs**: Review server console for detailed error messages
4. **Validate Environment**: Confirm `DATABASE_URL` and `BACKUP_ENCRYPTION_KEY` are set
5. **Test Connectivity**: Use test endpoints to verify API accessibility

## Performance Considerations

### Backup Performance
- **Compression**: Reduces storage requirements by 60-80%
- **Encryption**: Minimal overhead with modern crypto API
- **Parallel Processing**: Non-blocking backup operations
- **Progress Feedback**: Real-time status updates during operations

### Storage Optimization
- **Automatic Cleanup**: Remove old backups to free space
- **Location Management**: Distribute backups across multiple locations
- **Size Monitoring**: Track backup file sizes and growth trends

## Maintenance

### Regular Tasks
- **Monitor Storage**: Check available space in backup locations
- **Clean Old Backups**: Remove backups older than retention policy
- **Verify Integrity**: Test restore functionality periodically
- **Update Documentation**: Keep this guide current with system changes

### Backup Rotation
- **Daily**: Keep last 7 days
- **Weekly**: Keep last 4 weeks  
- **Monthly**: Keep last 12 months
- **Yearly**: Keep last 5 years

## Future Enhancements

### Planned Features
- **Incremental Backups**: Only backup changed data
- **Cloud Storage**: Integration with AWS S3, Google Cloud Storage
- **Automated Scheduling**: Cron-based backup automation
- **Backup Verification**: Checksum validation and integrity checks
- **Multi-Database Support**: Backup multiple database instances

### Technical Improvements
- **Streaming Encryption**: Process large databases without memory issues
- **Parallel Restore**: Faster restoration for large backups
- **Compression Algorithms**: Support for multiple compression formats
- **Encryption Options**: Configurable encryption algorithms

## Support

### Getting Help
- **Check this documentation** for common solutions
- **Review server logs** for detailed error information
- **Test with simple operations** to isolate issues
- **Verify system requirements** are met

### Contact Information
- **System Administrator**: For technical issues and configuration
- **Database Administrator**: For permission and connectivity issues
- **Development Team**: For feature requests and bug reports

---

**Last Updated**: August 22, 2025  
**Version**: 2.0  
**Status**: ✅ **FULLY OPERATIONAL** - All issues resolved
