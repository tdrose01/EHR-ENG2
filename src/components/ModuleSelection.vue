<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Header with user info and logout -->
    <div class="bg-gray-900 shadow-lg border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-white">🏥 Navy EHR System</h1>
          <div class="flex items-center">
            <span class="text-sm text-gray-300 mr-4">{{ userEmail }}</span>
            <button
              @click="logout"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="py-10">
      <div class="max-w-2xl mx-auto px-4">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Select Module</h1>
          <p class="text-gray-400">Choose a module to access system features</p>
        </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- EH Module Card - Hidden as requested -->
        <!-- <div
          @click="goToModule('EH')"
          class="bg-gray-900 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105 border border-gray-700"
        >
          <h2 class="text-2xl font-semibold text-blue-400 mb-3">⚕️ EH Module</h2>
          <p class="text-gray-300">Electronic Health Records Management</p>
          <div class="mt-4 flex justify-end">
            <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              Select EH
            </button>
          </div>
        </div> -->

        <!-- RH Module Card -->
        <div
          @click="goToModule('RH')"
          class="bg-gray-900 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105 border border-gray-700"
        >
          <h2 class="text-2xl font-semibold text-green-400 mb-3">🏥 RH Module</h2>
          <p class="text-gray-300">Resource and Hospital Management</p>
          <div class="mt-4 flex justify-end">
            <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
              Select RH
            </button>
          </div>
        </div>

        <!-- Patient Management Card -->
        <div
          @click="navigateTo('/patients')"
          class="bg-gray-900 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105 border border-gray-700"
        >
          <h2 class="text-2xl font-semibold text-blue-400 mb-3">👥 Patient Management</h2>
          <p class="text-gray-300">Access and manage patient records</p>
          <div class="mt-4 flex justify-end">
            <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              Go to Patients
            </button>
          </div>
        </div>

        <!-- System Monitoring Card -->
        <div
          @click="navigateTo('/monitoring-dashboard')"
          class="bg-gray-900 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105 border border-gray-700"
        >
          <h2 class="text-2xl font-semibold text-green-400 mb-3">📊 System Monitoring</h2>
          <p class="text-gray-300">Real-time system health and performance metrics</p>
          <div class="mt-4 flex justify-end">
            <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
              Go to Monitoring
            </button>
          </div>
        </div>

        <!-- System Status Card -->
        <div
          @click="navigateTo('/status')"
          class="bg-gray-900 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105 border border-gray-700"
        >
          <h2 class="text-2xl font-semibold text-yellow-400 mb-3">⚡ System Status</h2>
          <p class="text-gray-300">View system health and operational status</p>
          <div class="mt-4 flex justify-end">
            <button class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors">
              Check Status
            </button>
          </div>
        </div>

        <!-- User Management Card (Admin Only) -->
        <div
          v-if="isAdmin"
          @click="navigateTo('/admin/users')"
          class="bg-gray-900 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105 border border-gray-700"
        >
          <h2 class="text-2xl font-semibold text-blue-400 mb-3">👤 User Management</h2>
          <p class="text-gray-300">Create, edit, and manage system users and roles</p>
          <div class="mt-4 flex justify-end">
            <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              Manage Users
            </button>
          </div>
        </div>

        <!-- Backup & Restore Card (Admin Only) -->
        <div
          v-if="isAdmin"
          @click="navigateTo('/admin/backup-restore')"
          class="bg-gray-900 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105 border border-gray-700"
        >
          <h2 class="text-2xl font-semibold text-purple-400 mb-3">💾 Backup & Restore</h2>
          <p class="text-gray-300">Create encrypted backups and restore database</p>
          <div class="mt-4 flex justify-end">
            <button class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors">
              Access Backup
            </button>
          </div>
        </div>

        <!-- Settings Card (Admin Only) -->
        <div
          v-if="isAdmin"
          @click="navigateTo('/settings')"
          class="bg-gray-900 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105 border border-gray-700"
        >
          <h2 class="text-2xl font-semibold text-gray-400 mb-3">⚙️ Settings</h2>
          <p class="text-gray-300">Configure system settings and preferences</p>
          <div class="mt-4 flex justify-end">
            <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">
              Go to Settings
            </button>
          </div>
        </div>

      <!-- Agent Dashboard Card - Hidden as requested -->
        <!-- <div
          @click="goToAgentDashboard"
          class="bg-gray-900 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105 md:col-span-2 border border-gray-700"
        >
          <h2 class="text-2xl font-semibold text-purple-400 mb-3">🤖 Agent Dashboard</h2>
          <p class="text-gray-300">Monitor and trigger agent workflows</p>
          <div class="mt-4 flex justify-end">
            <button class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors">
              Go to Dashboard
            </button>
          </div>
        </div> -->
      </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ModuleSelection',
  computed: {
    isAdmin() {
      return localStorage.getItem('userRole') === 'admin'
    },
    userEmail() {
      return localStorage.getItem('userEmail') || ''
    },
    lastLogin() {
      const ts = localStorage.getItem('lastLoginAt')
      if (!ts) return ''
      const date = new Date(ts)
      return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    }
  },
  methods: {
    goToModule(module) {
      let path = ""
      if (module === "EH") path = "/eh-module"
      else if (module === "RH") path = "/rh-module"
      this.$router.push(path)
    },
    goToAgentDashboard() {
      this.$router.push('/agent-dashboard');
    },
    navigateTo(path) {
      this.$router.push(path)
    },
    logout() {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('lastLoginAt')
      localStorage.removeItem('adminPassword')
      this.$router.push('/')
    }
  }
}
</script>
