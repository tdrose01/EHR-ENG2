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
                class="group bg-gradient-to-br from-gray-900 to-blue-900/20 rounded-xl shadow-xl p-4 sm:p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 border border-gray-700 hover:border-blue-500/50 min-h-[180px] flex flex-col justify-between relative overflow-hidden"
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">👥</div>
                  <div class="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h2 class="text-xl sm:text-2xl font-semibold text-blue-400 mb-3 transition-colors duration-200 group-hover:text-blue-300">Patient Management</h2>
                  <p class="text-gray-300 text-sm sm:text-base transition-colors duration-200 group-hover:text-gray-200">Access and manage patient records.</p>
                </div>
                <div class="mt-4 flex justify-end">
                  <button class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base">
                    Go to Patients
                  </button>
                </div>
                <!-- Subtle background animation -->
                <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <!-- Environmental Dashboard Card -->
              <div
                @click="navigateTo('/environmental-dashboard')"
                class="group bg-gradient-to-br from-gray-900 to-green-900/20 rounded-xl shadow-xl p-4 sm:p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 border border-gray-700 hover:border-green-500/50 min-h-[180px] flex flex-col justify-between relative overflow-hidden"
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">🌍</div>
                  <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h2 class="text-xl sm:text-2xl font-semibold text-green-400 mb-3 transition-colors duration-200 group-hover:text-green-300">Environmental Dashboard</h2>
                  <p class="text-gray-300 text-sm sm:text-base transition-colors duration-200 group-hover:text-gray-200">Monitor and analyze environmental data and trends.</p>
                </div>
                <div class="mt-4 flex justify-end">
                  <button class="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base">
                    Go to Dashboard
                  </button>
                </div>
                <!-- Subtle background animation -->
                <div class="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <!-- Radiation Health Module Card -->
              <div
                @click="navigateTo('/radiation-dashboard')"
                class="group bg-gradient-to-br from-gray-900 to-purple-900/20 rounded-xl shadow-xl p-4 sm:p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 border border-gray-700 hover:border-purple-500/50 min-h-[180px] flex flex-col justify-between relative overflow-hidden"
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">☢️</div>
                  <div class="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h2 class="text-xl sm:text-2xl font-semibold text-purple-400 mb-3 transition-colors duration-200 group-hover:text-purple-300">Radiation Health</h2>
                  <p class="text-gray-300 text-sm sm:text-base transition-colors duration-200 group-hover:text-gray-200">Personal dosimeter monitoring & dose reconciliation.</p>
                </div>
                <div class="mt-4 flex justify-end">
                  <button class="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base">
                    Go to Radiation Dashboard
                  </button>
                </div>
                <!-- Subtle background animation -->
                <div class="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <!-- System Monitoring Card -->
              <div
                @click="navigateTo('/monitoring-dashboard')"
                class="group bg-gradient-to-br from-gray-900 to-emerald-900/20 rounded-xl shadow-xl p-4 sm:p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 border border-gray-700 hover:border-emerald-500/50 min-h-[180px] flex flex-col justify-between relative overflow-hidden"
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">📊</div>
                  <div class="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h2 class="text-xl sm:text-2xl font-semibold text-emerald-400 mb-3 transition-colors duration-200 group-hover:text-emerald-300">System Monitoring</h2>
                  <p class="text-gray-300 text-sm sm:text-base transition-colors duration-200 group-hover:text-gray-200">Real-time system health, performance metrics, and alerting.</p>
                </div>
                <div class="mt-4 flex justify-end">
                  <button class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base">
                    Go to Monitoring
                  </button>
                </div>
                <!-- Subtle background animation -->
                <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <!-- Admin Backup & Restore Module -->
              <div v-if="isAdmin" class="group bg-gradient-to-br from-gray-900 to-amber-900/20 rounded-xl shadow-xl p-4 sm:p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20 border border-gray-700 hover:border-amber-500/50 min-h-[180px] flex flex-col justify-between relative overflow-hidden">
                <div class="flex items-center justify-between mb-4">
                  <div class="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">💾</div>
                  <div class="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-amber-400 mb-3 transition-colors duration-200 group-hover:text-amber-300">Database Backup & Restore</h3>
                  <p class="text-sm text-gray-300 transition-colors duration-200 group-hover:text-gray-200">Create encrypted backups and restore database</p>
                </div>
                <div class="mt-4 flex justify-end">
                  <button
                    @click="navigateTo('/admin/backup-restore')"
                    class="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base"
                  >
                    Access Backup System
                  </button>
                </div>
                <!-- Subtle background animation -->
                <div class="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <!-- User Management Module -->
              <div v-if="isAdmin" class="group bg-gradient-to-br from-gray-900 to-indigo-900/20 rounded-xl shadow-xl p-4 sm:p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 border border-gray-700 hover:border-indigo-500/50 min-h-[180px] flex flex-col justify-between relative overflow-hidden">
                <div class="flex items-center justify-between mb-4">
                  <div class="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">👤</div>
                  <div class="w-3 h-3 bg-indigo-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-indigo-400 mb-3 transition-colors duration-200 group-hover:text-indigo-300">User Management</h3>
                  <p class="text-sm text-gray-300 transition-colors duration-200 group-hover:text-gray-200">Create, edit, and manage system users and roles</p>
                </div>
                <div class="mt-4 flex justify-end">
                  <button
                    @click="navigateTo('/admin/users')"
                    class="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base"
                  >
                    Manage Users
                  </button>
                </div>
                <!-- Subtle background animation -->
                <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

<style scoped>
/* Enhanced card animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

/* Staggered animation for cards */
.grid > div {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.grid > div:nth-child(1) { animation-delay: 0.1s; }
.grid > div:nth-child(2) { animation-delay: 0.2s; }
.grid > div:nth-child(3) { animation-delay: 0.3s; }
.grid > div:nth-child(4) { animation-delay: 0.4s; }
.grid > div:nth-child(5) { animation-delay: 0.5s; }
.grid > div:nth-child(6) { animation-delay: 0.6s; }

/* Enhanced hover effects */
.group:hover {
  transform: translateY(-2px);
}

/* Smooth transitions */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced shadows */
.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

.group:hover .shadow-xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* Glassmorphism effects */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

/* Button animations */
button {
  position: relative;
  overflow: hidden;
}

button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

button:hover::before {
  left: 100%;
}

/* Pulse animation for status indicators */
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

.animate-pulse {
  animation: pulse 2s infinite;
}

/* Enhanced scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #3b82f6, #06b6d4);
  border-radius: 4px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #2563eb, #0891b2);
}
</style>
