<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
    <div class="max-w-2xl w-full mx-4">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Select Module</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- EH Module Card -->
        <div
          @click="goToModule('EH')"
          class="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105"
        >
          <h2 class="text-2xl font-semibold text-blue-600 mb-3">EH Module</h2>
          <p class="text-gray-600 dark:text-gray-300">Electronic Health Records Management</p>
          <div class="mt-4 flex justify-end">
            <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              Select EH
            </button>
          </div>
        </div>

        <!-- RH Module Card -->
        <div
          @click="goToModule('RH')"
          class="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105"
        >
          <h2 class="text-2xl font-semibold text-green-600 mb-3">RH Module</h2>
          <p class="text-gray-600 dark:text-gray-300">Resource and Hospital Management</p>
          <div class="mt-4 flex justify-end">
            <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
              Select RH
            </button>
          </div>
        </div>

        <!-- Exposure Dashboard Card -->
        <div
          @click="goToModule('EX')"
          class="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105"
        >
          <h2 class="text-2xl font-semibold text-purple-600 mb-3">Exposure Dashboard</h2>
          <p class="text-gray-600 dark:text-gray-300">Environmental Exposure Tracking</p>
          <div class="mt-4 flex justify-end">
            <button class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors">
              Select Exposure
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
  methods: {
    goToModule(module) {
      let path = ''
      if (module === 'EH') path = '/eh-module'
      else if (module === 'RH') path = '/rh-module'
      else path = '/exposure'
      this.$router.push(path)
    }
  }
}
</script>
