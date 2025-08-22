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
                class="border-transparent text-gray-300 hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                System Status
              </router-link>
              <router-link
                to="/settings"
                class="border-blue-500 text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
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
            System Settings
          </h1>
          <p class="mt-2 text-gray-300">
            Configure system preferences and application settings
          </p>
        </div>
      </header>
      
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            
            <!-- User Profile Settings -->
            <div class="bg-gray-900 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
              <h2 class="text-2xl font-semibold text-blue-400 mb-4">User Profile</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    :value="userEmail" 
                    disabled
                    class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  />
                  <p class="text-sm text-gray-400 mt-1">Your login email address</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">User Role</label>
                  <input 
                    type="text" 
                    :value="userRole" 
                    disabled
                    class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  />
                  <p class="text-sm text-gray-400 mt-1">Your current role in the system</p>
                </div>
              </div>
            </div>

            <!-- Application Settings -->
            <div class="bg-gray-900 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
              <h2 class="text-2xl font-semibold text-blue-400 mb-4">Application Settings</h2>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-medium text-white">Dark Mode</h3>
                    <p class="text-sm text-gray-400">Use dark theme for the application</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="darkMode" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-medium text-white">Auto-refresh</h3>
                    <p class="text-sm text-gray-400">Automatically refresh data every 30 seconds</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="autoRefresh" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-medium text-white">Notifications</h3>
                    <p class="text-sm text-gray-400">Show system notifications and alerts</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="notifications" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- System Configuration -->
            <div class="bg-gray-900 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
              <h2 class="text-2xl font-semibold text-blue-400 mb-4">System Configuration</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Database Path</label>
                  <input 
                    type="text" 
                    value="database.db" 
                    disabled
                    class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  />
                  <p class="text-sm text-gray-400 mt-1">Current database file location</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Backend Port</label>
                  <input 
                    type="text" 
                    value="3005" 
                    disabled
                    class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  />
                  <p class="text-sm text-gray-400 mt-1">Backend server port number</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Frontend Port</label>
                  <input 
                    type="text" 
                    value="5173" 
                    disabled
                    class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  />
                  <p class="text-sm text-gray-400 mt-1">Frontend development server port</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Environment</label>
                  <input 
                    type="text" 
                    value="Development" 
                    disabled
                    class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  />
                  <p class="text-sm text-gray-400 mt-1">Current application environment</p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
              <h2 class="text-2xl font-semibold text-blue-400 mb-4">Actions</h2>
              <div class="flex space-x-4">
                <button
                  @click="saveSettings"
                  class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
                <button
                  @click="resetSettings"
                  class="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Reset to Defaults
                </button>
                <button
                  @click="exportSettings"
                  class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Export Settings
                </button>
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
  name: 'Settings',
  data() {
    return {
      darkMode: true,
      autoRefresh: true,
      notifications: true
    }
  },
  computed: {
    userEmail() {
      return localStorage.getItem('userEmail') || 'Not set'
    },
    userRole() {
      return localStorage.getItem('userRole') || 'User'
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
    },
    saveSettings() {
      // Save settings to localStorage
      localStorage.setItem('darkMode', this.darkMode)
      localStorage.setItem('autoRefresh', this.autoRefresh)
      localStorage.setItem('notifications', this.notifications)
      
      // Show success message
      alert('Settings saved successfully!')
    },
    resetSettings() {
      // Reset to default values
      this.darkMode = true
      this.autoRefresh = true
      this.notifications = true
      
      // Remove from localStorage
      localStorage.removeItem('darkMode')
      localStorage.removeItem('autoRefresh')
      localStorage.removeItem('notifications')
      
      alert('Settings reset to defaults!')
    },
    exportSettings() {
      // Export current settings as JSON
      const settings = {
        darkMode: this.darkMode,
        autoRefresh: this.autoRefresh,
        notifications: this.notifications,
        userEmail: this.userEmail,
        userRole: this.userRole,
        exportDate: new Date().toISOString()
      }
      
      const dataStr = JSON.stringify(settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = 'ehr-settings.json'
      link.click()
    }
  },
  mounted() {
    // Load saved settings from localStorage
    this.darkMode = localStorage.getItem('darkMode') !== 'false'
    this.autoRefresh = localStorage.getItem('autoRefresh') !== 'false'
    this.notifications = localStorage.getItem('notifications') !== 'false'
  }
}
</script>

<style scoped></style>

