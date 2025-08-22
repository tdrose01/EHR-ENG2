const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

class BackupService {
  constructor() {
    this.backupDir = path.join(__dirname, '..', '..', 'backups');
    // Initialize backup directory synchronously to avoid async issues
    this.initBackupDirectory();
  }

  initBackupDirectory() {
    // Use synchronous version for constructor
    const fsSync = require('fs');
    try {
      fsSync.accessSync(this.backupDir);
    } catch {
      fsSync.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  // Generate a secure encryption key from environment variables
  getEncryptionKey() {
    const key = process.env.BACKUP_ENCRYPTION_KEY || process.env.DATABASE_URL;
    if (!key) {
      throw new Error('BACKUP_ENCRYPTION_KEY or DATABASE_URL environment variable is required');
    }
    // Use SHA-256 to create a consistent 32-byte key
    return crypto.createHash('sha256').update(key).digest();
  }

  // Parse database connection string to extract connection details
  parseDatabaseUrl() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Parse postgresql://username:password@host:port/database or postgres://username:password@host:port/database
    const match = dbUrl.match(/postgres(ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!match) {
      throw new Error('Invalid DATABASE_URL format');
    }

    return {
      username: match[2],
      password: match[3],
      host: match[4],
      port: match[5],
      database: match[6]
    };
  }

  async createBackup(description = '', location = 'default', customPath = null) {
    try {
      const dbConfig = this.parseDatabaseUrl();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup_${timestamp}_${description.replace(/\s+/g, '_')}.sql.gz.enc`;
      
      // Determine backup directory based on location preference
      let backupDir = this.backupDir;
      
      if (location === 'custom' && customPath) {
        backupDir = customPath;
      } else if (location !== 'default') {
        // Handle special locations (desktop, documents, downloads)
        const os = require('os');
        const homeDir = os.homedir();
        
        switch (location) {
          case 'desktop':
            backupDir = path.join(homeDir, 'Desktop', 'EHR-Backups');
            break;
          case 'documents':
            backupDir = path.join(homeDir, 'Documents', 'EHR-Backups');
            break;
          case 'downloads':
            backupDir = path.join(homeDir, 'Downloads', 'EHR-Backups');
            break;
          default:
            backupDir = this.backupDir;
        }
      }
      
      // Ensure the backup directory exists
      try {
        await fs.access(backupDir);
      } catch {
        await fs.mkdir(backupDir, { recursive: true });
      }
      
      const filepath = path.join(backupDir, filename);

      // Create the backup using pg_dump
      const dumpProcess = spawn('pg_dump', [
        '-h', dbConfig.host,
        '-p', dbConfig.port,
        '-U', dbConfig.username,
        '-d', dbConfig.database,
        '--no-password', // We'll use environment variable
        '--verbose',
        '--clean',
        '--if-exists',
        '--create'
      ], {
        env: { ...process.env, PGPASSWORD: dbConfig.password },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let dumpData = '';
      let errorData = '';

      dumpProcess.stdout.on('data', (data) => {
        dumpData += data.toString();
      });

      dumpProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      return new Promise((resolve, reject) => {
        dumpProcess.on('close', async (code) => {
          if (code !== 0) {
            reject(new Error(`pg_dump failed with code ${code}: ${errorData}`));
            return;
          }

          try {
            // Compress the dump
            const compressedData = await gzip(dumpData, { level: 9 });

            // Encrypt the compressed data using modern crypto API
            const key = this.getEncryptionKey();
            const iv = crypto.randomBytes(16);
            
            // Use createCipheriv instead of deprecated createCipher
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            cipher.setAutoPadding(true);

            let encryptedData = cipher.update(compressedData);
            encryptedData = Buffer.concat([encryptedData, cipher.final()]);

            // Combine IV and encrypted data
            const finalData = Buffer.concat([iv, encryptedData]);

            // Write to file
            await fs.writeFile(filepath, finalData);

            // Create backup metadata
            const metadata = {
              filename,
              description,
              timestamp,
              size: finalData.length,
              database: dbConfig.database,
              version: '1.0'
            };

            resolve({
              success: true,
              filepath,
              filename,
              metadata
            });
          } catch (error) {
            reject(new Error(`Backup processing failed: ${error.message}`));
          }
        });

        dumpProcess.on('error', (error) => {
          reject(new Error(`pg_dump process error: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`Backup creation failed: ${error.message}`);
    }
  }

  async restoreBackup(id) {
    try {
      const backup = await this.getBackupById(id);
      if (!backup) {
        throw new Error('Backup not found');
      }
      
      return await this.restoreBackupFromFile(backup.filename);
    } catch (error) {
      throw new Error(`Failed to restore backup: ${error.message}`);
    }
  }

  async restoreBackupFromFile(filename) {
    try {
      const filepath = path.join(this.backupDir, filename);
      
      // Check if file exists
      await fs.access(filepath);
      
      // Read encrypted file
      const encryptedData = await fs.readFile(filepath);
      
      // Extract IV and encrypted data
      const iv = encryptedData.slice(0, 16);
      const encryptedContent = encryptedData.slice(16);
      
      // Decrypt using modern crypto API
      const key = this.getEncryptionKey();
      
      // Use createDecipheriv instead of deprecated createDecipher
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      decipher.setAutoPadding(true);
      
      let decryptedData = decipher.update(encryptedContent);
      decryptedData = Buffer.concat([decryptedData, decipher.final()]);
      
      // Decompress
      const decompressedData = await gunzip(decryptedData);
      
      // Parse database connection
      const dbConfig = this.parseDatabaseUrl();
      
      // Restore using psql
      const restoreProcess = spawn('psql', [
        '-h', dbConfig.host,
        '-p', dbConfig.port,
        '-U', dbConfig.username,
        '-d', dbConfig.database,
        '--no-password',
        '--verbose'
      ], {
        env: { ...process.env, PGPASSWORD: dbConfig.password },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let errorData = '';

      restoreProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      return new Promise((resolve, reject) => {
        restoreProcess.stdin.write(decompressedData);
        restoreProcess.stdin.end();

        restoreProcess.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`Restore failed with code ${code}: ${errorData}`));
            return;
          }
          resolve({
            success: true,
            message: 'Database restored successfully'
          });
        });

        restoreProcess.on('error', (error) => {
          reject(new Error(`Restore process error: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`Restore failed: ${error.message}`);
    }
  }

  // Get available backup locations
  getAvailableBackupLocations() {
    const os = require('os');
    const homeDir = os.homedir();
    
    return {
      default: {
        path: this.backupDir,
        name: 'Default Location',
        description: 'System backup directory'
      },
      desktop: {
        path: path.join(homeDir, 'Desktop', 'EHR-Backups'),
        name: 'Desktop',
        description: 'Desktop folder for easy access'
      },
      documents: {
        path: path.join(homeDir, 'Documents', 'EHR-Backups'),
        name: 'Documents',
        description: 'Documents folder for organization'
      },
      downloads: {
        path: path.join(homeDir, 'Downloads', 'EHR-Backups'),
        name: 'Downloads',
        description: 'Downloads folder for temporary storage'
      }
    };
  }

  async listBackups() {
    try {
      const locations = this.getAvailableBackupLocations();
      const allBackups = [];
      
      // Scan all backup locations
      for (const [key, location] of Object.entries(locations)) {
        try {
          const files = await fs.readdir(location.path);
          const backupFiles = files.filter(file => file.endsWith('.sql.gz.enc'));
          
          for (const file of backupFiles) {
            try {
              const filepath = path.join(location.path, file);
              const stats = await fs.stat(filepath);
              
              // Extract timestamp from filename
              const timestampMatch = file.match(/backup_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)/);
              const timestamp = timestampMatch ? timestampMatch[1].replace(/-/g, ':').replace('T', ' ').replace('Z', '') : 'Unknown';
              
              // Extract description from filename
              const descMatch = file.match(/backup_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_(.+)\.sql\.gz\.enc/);
              const description = descMatch ? descMatch[1].replace(/_/g, ' ') : 'No description';
              
              // Generate a unique ID based on filename hash
              const id = crypto.createHash('md5').update(file).digest('hex');
              
              allBackups.push({
                id,
                filename: file,
                description,
                created_at: timestamp,
                size: stats.size,
                filepath,
                location: key,
                locationPath: location.path,
                locationName: location.name,
                status: 'completed'
              });
            } catch (error) {
              console.error(`Error processing backup file ${file}:`, error);
            }
          }
        } catch (error) {
          // Directory might not exist yet, skip it
          console.log(`Backup location ${location.path} not accessible:`, error.message);
        }
      }
      
      // Sort by timestamp (newest first)
      return allBackups.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      throw new Error(`Failed to list backups: ${error.message}`);
    }
  }

  async getBackupById(id) {
    try {
      const backups = await this.listBackups();
      return backups.find(backup => backup.id === id);
    } catch (error) {
      throw new Error(`Failed to get backup by ID: ${error.message}`);
    }
  }

  async deleteBackup(id) {
    try {
      const backup = await this.getBackupById(id);
      if (!backup) {
        throw new Error('Backup not found');
      }
      
      await fs.unlink(backup.filepath);
      return { success: true, message: 'Backup deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete backup: ${error.message}`);
    }
  }

  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

module.exports = new BackupService();
