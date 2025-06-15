<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div v-if="!selectedModule" class="max-w-2xl w-full mx-4">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">Select Module</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- EH Module Card -->
        <div 
          @click="selectModule('EH')"
          class="bg-white rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105"
        >
          <h2 class="text-2xl font-semibold text-blue-600 mb-3">EH Module</h2>
          <p class="text-gray-600">Electronic Health Records Management</p>
          <div class="mt-4 flex justify-end">
            <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              Select EH
            </button>
          </div>
        </div>

        <!-- RH Module Card -->
        <div 
          @click="selectModule('RH')"
          class="bg-white rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105"
        >
          <h2 class="text-2xl font-semibold text-green-600 mb-3">RH Module</h2>
          <p class="text-gray-600">Resource and Hospital Management</p>
          <div class="mt-4 flex justify-end">
            <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
              Select RH
            </button>
          </div>
        </div>
      </div>
    </div>
    <PatientDashboard v-else />
  </div>
</template>

<script>
import PatientDashboard from './PatientDashboard.vue'

export default {
  name: 'ModuleSelection',
  components: { PatientDashboard },
  data() {
    return {
      selectedModule: null
    }
  },
  methods: {
    selectModule(module) {
      this.selectedModule = module
    }
  }
}
</script>
