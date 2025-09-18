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
                to="/patients"
                class="border-blue-500 text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Patient Management
              </router-link>
              <router-link
                to="/status"
                class="border-blue-500 text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                System Status
              </router-link>
              <router-link
                v-if="isAdmin"
                to="/admin/users"
                class="border-blue-500 text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                User Management
              </router-link>
              <router-link
                v-if="isAdmin"
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
            Welcome to Electronic Health Module
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6 sm:py-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              <!-- Patient Management Card -->
              <div
                @click="navigateTo('/patients')"
                class="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 cursor-pointer transform transition-transform hover:scale-105 border border-gray-700 min-h-[180px] flex flex-col justify-between"
              >
                <div>
                  <h2 class="text-xl sm:text-2xl font-semibold text-blue-400 mb-3">Patient Management</h2>
                  <p class="text-gray-300 text-sm sm:text-base">Access and manage patient records.</p>
                </div>
                <div class="mt-4 flex justify-end">
                  <button class="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm sm:text-base">
                    Go to Patients
                  </button>
                </div>
              </div>
              <!-- Environmental Dashboard Card -->
              <div
                @click="navigateTo('/environmental-dashboard')"
                class="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 cursor-pointer transform transition-transform hover:scale-105 border border-gray-700 min-h-[180px] flex flex-col justify-between"
              >
                <div>
                  <h2 class="text-xl sm:text-2xl font-semibold text-blue-400 mb-3">Environmental Dashboard</h2>
                  <p class="text-gray-300 text-sm sm:text-base">Monitor and analyze environmental data and trends.</p>
                </div>
                <div class="mt-4 flex justify-end">
                  <button class="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm sm:text-base">
                    Go to Dashboard
                  </button>
                </div>
              </div>
              <!-- Radiation Health Module Card -->
              <div
                @click="navigateTo('/radiation-dashboard')"
                class="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 cursor-pointer transform transition-transform hover:scale-105 border border-gray-700 min-h-[180px] flex flex-col justify-between"
              >
                <div>
                  <h2 class="text-xl sm:text-2xl font-semibold text-purple-400 mb-3">Radiation Health</h2>
                  <p class="text-gray-300 text-sm sm:text-base">Personal dosimeter monitoring & dose reconciliation.</p>
                </div>
                <div class="mt-4 flex justify-end">
                  <button class="bg-purple-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-purple-600 transition-colors text-sm sm:text-base">
                    Go to Radiation Dashboard
                  </button>
                </div>
              </div>

              <!-- System Monitoring Card -->
              <div
                @click="navigateTo('/monitoring-dashboard')"
                class="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 cursor-pointer transform transition-transform hover:scale-105 border border-gray-700 min-h-[180px] flex flex-col justify-between"
              >
                <div>
                  <h2 class="text-xl sm:text-2xl font-semibold text-green-400 mb-3">System Monitoring</h2>
                  <p class="text-gray-300 text-sm sm:text-base">Real-time system health, performance metrics, and alerting.</p>
                </div>
                <div class="mt-4 flex justify-end">
                  <button class="bg-green-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-600 transition-colors text-sm sm:text-base">
                    Go to Monitoring
                  </button>
                </div>
              </div>

              <!-- Admin Backup & Restore Module -->
              <div v-if="isAdmin" class="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 cursor-pointer transform transition-transform hover:scale-105 border border-gray-700 min-h-[180px] flex flex-col justify-between">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4 flex-1">
                    <h3 class="text-lg font-medium text-purple-400">Database Backup & Restore</h3>
                    <p class="text-sm text-gray-300">Create encrypted backups and restore database</p>
                  </div>
                </div>
                <div class="mt-4 flex justify-end">
                  <button
                    @click="navigateTo('/admin/backup-restore')"
                    class="bg-purple-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-purple-600 transition-colors text-sm sm:text-base"
                  >
                    Access Backup System
                  </button>
                </div>
              </div>

              <!-- User Management Module -->
              <div v-if="isAdmin" class="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 cursor-pointer transform transition-transform hover:scale-105 border border-gray-700 min-h-[180px] flex flex-col justify-between">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4 flex-1">
                    <h3 class="text-lg font-medium text-blue-400">User Management</h3>
                    <p class="text-sm text-gray-300">Create, edit, and manage system users and roles</p>
                  </div>
                </div>
                <div class="mt-4 flex justify-end">
                  <button
                    @click="navigateTo('/admin/users')"
                    class="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm sm:text-base"
                  >
                    Manage Users
                  </button>
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
  name: 'EHModulesScreen',
  computed: {
    isAdmin() {
      return localStorage.getItem('userRole') === 'admin'
    },
    userEmail() {
      return localStorage.getItem('userEmail') || ''
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('authToken')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userId')
      localStorage.removeItem('lastLoginAt')
      this.$router.push('/')
    },
    navigateTo(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped></style>
