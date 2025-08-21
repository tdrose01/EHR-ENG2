<template>
  <div class="min-h-screen bg-black flex items-center justify-center text-white">
    <div class="max-w-2xl w-full mx-4">
      <div class="flex justify-between items-baseline mb-4">
        <h1 class="text-3xl font-bold text-white">Select Module</h1>
        <div class="text-right">
          <span class="font-medium text-white">{{ userEmail }}</span>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- EH Module Card -->
        <div
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
        </div>

        <!-- RH Module Card -->
        <div
          @click="goToModule('RH')"
          class="bg-gray-900 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105 border border-gray-700"
        >
          <h2 class="text-2xl font-semibold text-green-400 mb-3">RH Module</h2>
          <p class="text-gray-300">Resource and Hospital Management</p>
          <div class="mt-4 flex justify-end">
            <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
              Select RH
            </button>
          </div>
        </div>

      <!-- Agent Dashboard Card -->
        <div
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModuleSelection',
  computed: {
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
    }
  }
}
</script>
