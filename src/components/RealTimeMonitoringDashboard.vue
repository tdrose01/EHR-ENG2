<template>
  <div class="real-time-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
    <!-- Enhanced Header with Connection Status -->
    <div class="bg-gradient-to-r from-slate-800 to-blue-800 border-b border-blue-600/30 p-6 shadow-lg">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              ☢️ Real-Time Radiation Monitoring
            </h1>
            <p class="text-blue-200 mt-2">Live radiation health data and alerts</p>
          </div>
          <div class="flex items-center space-x-6">
            <!-- Enhanced Connection Status -->
            <div class="flex items-center space-x-3 bg-slate-800/50 px-4 py-2 rounded-lg border border-blue-500/30">
              <div 
                :class="[
                  'w-4 h-4 rounded-full shadow-lg',
                  connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-400 animate-ping' : 'bg-red-400'
                ]"
              ></div>
              <span class="text-sm font-medium text-blue-100">
                {{ connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected' }}
              </span>
            </div>
            
            <!-- Connection ID -->
            <div v-if="connectionId" class="text-xs text-blue-300 bg-slate-800/50 px-3 py-2 rounded border border-blue-500/30">
              ID: {{ connectionId }}
            </div>
            
            <!-- Enhanced Reconnect Button -->
            <button 
              v-if="connectionStatus === 'disconnected'"
              @click="connect"
              class="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🔄 Reconnect
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div class="max-w-7xl mx-auto p-6">
      <!-- Enhanced Real-time Status Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Connection Status Card -->
        <div class="bg-gradient-to-br from-slate-800/80 to-blue-800/80 rounded-xl p-6 border border-blue-500/30 shadow-xl backdrop-blur-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-200 text-sm font-medium">Connection</p>
              <p class="text-2xl font-bold text-cyan-400">{{ connectionStatus }}</p>
            </div>
            <div class="text-4xl">🔌</div>
          </div>
          <div class="mt-4 text-xs text-blue-300">
            Reconnects: {{ reconnectAttempts }}
          </div>
        </div>

        <!-- Active Alerts Card -->
        <div class="bg-gradient-to-br from-red-900/80 to-orange-800/80 rounded-xl p-6 border border-red-500/30 shadow-xl backdrop-blur-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-red-200 text-sm font-medium">Active Alerts</p>
              <p class="text-2xl font-bold text-red-400">{{ alertsCount }}</p>
            </div>
            <div class="text-4xl">🚨</div>
          </div>
          <div class="mt-4 text-xs text-red-300">
            Critical: {{ criticalAlertsCount }}
          </div>
        </div>

        <!-- Notifications Card -->
        <div class="bg-gradient-to-br from-blue-900/80 to-cyan-800/80 rounded-xl p-6 border border-cyan-500/30 shadow-xl backdrop-blur-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-cyan-200 text-sm font-medium">Notifications</p>
              <p class="text-2xl font-bold text-cyan-400">{{ unreadNotifications }}</p>
            </div>
            <div class="text-4xl">📱</div>
          </div>
          <div class="mt-4 text-xs text-cyan-300">
            Total: {{ notifications.length }}
          </div>
        </div>

        <!-- Recent Updates Card -->
        <div class="bg-gradient-to-br from-purple-900/80 to-pink-800/80 rounded-xl p-6 border border-purple-500/30 shadow-xl backdrop-blur-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-200 text-sm font-medium">Recent Updates</p>
              <p class="text-2xl font-bold text-purple-400">{{ recentUpdates.length }}</p>
            </div>
            <div class="text-4xl">📊</div>
          </div>
          <div class="mt-4 text-xs text-purple-300">
            Last: {{ lastUpdateTime }}
          </div>
        </div>
      </div>

      <!-- Real-time Data Streams with Enhanced Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Enhanced Live Alerts Stream -->
        <div class="bg-gradient-to-br from-slate-800/80 to-red-900/80 rounded-xl p-6 border border-red-500/30 shadow-xl backdrop-blur-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-red-400 flex items-center">
              🚨 Live Alerts
              <span class="ml-2 text-sm bg-red-500/20 px-2 py-1 rounded-full">{{ recentAlerts.length }}</span>
            </h3>
            <button 
              @click="clearAlerts"
              class="text-xs bg-red-600/30 hover:bg-red-600/50 px-3 py-1 rounded-lg transition-colors border border-red-500/30"
            >
              Clear
            </button>
          </div>
          <div class="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
            <div 
              v-for="alert in recentAlerts" 
              :key="alert.id"
              class="bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-lg p-4 border-l-4 backdrop-blur-sm transition-all duration-200 hover:scale-105"
              :class="{
                'border-red-500': alert.severity === 'CRITICAL',
                'border-orange-500': alert.severity === 'HIGH',
                'border-yellow-500': alert.severity === 'MEDIUM',
                'border-blue-500': alert.severity === 'LOW'
              }"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium text-white">{{ alert.severity }}</p>
                  <p class="text-sm text-red-200">{{ alert.message || 'Alert triggered' }}</p>
                </div>
                <span class="text-xs text-red-300">{{ formatTime(alert.timestamp) }}</span>
              </div>
            </div>
            <div v-if="recentAlerts.length === 0" class="text-red-300 text-center py-8">
              <div class="text-4xl mb-2">🔇</div>
              No active alerts
            </div>
          </div>
        </div>

        <!-- Enhanced Live Dose Readings Stream -->
        <div class="bg-gradient-to-br from-slate-800/80 to-blue-900/80 rounded-xl p-6 border border-blue-500/30 shadow-xl backdrop-blur-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-blue-400 flex items-center">
              📊 Live Dose Readings
              <span class="ml-2 text-sm bg-blue-500/20 px-2 py-1 rounded-full">{{ recentReadings.length }}</span>
            </h3>
            <button 
              @click="clearReadings"
              class="text-xs bg-blue-600/30 hover:bg-blue-600/50 px-3 py-1 rounded-lg transition-colors border border-blue-500/30"
            >
              Clear
            </button>
          </div>
          <div class="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
            <div 
              v-for="reading in recentReadings" 
              :key="reading.id"
              class="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-lg p-4 border-l-4 backdrop-blur-sm transition-all duration-200 hover:scale-105"
              :class="{
                'border-red-500': reading.isHigh,
                'border-green-500': !reading.isHigh
              }"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium text-white">
                    {{ reading.hp10_msv }} mSv (HP10)
                  </p>
                  <p class="text-sm text-blue-200">
                    {{ reading.hp007_msv }} mSv (HP07) • {{ reading.rate_usv_h }} µSv/h
                  </p>
                  <p v-if="reading.personnel" class="text-xs text-blue-300">
                    {{ reading.personnel.rank_rate }} {{ reading.personnel.lname }}
                  </p>
                </div>
                <span class="text-xs text-blue-300">{{ formatTime(reading.timestamp) }}</span>
              </div>
            </div>
            <div v-if="recentReadings.length === 0" class="text-blue-300 text-center py-8">
              <div class="text-4xl mb-2">📊</div>
              No recent readings
            </div>
          </div>
        </div>
      </div>

      <!-- Real-time Chart -->
      <div class="mb-8">
        <RealTimeChart :readings="recentReadings" />
      </div>

      <!-- Enhanced Real-time Notifications Panel -->
      <div class="bg-gradient-to-br from-slate-800/80 to-green-900/80 rounded-xl p-6 border border-green-500/30 shadow-xl backdrop-blur-sm mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-green-400 flex items-center">
            📱 Real-time Notifications
            <span class="ml-2 text-sm bg-green-500/20 px-2 py-1 rounded-full">{{ notifications.length }}</span>
          </h3>
          <div class="flex space-x-3">
            <button 
              @click="markAllAsRead"
              class="text-xs bg-green-600/30 hover:bg-green-600/50 px-3 py-1 rounded-lg transition-colors border border-green-500/30"
            >
              Mark All Read
            </button>
            <button 
              @click="clearNotifications"
              class="text-xs bg-slate-600/30 hover:bg-slate-600/50 px-3 py-1 rounded-lg transition-colors border border-slate-500/30"
            >
              Clear
            </button>
          </div>
        </div>
        <div class="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
          <div 
            v-for="notification in notifications.slice(0, 20)" 
            :key="notification.id"
            class="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-lg p-4 border-l-4 backdrop-blur-sm transition-all duration-200 hover:scale-105"
            :class="{
              'border-red-500': notification.priority === 'high',
              'border-yellow-500': notification.priority === 'normal',
              'border-blue-500': notification.priority === 'low',
              'opacity-60': notification.read
            }"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="text-lg">{{ notification.presentation?.icon || '📱' }}</span>
                  <h4 class="font-medium text-white">{{ notification.title }}</h4>
                  <span 
                    v-if="!notification.read"
                    class="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                  ></span>
                </div>
                <p class="text-sm text-green-200 mb-2">{{ notification.message }}</p>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="action in notification.actions" 
                    :key="action.id"
                    class="text-xs bg-slate-600/50 hover:bg-slate-500/50 px-2 py-1 rounded cursor-pointer transition-colors"
                  >
                    {{ action.label }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs text-green-300">{{ formatTime(notification.createdAt) }}</span>
                <button 
                  v-if="!notification.read"
                  @click="markAsRead(notification.id)"
                  class="block mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Mark Read
                </button>
              </div>
            </div>
          </div>
          <div v-if="notifications.length === 0" class="text-green-300 text-center py-12">
            <div class="text-6xl mb-4">📱</div>
            <p class="text-lg">No notifications yet</p>
            <p class="text-sm text-green-400">Notifications will appear here in real-time</p>
          </div>
        </div>
      </div>

      <!-- Enhanced System Health Status -->
      <div class="bg-gradient-to-br from-slate-800/80 to-yellow-900/80 rounded-xl p-6 border border-yellow-500/30 shadow-xl backdrop-blur-sm mb-8">
        <h3 class="text-xl font-semibold text-yellow-400 mb-6 flex items-center">
          🏥 System Health
          <span class="ml-2 text-sm bg-yellow-500/20 px-2 py-1 rounded-full">Live</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
            <div class="text-3xl mb-3">🔌</div>
            <p class="text-sm text-yellow-200">WebSocket</p>
            <p class="text-lg font-semibold" :class="wsStatusClass">{{ wsStatus }}</p>
          </div>
          <div class="text-center bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
            <div class="text-3xl mb-3">🗄️</div>
            <p class="text-sm text-yellow-200">Database</p>
            <p class="text-lg font-semibold" :class="dbStatusClass">{{ dbStatus }}</p>
          </div>
          <div class="text-center bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
            <div class="text-3xl mb-3">📱</div>
            <p class="text-sm text-yellow-200">Notifications</p>
            <p class="text-lg font-semibold" :class="notifStatusClass">{{ notifStatus }}</p>
          </div>
        </div>
      </div>

      <!-- Enhanced Debug Information (Collapsible) -->
      <div class="bg-gradient-to-br from-slate-800/80 to-purple-900/80 rounded-xl p-6 border border-purple-500/30 shadow-xl backdrop-blur-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-purple-400 flex items-center">
            🔧 Debug Information
            <span class="ml-2 text-sm bg-purple-500/20 px-2 py-1 rounded-full">Developer</span>
          </h3>
          <button 
            @click="showDebug = !showDebug"
            class="text-sm bg-purple-600/30 hover:bg-purple-600/50 px-4 py-2 rounded-lg transition-colors border border-purple-500/30"
          >
            {{ showDebug ? 'Hide' : 'Show' }}
          </button>
        </div>
        <div v-if="showDebug" class="space-y-4 text-sm font-mono bg-slate-900/50 rounded-lg p-4 border border-slate-600/30">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <p><strong class="text-purple-400">Connection ID:</strong> <span class="text-cyan-300">{{ connectionId || 'None' }}</span></p>
              <p><strong class="text-purple-400">Server Info:</strong> <span class="text-cyan-300">{{ serverInfo ? 'Connected' : 'None' }}</span></p>
              <p><strong class="text-purple-400">Reconnect Attempts:</strong> <span class="text-cyan-300">{{ reconnectAttempts }}</span></p>
              <p><strong class="text-purple-400">Last Error:</strong> <span class="text-red-300">{{ lastError || 'None' }}</span></p>
            </div>
            <div class="space-y-2">
              <p><strong class="text-purple-400">Recent Updates:</strong> <span class="text-cyan-300">{{ recentUpdates.length }}</span></p>
              <p><strong class="text-purple-400">Notifications:</strong> <span class="text-cyan-300">{{ notifications.length }}</span></p>
              <p><strong class="text-purple-400">Alerts Count:</strong> <span class="text-cyan-300">{{ alertsCount }}</span></p>
              <p><strong class="text-purple-400">Unread:</strong> <span class="text-cyan-300">{{ unreadNotifications }}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRealtime } from '../composables/useRealtime'
