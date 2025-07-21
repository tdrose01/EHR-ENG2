<template>
  <div class="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Metric Trend Charts</h1>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div>
          <label for="metric" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Metric Type</label>
          <select id="metric" v-model="selectedMetric" @change="fetchChartData" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="noise">Noise (dBA)</option>
            <option value="air_quality">Air Quality (PM2.5)</option>
            <option value="heat_stress">Heat Stress (WBGT)</option>
          </select>
        </div>
        <div>
          <label for="location" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
          <select id="location" v-model="selectedLocation" @change="fetchChartData" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="ENGINE_ROOM">Engine Room</option>
            <option value="CIWS_COMPARTMENT">CIWS Compartment</option>
            <option value="BERTHING_01">Berthing 01</option>
          </select>
        </div>
        <div>
          <label for="date-range" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
          <input type="date" id="date-range" v-model="selectedDate" @change="fetchChartData" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
        </div>
      </div>

      <!-- Chart Display -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div v-if="loading" class="flex items-center justify-center h-96">
          <p class="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading Chart Data...</p>
        </div>
        <div v-else-if="error" class="flex items-center justify-center h-96 bg-red-100/80">
          <p class="text-lg font-semibold text-red-700">{{ error }}</p>
        </div>
        <Line v-else :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, TimeScale);

// --- State ---
const selectedMetric = ref('noise');
const selectedLocation = ref('ENGINE_ROOM');
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const exposureData = ref([]);
const loading = ref(false);
const error = ref(null);

// --- Specification Limits ---
const specLimits = {
  noise: { upper: 85, lower: 60 },
  air_quality: { upper: 35, lower: 0 },
  heat_stress: { upper: 32, lower: 25 },
};

// --- Chart Configuration ---
const chartData = computed(() => {
  const labels = exposureData.value.map(d => new Date(d.timestamp_utc));
  const dataPoints = exposureData.value.map(d => d.value);
  const limit = specLimits[selectedMetric.value];

  return {
    labels,
    datasets: [
      {
        label: 'Upper Spec Limit',
        data: Array(labels.length).fill(limit.upper),
        borderColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 2,
        borderDash: [10, 5],
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Metric Value',
        data: dataPoints,
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.1,
        fill: true,
      },
      {
        label: 'Lower Spec Limit',
        data: Array(labels.length).fill(limit.lower),
        borderColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 2,
        borderDash: [10, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'hour',
        tooltipFormat: 'PPpp',
      },
      title: {
        display: true,
        text: 'Timestamp',
      },
    },
    y: {
      title: {
        display: true,
        text: `Value (${specLimits[selectedMetric.value].unit || ''})`,
      },
    },
  },
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: `Exposure Trend for ${selectedMetric.value.replace('_', ' ')} in ${selectedLocation.value}`,
    },
  },
}));

// --- Methods ---
const fetchChartData = async () => {
  loading.value = true;
  error.value = null;
  exposureData.value = [];

  try {
    const startDate = `${selectedDate.value}T00:00:00Z`;
    const endDate = `${selectedDate.value}T23:59:59Z`;

    const url = new URL('/api/exposures', window.location.origin);
    url.searchParams.append('metric_type', selectedMetric.value);
    url.searchParams.append('location_code', selectedLocation.value);
    url.searchParams.append('start_date', startDate);
    url.searchParams.append('end_date', endDate);
    url.searchParams.append('limit', 1000); // Fetch up to 1000 points for the chart

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch exposure data.');
    }
    const result = await response.json();

    if (result.data.length === 0) {
      error.value = 'No data available for the selected filters.';
      return;
    }

    exposureData.value = result.data.sort((a, b) => new Date(a.timestamp_utc) - new Date(b.timestamp_utc));

  } catch (err) {
    error.value = err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// --- Lifecycle ---
onMounted(() => {
  fetchChartData();
});
</script>
