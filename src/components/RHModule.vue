<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-800 p-6 text-gray-900 dark:text-gray-100">
    <div class="max-w-7xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-green-600">Radiation Health Patient Management</h1>
        <p class="text-gray-600 dark:text-gray-300 mt-2">Manage patients for the Radiation Health module.</p>
      </header>
      
      <PatientManagement />
    </div>
  </div>
</template>

<script>
import PatientManagement from './PatientManagement.vue';

export default {
  name: 'RHModule',
  components: {
    PatientManagement
  }
}
</script> 