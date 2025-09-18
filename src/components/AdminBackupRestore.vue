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

      <!-- Rollback Procedures Section -->
      <div class="bg-gray-900 rounded-lg shadow-md p-6 mb-8 border border-gray-700">
        <h2 class="text-xl font-semibold text-white mb-4">Rollback Procedures</h2>
        <div class="space-y-4">
          <!-- Rollback Type Selection -->
          <div>
            <label for="rollback-type" class="block text-sm font-medium text-gray-300 mb-2">
              Rollback Type
            </label>
            <select
              id="rollback-type"
              v-model="selectedRollbackType"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select rollback type...</option>
              <option value="database">Database Rollback</option>
              <option value="schema">Schema Rollback</option>
              <option value="data">Data Rollback</option>
              <option value="partial">Partial Rollback</option>
            </select>
          </div>

          <!-- Rollback Target Selection -->
          <div v-if="selectedRollbackType">
            <label for="rollback-target" class="block text-sm font-medium text-gray-300 mb-2">
              Rollback Target
            </label>
            <select
              id="rollback-target"
              v-model="selectedRollbackTarget"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select target...</option>
              <option v-for="backup in availableRollbackBackups" :key="backup.id" :value="backup.id">
                {{ backup.description || backup.filename }} ({{ backup.created_at }})
              </option>
            </select>
          </div>

          <!-- Rollback Options -->
          <div v-if="selectedRollbackType && selectedRollbackTarget" class="space-y-3">
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <h4 class="text-md font-medium text-white mb-3">Rollback Options</h4>
              
              <!-- Database Rollback Options -->
              <div v-if="selectedRollbackType === 'database'" class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="rollbackOptions.dropExisting"
                    type="checkbox"
                    class="mr-2 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-300">Drop existing database before restore</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="rollbackOptions.cleanupAfter"
                    type="checkbox"
                    class="mr-2 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-300">Clean up temporary files after rollback</span>
                </label>
              </div>

              <!-- Schema Rollback Options -->
              <div v-if="selectedRollbackType === 'schema'" class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="rollbackOptions.preserveData"
                    type="checkbox"
                    class="mr-2 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                />
                  <span class="text-sm text-gray-300">Preserve existing data during schema rollback</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="rollbackOptions.backupBeforeSchema"
                    type="checkbox"
                    class="mr-2 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-300">Create backup before schema rollback</span>
                </label>
              </div>

              <!-- Data Rollback Options -->
              <div v-if="selectedRollbackType === 'data'" class="space-y-2">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">Tables to rollback:</label>
                  <input
                    v-model="rollbackOptions.tablesToRollback"
                    type="text"
                    placeholder="e.g., users, patients, radiation_personnel (comma-separated)"
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <label class="flex items-center">
                  <input
                    v-model="rollbackOptions.validateDataIntegrity"
                    type="checkbox"
                    class="mr-2 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-300">Validate data integrity after rollback</span>
                </label>
              </div>

              <!-- Partial Rollback Options -->
              <div v-if="selectedRollbackType === 'partial'" class="space-y-2">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">Rollback scope:</label>
                  <select
                    v-model="rollbackOptions.partialScope"
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="recent_changes">Recent changes only</option>
                    <option value="specific_period">Specific time period</option>
                    <option value="specific_user">Specific user changes</option>
                    <option value="specific_module">Specific module changes</option>
                  </select>
                </div>
                <div v-if="rollbackOptions.partialScope === 'specific_period'">
                  <label class="block text-sm font-medium text-gray-300 mb-1">Time period:</label>
                  <div class="grid grid-cols-2 gap-2">
                    <input
                      v-model="rollbackOptions.startDate"
                      type="datetime-local"
                      class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      v-model="rollbackOptions.endDate"
                      type="datetime-local"
                      class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Rollback Actions -->
          <div v-if="selectedRollbackType && selectedRollbackTarget" class="flex gap-3">
            <button
              @click="validateRollback"
              :disabled="validatingRollback"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <span v-if="validatingRollback">Validating...</span>
              <span v-else>Validate Rollback</span>
            </button>
            <button
              @click="executeRollback"
              :disabled="executingRollback || !rollbackValidation.valid"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <span v-if="executingRollback">Executing...</span>
              <span v-else>Execute Rollback</span>
            </button>
            <button
              @click="resetRollbackForm"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>

          <!-- Rollback Validation Results -->
          <div v-if="rollbackValidation.checked" class="bg-gray-800 rounded-lg p-4 border border-gray-600">
            <h4 class="text-md font-medium text-white mb-3">Validation Results</h4>
            <div v-if="rollbackValidation.valid" class="text-green-400">
              <p>✅ Rollback validation passed</p>
              <p class="text-sm text-gray-300 mt-1">{{ rollbackValidation.message }}</p>
            </div>
            <div v-else class="text-red-400">
              <p>❌ Rollback validation failed</p>
              <p class="text-sm text-gray-300 mt-1">{{ rollbackValidation.message }}</p>
              <ul class="text-sm text-gray-300 mt-2 list-disc list-inside">
                <li v-for="issue in rollbackValidation.issues" :key="issue">{{ issue }}</li>
              </ul>
            </div>
          </div>

          <!-- Rollback Progress -->
          <div v-if="rollbackProgress.active" class="bg-gray-800 rounded-lg p-4 border border-gray-600">
            <h4 class="text-md font-medium text-white mb-3">Rollback Progress</h4>
            <div class="w-full bg-gray-700 rounded-full h-2.5 mb-3">
              <div 
                class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                :style="{ width: rollbackProgress.percentage + '%' }"
              ></div>
            </div>
            <p class="text-sm text-gray-300">{{ rollbackProgress.currentStep }}</p>
            <p class="text-sm text-gray-400">{{ rollbackProgress.percentage }}% complete</p>
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
      locationFilter: 'all', // New data property for location filter
      selectedRollbackType: '',
      selectedRollbackTarget: '',
      validatingRollback: false,
      executingRollback: false,
      rollbackOptions: {
        dropExisting: false,
        cleanupAfter: false,
        preserveData: false,
        backupBeforeSchema: false,
        tablesToRollback: '',
        validateDataIntegrity: false,
        partialScope: 'recent_changes',
        startDate: '',
        endDate: ''
      },
      rollbackValidation: {
        checked: false,
        valid: false,
        message: '',
        issues: []
      },
      rollbackProgress: {
        active: false,
        currentStep: '',
        percentage: 0
      },
      availableRollbackBackups: [] // New data property for available backups for rollback
    }
  },
  mounted() {
    this.refreshBackups()
    this.fetchAvailableRollbackBackups()
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
  watch: {
    selectedRollbackType() {
      // Reset rollback target when type changes
      this.selectedRollbackTarget = ''
      this.rollbackValidation.checked = false
      this.rollbackValidation.valid = false
      this.rollbackProgress.active = false
    }
  },
  methods: {
    async createBackup() {
      if (this.creatingBackup) return
      
      this.creatingBackup = true
      try {
        const token = localStorage.getItem('authToken')
        
        if (!token) {
          this.message = { type: 'error', text: 'Authentication required. Please log in again.' }
          return
        }
        
        const response = await fetch('/api/admin/backup/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
        const token = localStorage.getItem('authToken')
        
        if (!token) {
          this.message = { type: 'error', text: 'Authentication required. Please log in again.' }
          return
        }
        
        const response = await fetch('/api/admin/backup/list', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
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
        const token = localStorage.getItem('authToken')
        
        if (!token) {
          this.message = { type: 'error', text: 'Authentication required. Please log in again.' }
          return
        }
        
        const response = await fetch('/api/admin/backup/restore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
        const token = localStorage.getItem('authToken')
        
        if (!token) {
          this.message = { type: 'error', text: 'Authentication required. Please log in again.' }
          return
        }
        
        const response = await fetch('/api/admin/backup/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
    },

    // New methods for rollback procedures
    async fetchAvailableRollbackBackups() {
      try {
        const token = localStorage.getItem('authToken')
        
        if (!token) {
          this.message = { type: 'error', text: 'Authentication required. Please log in again.' }
          return
        }
        
        const response = await fetch('/api/admin/backup/list', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          this.availableRollbackBackups = await response.json()
        } else {
          this.message = { type: 'error', text: 'Failed to load available backups for rollback' }
        }
      } catch (error) {
        this.message = { type: 'error', text: `Error: ${error.message}` }
      }
    },

    async validateRollback() {
      this.rollbackValidation.checked = false
      this.rollbackValidation.valid = false
      this.rollbackValidation.message = ''
      this.rollbackValidation.issues = []
      this.rollbackProgress.active = false
      this.rollbackProgress.currentStep = ''
      this.rollbackProgress.percentage = 0

      if (!this.selectedRollbackType) {
        this.rollbackValidation.message = 'Please select a rollback type.'
        this.rollbackValidation.checked = true
        return
      }

      if (!this.selectedRollbackTarget) {
        this.rollbackValidation.message = 'Please select a backup target for rollback.'
        this.rollbackValidation.checked = true
        return
      }

      this.rollbackProgress.active = true
      this.rollbackProgress.currentStep = 'Fetching backup details...'
      this.rollbackProgress.percentage = 10

      try {
        const token = localStorage.getItem('authToken')
        
        if (!token) {
          this.rollbackValidation.message = 'Authentication required. Please log in again.'
          this.rollbackValidation.checked = true
          return
        }
        
        const response = await fetch(`/api/admin/backup/details/${this.selectedRollbackTarget}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const backup = await response.json()
          this.selectedBackup = backup
          this.rollbackValidation.message = 'Backup details fetched. Preparing for validation.'
          this.rollbackProgress.percentage = 30
        } else {
          this.rollbackValidation.message = 'Failed to fetch backup details.'
          this.rollbackValidation.checked = true
          return
        }
      } catch (error) {
        this.rollbackValidation.message = `Error fetching backup details: ${error.message}`
        this.rollbackValidation.checked = true
        return
      }

      this.rollbackProgress.currentStep = 'Validating rollback options...'
      this.rollbackProgress.percentage = 50

      try {
        const validationResult = await this.performRollbackValidation()
        this.rollbackValidation.valid = validationResult.valid
        this.rollbackValidation.message = validationResult.message
        this.rollbackValidation.issues = validationResult.issues
        this.rollbackProgress.percentage = 70
      } catch (error) {
        this.rollbackValidation.message = `Rollback validation failed: ${error.message}`
        this.rollbackValidation.checked = true
        return
      }

      this.rollbackProgress.currentStep = 'Rollback validation complete.'
      this.rollbackProgress.percentage = 100
      this.rollbackValidation.checked = true
    },

    async performRollbackValidation() {
      const issues = []
      let message = 'Rollback validation passed.'

      if (this.selectedRollbackType === 'database' && this.rollbackOptions.dropExisting) {
        const confirmDrop = confirm('Are you sure you want to drop the existing database? This action cannot be undone.')
        if (!confirmDrop) {
          issues.push('User cancelled database drop.')
          message = 'Rollback validation failed due to user cancellation.'
          return { valid: false, message, issues }
        }
      }

      if (this.selectedRollbackType === 'schema' && this.rollbackOptions.preserveData) {
        const confirmPreserve = confirm('Are you sure you want to preserve existing data during schema rollback? This might lead to data loss if not handled carefully.')
        if (!confirmPreserve) {
          issues.push('User cancelled preserving data during schema rollback.')
          message = 'Rollback validation failed due to user cancellation.'
          return { valid: false, message, issues }
        }
      }

      if (this.selectedRollbackType === 'data' && this.rollbackOptions.validateDataIntegrity) {
        const confirmIntegrity = confirm('Are you sure you want to validate data integrity after rollback? This might take a long time and consume significant resources.')
        if (!confirmIntegrity) {
          issues.push('User cancelled data integrity validation.')
          message = 'Rollback validation failed due to user cancellation.'
          return { valid: false, message, issues }
        }
      }

      if (this.selectedRollbackType === 'partial' && this.rollbackOptions.partialScope === 'specific_period') {
        if (!this.rollbackOptions.startDate || !this.rollbackOptions.endDate) {
          issues.push('Please select both start and end dates for specific time period rollback.')
          message = 'Rollback validation failed due to missing dates.'
          return { valid: false, message, issues }
        }
        if (new Date(this.rollbackOptions.startDate) >= new Date(this.rollbackOptions.endDate)) {
          issues.push('Start date must be before end date for specific time period rollback.')
          message = 'Rollback validation failed due to date range error.'
          return { valid: false, message, issues }
        }
      }

      return { valid: true, message, issues }
    },

    async executeRollback() {
      if (this.executingRollback) return
      
      this.executingRollback = true
      this.rollbackProgress.active = true
      this.rollbackProgress.currentStep = 'Preparing rollback...'
      this.rollbackProgress.percentage = 0

      try {
        const token = localStorage.getItem('authToken')
        
        if (!token) {
          this.message = { type: 'error', text: 'Authentication required. Please log in again.' }
          return
        }
        
        const response = await fetch('/api/admin/backup/rollback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            backupId: this.selectedRollbackTarget,
            type: this.selectedRollbackType,
            options: this.rollbackOptions
          })
        })

        if (response.ok) {
          const result = await response.json()
          this.message = { type: 'success', text: result.message }
          this.refreshBackups() // Refresh backups to show new rollback status
          this.resetRollbackForm()
        } else {
          const error = await response.text()
          this.message = { type: 'error', text: `Failed to execute rollback: ${error}` }
        }
      } catch (error) {
        this.message = { type: 'error', text: `Error: ${error.message}` }
      } finally {
        this.executingRollback = false
        this.rollbackProgress.active = false
      }
    },

    resetRollbackForm() {
      this.selectedRollbackType = ''
      this.selectedRollbackTarget = ''
      this.rollbackOptions = {
        dropExisting: false,
        cleanupAfter: false,
        preserveData: false,
        backupBeforeSchema: false,
        tablesToRollback: '',
        validateDataIntegrity: false,
        partialScope: 'recent_changes',
        startDate: '',
        endDate: ''
      }
      this.rollbackValidation.checked = false
      this.rollbackValidation.valid = false
      this.rollbackValidation.message = ''
      this.rollbackValidation.issues = []
      this.rollbackProgress.active = false
      this.rollbackProgress.currentStep = ''
      this.rollbackProgress.percentage = 0
      this.availableRollbackBackups = [] // Clear available backups
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
