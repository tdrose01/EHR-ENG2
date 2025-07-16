<template>
  <div class="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Exposure Heatmap Dashboard</h1>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div>
          <label for="metric" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Metric Type</label>
          <select id="metric" v-model="selectedMetric" @change="fetchHeatmapData" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="noise">Noise</option>
            <option value="air_quality">Air Quality (PM2.5)</option>
            <option value="heat_stress">Heat Stress (WBGT)</option>
          </select>
        </div>
        <div>
          <label for="location" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
          <select id="location" v-model="selectedLocation" @change="fetchHeatmapData" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="ENGINE_ROOM">Engine Room</option>
            <option value="CIWS_COMPARTMENT">CIWS Compartment</option>
            <option value="BERTHING_01">Berthing 01</option>
          </select>
        </div>
        <div>
          <label for="date" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
          <input type="date" id="date" v-model="selectedDate" @change="fetchHeatmapData" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
        </div>
      </div>

      <!-- Heatmap Display -->
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4" style="min-height: 600px;">
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-10">
          <p class="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading Heatmap Data...</p>
        </div>
        <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-red-100/80 z-10">
          <p class="text-lg font-semibold text-red-700">{{ error }}</p>
        </div>
        
        <div ref="heatmapContainer" class="relative w-full h-full" :style="{ backgroundImage: `url(${deckPlanImage})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }">
          <heatmapjs-vue :options="heatmapOptions" :data="heatmapData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import HeatmapjsVue from 'vue-heatmapjs';
import deckPlanImage from '../assets/deck_plan_placeholder.png'; // Placeholder image

// --- State ---
const selectedMetric = ref('noise');
const selectedLocation = ref('ENGINE_ROOM');
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const heatmapData = ref([]);
const loading = ref(false);
const error = ref(null);
const heatmapContainer = ref(null);

// --- Heatmap Configuration ---
const heatmapOptions = ref({
  radius: 50,
  maxOpacity: 0.6,
  minOpacity: 0.1,
  blur: 0.75,
});

// --- Methods ---
const fetchHeatmapData = async () => {
  loading.value = true;
  error.value = null;
  heatmapData.value = [];

  try {
    const startDate = `${selectedDate.value}T00:00:00Z`;
    const endDate = `${selectedDate.value}T23:59:59Z`;
    
    const url = new URL('/api/exposures', window.location.origin);
    url.searchParams.append('metric_type', selectedMetric.value);
    url.searchParams.append('location_code', selectedLocation.value);
    url.searchParams.append('start_date', startDate);
    url.searchParams.append('end_date', endDate);
    url.searchParams.append('limit', 500); // Fetch up to 500 points for the heatmap

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch exposure data.');
    }
    const result = await response.json();
    
    if (result.data.length === 0) {
      error.value = 'No data available for the selected filters.';
      return;
    }

    // Transform data for heatmap.js
    // This requires a mapping from location_code subsections to x/y coordinates.
    // For this example, we'll generate random coordinates within the container.
    const containerWidth = heatmapContainer.value?.clientWidth || 800;
    const containerHeight = heatmapContainer.value?.clientHeight || 600;

    heatmapData.value = result.data.map(item => ({
      x: Math.floor(Math.random() * containerWidth),
      y: Math.floor(Math.random() * containerHeight),
      value: item.value,
    }));

  } catch (err) {
    error.value = err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// --- Lifecycle ---
onMounted(() => {
  fetchHeatmapData();
});

// Watch for container resize to adjust heatmap points (optional but good for responsiveness)
watch(heatmapContainer, (newEl) => {
  if (newEl) {
    const resizeObserver = new ResizeObserver(() => {
      // Re-fetch or re-calculate positions on resize
      fetchHeatmapData();
    });
    resizeObserver.observe(newEl);
  }
});

</script>

<style scoped>
/* Ensure the heatmap canvas overlays the container correctly */
.heatmap-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
