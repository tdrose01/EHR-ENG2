<template>
  <div class="admin-backup-restore min-h-screen bg-black text-white">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-white mb-8">Database Backup & Restore</h1>
      
      <!-- Create Backup Section -->
      <div class="bg-gray-900 rounded-lg shadow-md p-6 mb-8 border border-gray-700">
        <h2 class="text-xl font-semibold text-white mb-4">Create New Backup</h2>
        <div class="space-y-4">
          <!-- Backup Description -->
          <div>
            <label for="backup-description" class="block text-sm font-medium text-gray-300 mb-2">
              Backup Description (Optional)
            </label>
            <input
              id="backup-description"
              v-model="backupDescription"
              type="text"
              placeholder="e.g., Before system update, Monthly backup"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <!-- Backup Location -->
          <div>
            <label for="backup-location" class="block text-sm font-medium text-gray-300 mb-2">
              Backup Location
            </label>
            <div class="flex gap-3">
              <select
                id="backup-location"
                v-model="selectedBackupLocation"
                class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="default">Default Location (./backups)</option>
                <option value="custom">Custom Path</option>
                <option value="desktop">Desktop</option>
                <option value="documents">Documents</option>
                <option value="downloads">Downloads</option>
              </select>
              <button
                @click="browseLocation"
                type="button"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
              >
                Browse
              </button>
            </div>
            
            <!-- Custom Path Input -->
            <div v-if="selectedBackupLocation === 'custom'" class="mt-3">
              <input
                v-model="customBackupPath"
                type="text"
                placeholder="Enter custom backup path (e.g., C:\MyBackups)"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <!-- Path Display -->
            <div v-if="selectedBackupLocation !== 'default'" class="mt-2">
              <p class="text-sm text-gray-400">
                <span class="font-medium">Backup will be saved to:</span>
                <span class="ml-2 text-blue-300">{{ getBackupPathDisplay() }}</span>
              </p>
            </div>
          </div>
          
          <!-- Create Button -->
          <div class="flex justify-end">
            <button
              @click="createBackup"
              :disabled="creatingBackup"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded-md transition-colors disabled:cursor-not-allowed"
            >
              <span v-if="creatingBackup" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Backup...
              </span>
              <span v-else>Create Backup</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Backup List Section -->
      <div class="bg-gray-900 rounded-lg shadow-md p-6 border border-gray-700">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-white">Backup History</h2>
          <div class="flex gap-3">
            <!-- Location Filter -->
            <select
              v-model="locationFilter"
              class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Locations</option>
              <option value="default">Default Location</option>
              <option value="desktop">Desktop</option>
              <option value="documents">Documents</option>
              <option value="downloads">Downloads</option>
              <option value="custom">Custom Paths</option>
            </select>
            
            <button
              @click="refreshBackups"
              :disabled="refreshing"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors disabled:opacity-50"
            >
              <span v-if="refreshing" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </span>
              <span v-else>Refresh</span>
            </button>
          </div>
        </div>
        
        <div v-if="filteredBackups.length === 0" class="text-center py-8">
          <p class="text-gray-400">No backups found.</p>
        </div>
        
        <div v-else class="space-y-3">
          <div
            v-for="backup in filteredBackups"
            :key="backup.id"
            class="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-medium text-white">{{ backup.description || 'No description' }}</h3>
                  <span :class="getStatusClasses(backup.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ backup.status }}
                  </span>
                  <span class="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
                    {{ backup.locationName || backup.location }}
                  </span>
                </div>
                <p class="text-sm text-gray-400 mb-2">
                  <span class="font-medium">File:</span> {{ backup.filename }}
                </p>
                <p class="text-sm text-gray-400 mb-2">
                  <span class="font-medium">Created:</span> {{ backup.created_at }}
                </p>
                <p class="text-sm text-gray-400 mb-2">
                  <span class="font-medium">Size:</span> {{ formatFileSize(backup.size) }}
                </p>
                <p class="text-sm text-gray-400">
                  <span class="font-medium">Path:</span> {{ backup.locationPath }}
                </p>
              </div>
              
              <div class="flex gap-2">
                <button
                  @click="restoreBackup(backup)"
                  :disabled="restoring"
                  class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors disabled:opacity-50"
                >
                  Restore
                </button>
                <button
                  @click="deleteBackup(backup)"
                  class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Restore Confirmation Modal -->
      <div v-if="showRestoreModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-600">
          <h3 class="text-lg font-medium text-white mb-4">Confirm Restore</h3>
          <p class="text-gray-300 mb-6">
            Are you sure you want to restore from <strong>{{ selectedBackup?.filename }}</strong>? 
            This will overwrite the current database and cannot be undone.
          </p>
          <div class="flex space-x-3">
            <button
              @click="confirmRestore"
              :disabled="restoring"
              class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              <span v-if="restoring">Restoring...</span>
              <span v-else>Yes, Restore</span>
            </button>
            <button
              @click="cancelRestore"
              class="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message" class="fixed top-4 right-4 z-50">
        <div :class="[
          'px-6 py-4 rounded-lg shadow-lg max-w-md',
          message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        ]">
          <div class="flex items-center">
            <i :class="message.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'" class="mr-3"></i>
            <span>{{ message.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminBackupRestore',
  data() {
    return {
      backupDescription: '',
      backups: [],
      creatingBackup: false,
      refreshing: false,
      restoring: false,
      showRestoreModal: false,
      selectedBackup: null,
      message: null,
      selectedBackupLocation: 'default',
      customBackupPath: '',
      locationFilter: 'all' // New data property for location filter
    }
  },
  mounted() {
    this.refreshBackups()
  },
  computed: {
    filteredBackups() {
      if (this.locationFilter === 'all') {
        return this.backups
      }
      return this.backups.filter(backup => {
        if (this.locationFilter === 'default') {
          return backup.location === 'default'
        } else if (this.locationFilter === 'custom') {
          return backup.location === 'custom'
        } else {
          return backup.location === this.locationFilter
        }
      })
    }
  },
  methods: {
    async createBackup() {
      if (this.creatingBackup) return
      
      this.creatingBackup = true
      try {
        const response = await fetch('/api/admin/backup/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            description: this.backupDescription,
            location: this.selectedBackupLocation,
            customPath: this.selectedBackupLocation === 'custom' ? this.customBackupPath : null
          })
        })

        if (response.ok) {
          const result = await response.json()
          this.message = { type: 'success', text: `Backup created successfully: ${result.filename}` }
          this.backupDescription = ''
          this.refreshBackups()
        } else {
          const error = await response.text()
          this.message = { type: 'error', text: `Failed to create backup: ${error}` }
        }
      } catch (error) {
        this.message = { type: 'error', text: `Error: ${error.message}` }
      } finally {
        this.creatingBackup = false
      }
    },

    async refreshBackups() {
      this.refreshing = true
      try {
        const response = await fetch('/api/admin/backup/list')
        if (response.ok) {
          this.backups = await response.json()
        } else {
          this.message = { type: 'error', text: 'Failed to load backups' }
        }
      } catch (error) {
        this.message = { type: 'error', text: `Error: ${error.message}` }
      } finally {
        this.refreshing = false
      }
    },

    async restoreBackup(backup) {
      if (this.restoring) return
      
      this.restoring = true
      try {
        const response = await fetch('/api/admin/backup/restore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ backupId: backup.id })
        })

        if (response.ok) {
          const result = await response.json()
          this.message = { type: 'success', text: result.message }
        } else {
          const error = await response.text()
          this.message = { type: 'error', text: `Failed to restore backup: ${error}` }
        }
      } catch (error) {
        this.message = { type: 'error', text: `Error: ${error.message}` }
      } finally {
        this.restoring = false
      }
    },

    async deleteBackup(backup) {
      if (!confirm(`Are you sure you want to delete the backup "${backup.description || backup.filename}"?`)) {
        return
      }

      try {
        const response = await fetch('/api/admin/backup/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ backupId: backup.id })
        })

        if (response.ok) {
          this.message = { type: 'success', text: 'Backup deleted successfully' }
          this.refreshBackups()
        } else {
          const error = await response.text()
          this.message = { type: 'error', text: `Failed to delete backup: ${error}` }
        }
      } catch (error) {
        this.message = { type: 'error', text: `Error: ${error.message}` }
      }
    },

    showMessage(type, text) {
      this.message = { type, text }
      setTimeout(() => {
        this.message = null
      }, 5000)
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString()
    },

    getBackupPathDisplay() {
      if (this.selectedBackupLocation === 'default') {
        return './backups'
      } else if (this.selectedBackupLocation === 'custom') {
        return this.customBackupPath || 'N/A'
      } else {
        return this.selectedBackupLocation
      }
    },

    browseLocation() {
      const input = document.createElement('input')
      input.type = 'file'
      input.webkitdirectory = true // For macOS
      input.directory = true // For Windows
      input.multiple = false // Allow only one directory

      input.onchange = (event) => {
        const selectedFile = event.target.files[0]
        if (selectedFile) {
          this.customBackupPath = selectedFile.path
        }
      }

      input.click()
    },

    getStatusClasses(status) {
      const statusClasses = {
        'completed': 'bg-green-600 bg-opacity-20 text-green-400 border border-green-600',
        'in_progress': 'bg-yellow-600 bg-opacity-20 text-yellow-400 border border-yellow-600',
        'failed': 'bg-red-600 bg-opacity-20 text-red-400 border border-red-600',
        'pending': 'bg-gray-600 bg-opacity-20 text-gray-400 border border-gray-600'
      }
      return statusClasses[status] || statusClasses['pending']
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.admin-backup-restore {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #111827;
}

::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}

/* Smooth transitions */
.transition-colors {
  transition: all 0.2s ease-in-out;
}

/* Hover effects for cards */
.bg-gray-900:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

/* Button hover effects */
button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Input focus effects */
input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Status badge animations */
.bg-green-600, .bg-yellow-600, .bg-red-600, .bg-gray-600 {
  transition: all 0.2s ease-in-out;
}

/* Modal backdrop */
.bg-black.bg-opacity-50 {
  backdrop-filter: blur(4px);
}

/* Loading spinner */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Message notification */
.fixed.top-4.right-4 {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