import RealTimeChart from './RealTimeChart.vue'

export default {
  name: 'RealTimeMonitoringDashboard',
  components: {
    RealTimeChart
  },
  setup() {
    const realtime = useRealtime()
    
    // Local state
    const showDebug = ref(false)
    const recentAlerts = ref([])
    const recentReadings = ref([])
    const criticalAlertsCount = ref(0)
    
    // Computed properties
    const wsStatusClass = computed(() => 
      realtime.isConnected.value ? 'text-green-400' : 'text-red-400'
    )
    
    const dbStatusClass = computed(() => 
      realtime.isConnected.value ? 'text-green-400' : 'text-red-400'
    )
    
    const notifStatusClass = computed(() => 
      realtime.notifications.value.length > 0 ? 'text-green-400' : 'text-yellow-400'
    )
    
    const wsStatus = computed(() => 
      realtime.isConnected.value ? 'Connected' : 'Disconnected'
    )
    
    const dbStatus = computed(() => 
      realtime.isConnected.value ? 'Connected' : 'Disconnected'
    )
    
    const notifStatus = computed(() => 
      realtime.notifications.value.length > 0 ? 'Active' : 'Idle'
    )
    
    const lastUpdateTime = computed(() => {
      if (realtime.recentUpdates.value.length === 0) return 'Never'
      const last = realtime.recentUpdates.value[0]
      return formatTime(last.timestamp)
    })
    
    // Watchers
    watch(() => realtime.recentUpdates.value, (newUpdates) => {
      if (newUpdates.length === 0) return
      
      const latest = newUpdates[0]
      
      // Categorize updates
      if (latest.data?.type === 'ALERT_UPDATE') {
        addAlert(latest.data)
      } else if (latest.data?.type === 'READING_UPDATE') {
        addReading(latest.data)
      }
    }, { deep: true })
    
    watch(() => realtime.notifications.value, (newNotifications) => {
      if (newNotifications.length === 0) return
      
      const latest = newNotifications[0]
      
      // Count critical alerts
      criticalAlertsCount.value = newNotifications.filter(n => 
        n.priority === 'high' && n.type?.includes('CRITICAL')
      ).length
    }, { deep: true })
    
    // Methods
    const addAlert = (alertData) => {
      if (!alertData.alert) return
      
      const alert = {
        id: Date.now(),
        severity: alertData.alert.severity || 'MEDIUM',
        message: alertData.alert.message || 'Alert triggered',
        timestamp: new Date().toISOString()
      }
      
      recentAlerts.value.unshift(alert)
      
      // Keep only last 20 alerts
      if (recentAlerts.value.length > 20) {
        recentAlerts.value = recentAlerts.value.slice(0, 20)
      }
    }
    
    const addReading = (readingData) => {
      if (!readingData.reading) return
      
      const reading = {
        id: Date.now(),
        hp10_msv: readingData.reading.hp10_msv || 0,
        hp007_msv: readingData.reading.hp007_msv || 0,
        rate_usv_h: readingData.reading.rate_usv_h || 0,
        isHigh: readingData.reading.isHigh || false,
        isAnomalous: readingData.reading.isAnomalous || false,
        personnel: readingData.reading.personnel,
        timestamp: new Date().toISOString()
      }
      
      recentReadings.value.unshift(reading)
      
      // Keep only last 20 readings
      if (recentReadings.value.length > 20) {
        recentReadings.value = recentReadings.value.slice(0, 20)
      }
    }
    
    const formatTime = (timestamp) => {
      if (!timestamp) return 'Unknown'
      const date = new Date(timestamp)
      return date.toLocaleTimeString()
    }
    
    const handleRealtimeUpdate = (event) => {
      const { channel, data } = event.detail
      console.log('Real-time update received:', channel, data)
    }
    
    const handleRealtimeNotification = (event) => {
      const notification = event.detail
      console.log('Real-time notification received:', notification)
    }
    
    const requestNotificationPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        console.log('📱 Notification permission:', permission)
        return permission
      }
      return Notification.permission
    }
    
    // Lifecycle
    onMounted(() => {
      // Listen for real-time events
      window.addEventListener('realtime-update', handleRealtimeUpdate)
      window.addEventListener('realtime-notification', handleRealtimeNotification)
      
      // Request notification permissions
      requestNotificationPermission()
    })
    
    onUnmounted(() => {
      window.removeEventListener('realtime-update', handleRealtimeUpdate)
      window.removeEventListener('realtime-notification', handleRealtimeNotification)
    })
    
    return {
      ...realtime,
      showDebug,
      recentAlerts,
      recentReadings,
      criticalAlertsCount,
      wsStatusClass,
      dbStatusClass,
      notifStatusClass,
      wsStatus,
      dbStatus,
      notifStatus,
      lastUpdateTime,
      addAlert,
      addReading,
      formatTime,
      handleRealtimeUpdate,
      handleRealtimeNotification,
      requestNotificationPermission
    }
  },
  mounted() {
    // Listen for real-time events
    window.addEventListener('realtime-update', this.handleRealtimeUpdate)
    window.addEventListener('realtime-notification', this.handleRealtimeNotification)
    
    // Request notification permissions
    requestNotificationPermission()
  }
}
</script>

<style scoped>
.real-time-dashboard {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 25%, #1e40af 50%, #3730a3 75%, #581c87 100%);
}

/* Enhanced custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #3b82f6, #06b6d4);
  border-radius: 4px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #2563eb, #0891b2);
}

/* Enhanced animations for new items */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.recent-alerts > div:first-child,
.recent-readings > div:first-child {
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced pulse animation for connection status */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.connection-status.connecting .w-3 {
  animation: pulse 2s infinite;
}

/* Glassmorphism effects */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

/* Enhanced hover effects */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced shadows */
.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

/* Gradient text */
.bg-gradient-to-r {
  background: linear-gradient(to right, var(--tw-gradient-stops));
}

.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

.text-transparent {
  color: transparent;
}
</style>
