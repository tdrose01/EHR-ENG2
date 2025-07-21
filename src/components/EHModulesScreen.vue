<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
    <nav class="bg-white dark:bg-gray-700 shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">⚕️ Electronic Health Module</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/patients"
                class="border-blue-500 text-gray-900 dark:text-gray-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Patient Management
              </router-link>
              <router-link
                to="/status"
                class="border-blue-500 text-gray-900 dark:text-gray-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                System Status
              </router-link>
              <router-link
                v-if="isAdmin"
                to="/settings"
                class="border-blue-500 text-gray-900 dark:text-gray-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
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
          <h1 class="text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100">
            Welcome to Electronic Health Module
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Patient Management Card -->
              <div
                @click="navigateTo('/patients')"
                class="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105"
              >
                <h2 class="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-3">Patient Management</h2>
                <p class="text-gray-600 dark:text-gray-300">Access and manage patient records.</p>
                <div class="mt-4 flex justify-end">
                  <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                    Go to Patients
                  </button>
                </div>
              </div>
              <!-- Environmental Dashboard Card -->
              <div
                @click="navigateTo('/environmental-dashboard')"
                class="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105"
              >
                <h2 class="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-3">Environmental Dashboard</h2>
                <p class="text-gray-600 dark:text-gray-300">Monitor and analyze environmental data and trends.</p>
                <div class="mt-4 flex justify-end">
                  <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                    Go to Dashboard
                  </button>
                </div>
              </div>
              <!-- Navy EH Tracker Card -->
              <div
                @click="navigateTo('/navy-dashboard')"
                class="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105"
              >
                <h2 class="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-3">Navy EH Tracker</h2>
                <p class="text-gray-600 dark:text-gray-300">Monitor Navy environmental health and compliance.</p>
                <div class="mt-4 flex justify-end">
                  <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                    Go to Navy Dashboard
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
      localStorage.removeItem('userRole')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('lastLoginAt')
      localStorage.removeItem('adminPassword')
      this.$router.push('/')
    },
    navigateTo(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped></style>
