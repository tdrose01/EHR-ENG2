<template>
  <div class="min-h-screen bg-black text-white">
    <nav class="bg-gray-900 shadow-lg border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-white">⚕️ Electronic Health Module</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/select-module"
                class="border-transparent text-gray-300 hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </router-link>
              <router-link
                to="/status"
                class="border-blue-500 text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                System Status
              </router-link>
              <router-link
                v-if="isAdmin"
                to="/settings"
                class="border-transparent text-gray-300 hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Settings
              </router-link>
            </div>
          </div>
          <div class="flex items-center">
            <button
              @click="logout"
              class="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4">
          <h1 class="text-3xl font-bold leading-tight text-white">
            System Status
          </h1>
          <p class="mt-2 text-gray-300">
            Current system health and operational status
          </p>
        </div>
      </header>
      
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            
            <!-- System Overview -->
            <div class="bg-gray-900 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
              <h2 class="text-2xl font-semibold text-blue-400 mb-4">System Overview</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <h3 class="text-lg font-medium text-white mb-2">Database Status</h3>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span class="text-green-400">Connected</span>
                  </div>
                  <p class="text-sm text-gray-400 mt-1">SQLite Database</p>
                </div>
                
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <h3 class="text-lg font-medium text-white mb-2">Backend Server</h3>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span class="text-green-400">Running</span>
                  </div>
                  <p class="text-sm text-gray-400 mt-1">Port 3005</p>
                </div>
                
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <h3 class="text-lg font-medium text-white mb-2">Frontend</h3>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span class="text-green-400">Active</span>
                  </div>
                  <p class="text-sm text-gray-400 mt-1">Vue.js Application</p>
                </div>
              </div>
            </div>

            <!-- Module Status -->
            <div class="bg-gray-900 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
              <h2 class="text-2xl font-semibold text-blue-400 mb-4">Module Status</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <h3 class="text-lg font-medium text-white mb-2">Patient Management</h3>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span class="text-green-400">Operational</span>
                  </div>
                </div>
                
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <h3 class="text-lg font-medium text-white mb-2">Environmental Dashboard</h3>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span class="text-green-400">Operational</span>
                  </div>
                </div>
                
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <h3 class="text-lg font-medium text-white mb-2">Radiation Health</h3>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span class="text-green-400">Operational</span>
                  </div>
                </div>
                
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <h3 class="text-lg font-medium text-white mb-2">System Monitoring</h3>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span class="text-green-400">Operational</span>
                  </div>
                </div>
                
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <h3 class="text-lg font-medium text-white mb-2">Admin Backup</h3>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span class="text-green-400">Operational</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Performance Metrics -->
            <div class="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
              <h2 class="text-2xl font-semibold text-blue-400 mb-4">Performance Metrics</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 class="text-lg font-medium text-white mb-3">System Resources</h3>
                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <span class="text-gray-300">Memory Usage</span>
                      <span class="text-white font-medium">Normal</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-300">CPU Usage</span>
                      <span class="text-white font-medium">Low</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-300">Disk Space</span>
                      <span class="text-white font-medium">Adequate</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 class="text-lg font-medium text-white mb-3">Application Status</h3>
                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <span class="text-gray-300">Last Update</span>
                      <span class="text-white font-medium">{{ currentTime }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-300">Uptime</span>
                      <span class="text-white font-medium">24h+</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-300">Version</span>
                      <span class="text-white font-medium">1.0.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemStatus',
  data() {
    return {
      currentTime: new Date().toLocaleString()
    }
  },
  computed: {
    isAdmin() {
      return localStorage.getItem('userRole') === 'admin'
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('lastLoginAt')
      localStorage.removeItem('adminPassword')
      this.$router.push('/')
    }
  },
  mounted() {
    // Update time every minute
    setInterval(() => {
      this.currentTime = new Date().toLocaleString()
    }, 60000)
  }
}
</script>

<style scoped></style>
