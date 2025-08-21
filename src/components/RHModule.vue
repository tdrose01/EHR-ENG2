<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Navigation Bar -->
    <nav class="bg-green-800 text-white shadow-lg border-b border-green-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold">Radiation Health Module</h1>
          </div>
          <div class="flex items-center space-x-4">
            <router-link 
              to="/" 
              class="text-green-200 hover:text-white transition-colors"
            >
              <i class="fas fa-home mr-2"></i>
              Back to Main
            </router-link>
            <button 
              @click="logout" 
              class="text-green-200 hover:text-white transition-colors"
            >
              <i class="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-4">
          Welcome to Radiation Health Module
        </h2>
        <p class="text-lg text-gray-300">
          Specialized radiation monitoring and dosimetry system for Navy personnel
        </p>
      </div>

      <!-- Single Radiation Dashboard Card -->
      <div class="flex justify-center">
        <div class="bg-gray-900 rounded-lg shadow-lg p-8 max-w-2xl w-full border border-gray-700">
          <div class="text-center">
            <div class="text-6xl mb-4">☢️</div>
            <h3 class="text-2xl font-bold text-red-400 mb-4">
              Radiation Dashboard
            </h3>
            <p class="text-gray-300 mb-6">
              Personal dosimeter monitoring and dose reconciliation system.
            </p>
            <router-link 
              to="/radiation-dashboard"
              class="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Dashboard
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RHModule',
  methods: {
    logout() {
      // Clear any stored authentication data
      localStorage.removeItem('user')
      // Redirect to login
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #374151;
}

::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style> 