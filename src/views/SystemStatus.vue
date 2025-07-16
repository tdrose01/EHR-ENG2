<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
    <div class="max-w-3xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">System Status</h1>
        <button
          @click="loadStatus"
          :disabled="loading"
          class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            :class="{ 'animate-spin': loading }"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.899 2.186l-1.28.74a5.002 5.002 0 00-8.32-1.434V6a1 1 0 11-2 0V3a1 1 0 011-1zm12 14a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.899-2.186l1.28-.74a5.002 5.002 0 008.32 1.434V14a1 1 0 112 0v3a1 1 0 01-1 1z"
              clip-rule="evenodd"
            />
          </svg>
          {{ loading ? 'Checking...' : 'Refresh' }}
        </button>
      </div>

      <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
        <p class="font-bold">Error</p>
        <p>{{ error }}</p>
      </div>

      <div class="space-y-4">
        <div
          v-for="(service, name) in services"
          :key="name"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between transition-all duration-300 hover:shadow-xl"
        >
          <div class="flex items-center">
            <div class="p-3 rounded-full mr-4" :class="service.iconBg">
              <component :is="service.icon" class="h-6 w-6 text-white" />
            </div>
            <div>
              <p class="text-xl font-semibold text-gray-900 dark:text-gray-100">{{ service.name }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Service Status</p>
            </div>
          </div>
          <div class="flex items-center">
            <span class="text-lg font-medium capitalize" :class="service.statusClass">{{ service.status }}</span>
            <span class="ml-3 h-4 w-4 rounded-full flex items-center justify-center" :class="service.statusBgClass">
              <span class="h-2 w-2 rounded-full" :class="service.statusInnerClass"></span>
            </span>
          </div>
        </div>
      </div>
      <div class="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
        <p v-if="lastUpdated">Last checked: {{ lastUpdated }}</p>
        <p v-else>Checking status...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, shallowRef } from 'vue';

// --- Icons ---
const ApiIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  `
};

const DbIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
    </svg>
  `
};

// --- State ---
const status = ref({});
const loading = ref(true);
const error = ref('');
const lastUpdated = ref(null);

const serviceDefinitions = {
  api: { name: 'API', icon: shallowRef(ApiIcon), iconBg: 'bg-blue-500' },
  database: { name: 'Database', icon: shallowRef(DbIcon), iconBg: 'bg-green-500' }
};

// --- Computed Properties ---
const services = computed(() => {
  return Object.keys(serviceDefinitions).reduce((acc, key) => {
    const isOnline = status.value[key] === 'online';
    acc[key] = {
      ...serviceDefinitions[key],
      status: isOnline ? 'Operational' : (status.value[key] ? 'Offline' : 'Checking...'),
      statusClass: isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      statusBgClass: isOnline ? 'bg-green-200 dark:bg-green-800' : 'bg-red-200 dark:bg-red-800',
      statusInnerClass: isOnline ? 'bg-green-500 dark:bg-green-400 animate-pulse' : 'bg-red-500 dark:bg-red-400'
    };
    return acc;
  }, {});
});

// --- Methods ---
const loadStatus = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetch('/api/v1/health/status');
    if (!res.ok) {
      throw new Error(`Network response was not ok (${res.status})`);
    }
    const data = await res.json();
    status.value = data;
    lastUpdated.value = new Date().toLocaleString();
  } catch (err) {
    error.value = 'Failed to load system status. The server may be offline.';
    console.error('Health status error:', err);
    // Set all services to offline on error
    status.value = Object.keys(serviceDefinitions).reduce((acc, key) => {
      acc[key] = 'offline';
      return acc;
    }, {});
  } finally {
    loading.value = false;
  }
};

// --- Lifecycle ---
onMounted(() => {
  loadStatus();
  // Optional: set up a polling interval
  // setInterval(loadStatus, 30000); // e.g., every 30 seconds
});
</script>

<style scoped>
/* For the pulse animation on status dots */
@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>