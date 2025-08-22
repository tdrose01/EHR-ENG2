<template>
  <div class="monitoring-dashboard">
    <div class="dashboard-header">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">
        System Monitoring Dashboard
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Real-time system health and performance monitoring
      </p>
    </div>

    <!-- Debug Information -->
    <div class="debug-info bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
      <p><strong>Debug Info:</strong></p>
      <p>Active Tab: {{ activeTab }}</p>
      <p>System Status: {{ systemStatus }}</p>
      <p>Data Loaded: {{ dataLoaded ? 'Yes' : 'No' }}</p>
      <p>Last Update: {{ formatTime(lastUpdate) }}</p>
      <p>Loading: {{ loading ? 'Yes' : 'No' }}</p>
      <p v-if="error">Error: {{ error }}</p>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-display bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p><strong>Error:</strong> {{ error }}</p>
      <button @click="refreshData" class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
        Retry
      </button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="loading-indicator bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
      <p><strong>Loading...</strong> Fetching monitoring data...</p>
    </div>

    <!-- System Status Overview -->
    <div class="status-overview grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="status-card" :class="getStatusClass(systemStatus)">
        <div class="status-icon">
          <svg v-if="systemStatus === 'healthy'" class="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg v-else-if="systemStatus === 'degraded'" class="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="status-content">
          <h3 class="status-title">System Status</h3>
          <p class="status-value capitalize">{{ systemStatus }}</p>
        </div>
      </div>

      <div class="status-card">
        <div class="status-icon">
          <svg class="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="status-content">
          <h3 class="status-title">Uptime</h3>
          <p class="status-value">{{ formatUptime(uptime) }}</p>
        </div>
      </div>

      <div class="status-card">
        <div class="status-icon">
          <svg class="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="status-content">
          <h3 class="status-title">Active Alerts</h3>
          <p class="status-value">{{ activeAlerts }}</p>
        </div>
      </div>

      <div class="status-card">
        <div class="status-icon">
          <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="status-content">
          <h3 class="status-title">Critical Alerts</h3>
          <p class="status-value">{{ criticalAlerts }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content Tabs -->
    <div class="dashboard-tabs">
      <div class="tab-buttons flex space-x-1 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'tab-button px-4 py-2 rounded-lg font-medium transition-colors',
            activeTab === tab.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Debug Tab Info -->
        <div class="debug-tab-info bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded mb-4">
          <p><strong>Tab Debug:</strong></p>
          <p>Active Tab: "{{ activeTab }}"</p>
          <p>Tab Content Should Show: {{ activeTab === 'health' ? 'Health Tab' : activeTab === 'alerts' ? 'Alerts Tab' : activeTab === 'metrics' ? 'Metrics Tab' : activeTab === 'config' ? 'Config Tab' : 'Unknown Tab' }}</p>
        </div>

        <!-- System Health Tab -->
        <div v-if="activeTab === 'health'" class="health-tab">
          <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p><strong>Health Tab Active!</strong> This tab is working.</p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- System Health Details -->
            <div class="health-section">
              <h3 class="section-title">System Health Details</h3>
              <div class="health-grid">
                <div v-for="check in healthChecks" :key="check.name" class="health-item">
                  <span class="health-label">{{ check.name }}</span>
                  <span class="health-status" :class="getStatusClass(check.status)">
                    {{ check.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Performance Metrics -->
            <div class="health-section">
              <h3 class="section-title">Performance Metrics</h3>
              <div class="metrics-grid">
                <div class="metric-item">
                  <span class="metric-label">Memory Usage</span>
                  <span class="metric-value">{{ memoryUsage }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Database Connections</span>
                  <span class="metric-value">{{ databaseConnections }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Last Check</span>
                  <span class="metric-value">{{ formatTime(lastCheck) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Alerts Tab -->
        <div v-if="activeTab === 'alerts'" class="alerts-tab">
          <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <p><strong>Alerts Tab Active!</strong> This tab is working.</p>
          </div>
          <div class="alerts-header flex justify-between items-center mb-4">
            <h3 class="section-title">Active Alerts</h3>
            <button
              @click="refreshAlerts"
              class="refresh-button px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div v-if="alerts.length === 0" class="no-alerts">
            <p class="text-gray-500 text-center py-8">No active alerts</p>
          </div>

          <div v-else class="alerts-list space-y-4">
            <div
              v-for="alert in alerts"
              :key="alert.id"
              class="alert-item p-4 rounded-lg border"
              :class="getAlertClass(alert.severity)"
            >
              <div class="alert-header flex justify-between items-start">
                <div class="alert-title">
                  <h4 class="font-semibold">{{ alert.type }}</h4>
                  <p class="text-sm text-gray-600">{{ alert.message }}</p>
                </div>
                <div class="alert-actions">
                  <span class="severity-badge" :class="getSeverityClass(alert.severity)">
                    {{ alert.severity }}
                  </span>
                  <button
                    @click="acknowledgeAlert(alert.id)"
                    class="ack-button ml-2 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
              <div class="alert-details mt-2">
                <p class="text-xs text-gray-500">
                  <span class="font-medium">Time:</span> {{ formatTime(alert.timestamp) }}
                  <span class="font-medium ml-4">ID:</span> {{ alert.id }}
                </p>
                <div v-if="alert.details" class="mt-2">
                  <details class="text-sm">
                    <summary class="cursor-pointer text-blue-600 hover:text-blue-800">
                      View Details
                    </summary>
                    <pre class="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">{{ JSON.stringify(alert.details, null, 2) }}</pre>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Metrics Tab -->
        <div v-if="activeTab === 'metrics'" class="metrics-tab">
          <div class="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded mb-4">
            <p><strong>Metrics Tab Active!</strong> This tab is working.</p>
          </div>
          <div class="metrics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="metric-card">
              <h3 class="metric-title">System Metrics</h3>
              <div class="metric-content">
                <div class="metric-row">
                  <span>Uptime:</span>
                  <span>{{ formatUptime(uptime) }}</span>
                </div>
                <div class="metric-row">
                  <span>Memory Usage:</span>
                  <span>{{ memoryUsage }}%</span>
                </div>
                <div class="metric-row">
                  <span>Database Connections:</span>
                  <span>{{ databaseConnections }}</span>
                </div>
              </div>
            </div>

            <div class="metric-card">
              <h3 class="metric-title">Alert Metrics</h3>
              <div class="metric-content">
                <div class="metric-row">
                  <span>Total Alerts:</span>
                  <span>{{ totalAlerts }}</span>
                </div>
                <div class="metric-row">
                  <span>Active Alerts:</span>
                  <span>{{ activeAlerts }}</span>
                </div>
                <div class="metric-row">
                  <span>Critical Alerts:</span>
                  <span>{{ criticalAlerts }}</span>
                </div>
              </div>
            </div>

            <div class="metric-card">
              <h3 class="metric-title">Performance</h3>
              <div class="metric-content">
                <div class="metric-row">
                  <span>Last Check:</span>
                  <span>{{ formatTime(lastCheck) }}</span>
                </div>
                <div class="metric-row">
                  <span>Error Count:</span>
                  <span>{{ errorCount }}</span>
                </div>
                <div class="metric-row">
                  <span>System Health:</span>
                  <span class="capitalize">{{ systemStatus }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuration Tab -->
        <div v-if="activeTab === 'config'" class="config-tab">
          <div class="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-4">
            <p><strong>Configuration Tab Active!</strong> This tab is working.</p>
          </div>
          <div class="config-section">
            <h3 class="section-title">Monitoring Configuration</h3>
            <div class="config-grid">
              <div class="config-item">
                <label class="config-label">System Health Check Interval</label>
                <span class="config-value">30 seconds</span>
              </div>
              <div class="config-item">
                <label class="config-label">Database Health Check Interval</label>
                <span class="config-value">1 minute</span>
              </div>
              <div class="config-item">
                <label class="config-label">Performance Metrics Interval</label>
                <span class="config-value">5 minutes</span>
              </div>
              <div class="config-item">
                <label class="config-label">Alert Cleanup Interval</label>
                <span class="config-value">1 hour</span>
              </div>
            </div>
          </div>

          <div class="config-section mt-6">
            <h3 class="section-title">Alert Thresholds</h3>
            <div class="config-grid">
              <div class="config-item">
                <label class="config-label">Critical Alerts Threshold</label>
                <span class="config-value">{{ alertThresholds.criticalAlerts || 'N/A' }}</span>
              </div>
              <div class="config-item">
                <label class="config-label">Memory Usage Threshold</label>
                <span class="config-value">{{ alertThresholds.memoryUsagePercent || 'N/A' }}%</span>
              </div>
              <div class="config-item">
                <label class="config-label">Database Connections Threshold</label>
                <span class="config-value">{{ alertThresholds.databaseConnections || 'N/A' }}</span>
              </div>
              <div class="config-item">
                <label class="config-label">API Response Time Threshold</label>
                <span class="config-value">{{ alertThresholds.apiResponseTimeMs || 'N/A' }}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Auto-refresh indicator -->
    <div class="auto-refresh-info text-center mt-8 text-sm text-gray-500">
      <p>Data refreshes automatically every 30 seconds</p>
      <p>Last updated: {{ formatTime(lastUpdate) }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'MonitoringDashboard',
  setup() {
    const activeTab = ref('health')
    const systemStatus = ref('unknown')
    const uptime = ref(0)
    const memoryUsage = ref(0)
    const databaseConnections = ref(0)
    const activeAlerts = ref(0)
    const criticalAlerts = ref(0)
    const totalAlerts = ref(0)
    const errorCount = ref(0)
    const lastCheck = ref(null)
    const lastUpdate = ref(new Date())
    const healthChecks = ref([])
    const alerts = ref([])
    const alertThresholds = ref({})
    const dataLoaded = ref(false)
    const loading = ref(false)
    const error = ref(null)
    
    let refreshInterval = null

    const tabs = [
      { id: 'health', name: 'System Health' },
      { id: 'alerts', name: 'Alerts' },
      { id: 'metrics', name: 'Metrics' },
      { id: 'config', name: 'Configuration' }
    ]

    const fetchSystemStatus = async () => {
      try {
        loading.value = true
        error.value = null
        console.log('Fetching system status...')
        
        const response = await fetch('/api/monitoring/status')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('System status response:', data)
        
        if (data.status === 'success') {
          systemStatus.value = data.data.system.status
          uptime.value = data.data.metrics.uptime
          memoryUsage.value = Math.round((data.data.metrics.memoryUsage.heapUsed / data.data.metrics.memoryUsage.heapTotal) * 100)
          databaseConnections.value = data.data.metrics.databaseConnections
          activeAlerts.value = data.data.metrics.activeAlerts
          criticalAlerts.value = data.data.metrics.criticalAlerts
          lastCheck.value = new Date(data.data.metrics.lastCheck)
          lastUpdate.value = new Date()
          dataLoaded.value = true
        } else {
          throw new Error(data.message || 'Failed to fetch system status')
        }
      } catch (error) {
        console.error('Failed to fetch system status:', error)
        systemStatus.value = 'error'
        error.value = error.message
      } finally {
        loading.value = false
      }
    }

    const fetchHealthChecks = async () => {
      try {
        console.log('Fetching health checks...')
        
        const response = await fetch('/api/monitoring/health')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Health checks response:', data)
        
        if (data.status === 'success') {
          healthChecks.value = data.data.checks || []
        } else {
          throw new Error(data.message || 'Failed to fetch health checks')
        }
      } catch (error) {
        console.error('Failed to fetch health checks:', error)
        error.value = error.message
      }
    }

    const fetchAlerts = async () => {
      try {
        console.log('Fetching alerts...')
        
        const response = await fetch('/api/monitoring/alerts')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Alerts response:', data)
        
        if (data.status === 'success') {
          alerts.value = data.data.alerts || []
          totalAlerts.value = data.data.count || 0
        } else {
          throw new Error(data.message || 'Failed to fetch alerts')
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
        error.value = error.message
      }
    }

    const fetchMetrics = async () => {
      try {
        console.log('Fetching metrics...')
        
        const response = await fetch('/api/monitoring/metrics')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Metrics response:', data)
        
        if (data.status === 'success') {
          errorCount.value = data.data.errorCount || 0
        } else {
          throw new Error(data.message || 'Failed to fetch metrics')
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
        error.value = error.message
      }
    }

    const fetchConfiguration = async () => {
      try {
        console.log('Fetching configuration...')
        
        const response = await fetch('/api/monitoring/config')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Configuration response:', data)
        
        if (data.status === 'success') {
          alertThresholds.value = data.data.alertThresholds || {}
        } else {
          throw new Error(data.message || 'Failed to fetch configuration')
        }
      } catch (error) {
        console.error('Failed to fetch configuration:', error)
        error.value = error.message
      }
    }

    const refreshAlerts = () => {
      fetchAlerts()
    }

    const acknowledgeAlert = async (alertId) => {
      try {
        const response = await fetch(`/api/monitoring/alerts/${alertId}/acknowledge`, {
          method: 'POST'
        })
        
        if (response.ok) {
          // Remove acknowledged alert from local list
          alerts.value = alerts.value.filter(alert => alert.id !== alertId)
          // Refresh alerts count
          await fetchSystemStatus()
        }
      } catch (error) {
        console.error('Failed to acknowledge alert:', error)
        error.value = error.message
      }
    }

    const refreshData = async () => {
      console.log('Refreshing all data...')
      await Promise.all([
        fetchSystemStatus(),
        fetchHealthChecks(),
        fetchAlerts(),
        fetchMetrics(),
        fetchConfiguration()
      ])
    }

    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / 86400)
      const hours = Math.floor((seconds % 86400) / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      
      if (days > 0) return `${days}d ${hours}h ${minutes}m`
      if (hours > 0) return `${hours}h ${minutes}m`
      return `${minutes}m`
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return 'N/A'
      return new Date(timestamp).toLocaleString()
    }

    const getStatusClass = (status) => {
      switch (status) {
        case 'healthy': return 'border-green-500 bg-green-50 dark:bg-green-900/20'
        case 'degraded': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
        case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
        default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
      }
    }

    const getAlertClass = (severity) => {
      switch (severity) {
        case 'CRITICAL': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
        case 'WARNING': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
        case 'INFO': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
        default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
      }
    }

    const getSeverityClass = (severity) => {
      switch (severity) {
        case 'CRITICAL': return 'bg-red-600 text-white'
        case 'WARNING': return 'bg-yellow-600 text-white'
        case 'INFO': return 'bg-blue-600 text-white'
        default: return 'bg-gray-600 text-white'
      }
    }

    onMounted(() => {
      console.log('MonitoringDashboard mounted, starting data refresh...')
      refreshData()
      
      // Set up auto-refresh every 30 seconds
      refreshInterval = setInterval(refreshData, 30000)
    })

    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    })

    return {
      activeTab,
      systemStatus,
      uptime,
      memoryUsage,
      databaseConnections,
      activeAlerts,
      criticalAlerts,
      totalAlerts,
      errorCount,
      lastCheck,
      lastUpdate,
      healthChecks,
      alerts,
      alertThresholds,
      tabs,
      refreshAlerts,
      acknowledgeAlert,
      formatUptime,
      formatTime,
      getStatusClass,
      getAlertClass,
      getSeverityClass,
      dataLoaded,
      loading,
      error
    }
  }
}
</script>

<style scoped>
.monitoring-dashboard {
  @apply p-6 max-w-7xl mx-auto;
}

.dashboard-header {
  @apply mb-8 text-center;
}

.status-overview {
  @apply mb-8;
}

.status-card {
  @apply p-6 rounded-lg border-2 flex items-center space-x-4 transition-all duration-200 hover:shadow-lg;
}

.status-icon {
  @apply flex-shrink-0;
}

.status-content {
  @apply flex-1;
}

.status-title {
  @apply text-sm font-medium text-gray-600 dark:text-gray-400 mb-1;
}

.status-value {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.dashboard-tabs {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6;
}

.tab-button {
  @apply transition-all duration-200;
}

.section-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-4;
}

.health-section {
  @apply bg-gray-50 dark:bg-gray-700 rounded-lg p-6;
}

.health-grid {
  @apply space-y-3;
}

.health-item {
  @apply flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600;
}

.health-label {
  @apply text-gray-700 dark:text-gray-300;
}

.health-status {
  @apply px-2 py-1 rounded text-xs font-medium;
}

.health-status.healthy {
  @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
}

.health-status.degraded {
  @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
}

.health-status.critical {
  @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
}

.metrics-grid {
  @apply space-y-3;
}

.metric-item {
  @apply flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600;
}

.metric-label {
  @apply text-gray-700 dark:text-gray-300;
}

.metric-value {
  @apply font-medium text-gray-900 dark:text-white;
}

.alert-item {
  @apply transition-all duration-200 hover:shadow-md;
}

.alert-header {
  @apply flex justify-between items-start;
}

.alert-title h4 {
  @apply text-gray-900 dark:text-white;
}

.severity-badge {
  @apply px-2 py-1 rounded text-xs font-medium;
}

.ack-button {
  @apply transition-colors duration-200;
}

.alert-details {
  @apply text-gray-600 dark:text-gray-400;
}

.metric-card {
  @apply bg-gray-50 dark:bg-gray-700 rounded-lg p-6;
}

.metric-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-4;
}

.metric-content {
  @apply space-y-3;
}

.metric-row {
  @apply flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600;
}

.metric-row span:first-child {
  @apply text-gray-700 dark:text-gray-300;
}

.metric-row span:last-child {
  @apply font-medium text-gray-900 dark:text-white;
}

.config-section {
  @apply bg-gray-50 dark:bg-gray-700 rounded-lg p-6;
}

.config-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.config-item {
  @apply flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600;
}

.config-label {
  @apply text-gray-700 dark:text-gray-300;
}

.config-value {
  @apply font-medium text-gray-900 dark:text-white;
}

.no-alerts {
  @apply text-center py-12;
}

.auto-refresh-info {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

/* Dark mode adjustments */
.dark .status-card {
  @apply border-gray-600;
}

.dark .health-section,
.dark .metric-card,
.dark .config-section {
  @apply bg-gray-700 border border-gray-600;
}

.dark .health-item,
.dark .metric-item,
.dark .config-item {
  @apply border-gray-600;
}
</style>
