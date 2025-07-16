<template>
  <div class="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
    <div class="max-w-full mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">Exposure Data Explorer</h1>
        <button @click="exportToPDF" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd" />
          </svg>
          Export to PDF
        </button>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div>
          <label for="metric" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Metric Type</label>
          <select id="metric" v-model="filters.metric_type" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="">All</option>
            <option value="noise">Noise</option>
            <option value="air_quality">Air Quality</option>
            <option value="heat_stress">Heat Stress</option>
            <option value="water">Water Quality</option>
            <option value="radiation">Radiation</option>
            <option value="voc">VOC</option>
          </select>
        </div>
        <div>
          <label for="location" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Location Code</label>
          <input type="text" id="location" v-model="filters.location_code" placeholder="e.g., ENGINE_ROOM" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
        </div>
        <div>
          <label for="start-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
          <input type="date" id="start-date" v-model="filters.start_date" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
        </div>
        <div>
          <button @click="applyFilters" class="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md">Apply Filters</button>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div v-if="loading" class="p-8 text-center text-gray-600 dark:text-gray-300">Loading data...</div>
        <div v-else-if="error" class="p-8 text-center text-red-600">{{ error }}</div>
        <div v-else-if="exposures.length === 0" class="p-8 text-center text-gray-600 dark:text-gray-300">No data found for the selected filters.</div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th v-for="header in headers" :key="header.value" @click="sortBy(header.value)" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">
                  {{ header.text }}
                  <span v-if="sortKey === header.value">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="item in exposures" :key="item.sample_id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ new Date(item.timestamp_utc).toLocaleString() }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ item.location_code }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ item.device_id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ item.value }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ item.unit }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="getQualifierClass(item.qualifier)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ item.qualifier }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="!loading && pagination.total_pages > 1" class="px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Page {{ pagination.current_page }} of {{ pagination.total_pages }} ({{ pagination.total_records }} records)
          </p>
          <div class="flex-1 flex justify-end">
            <button @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page <= 1" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
            <button @click="changePage(pagination.current_page + 1)" :disabled="pagination.current_page >= pagination.total_pages" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- State ---
const exposures = ref([]);
const pagination = ref({});
const loading = ref(false);
const error = ref(null);
const sortKey = ref('timestamp_utc');
const sortOrder = ref('desc');

const filters = reactive({
  metric_type: '',
  location_code: '',
  start_date: '',
  page: 1,
  limit: 15,
});

const headers = [
  { text: 'Timestamp', value: 'timestamp_utc' },
  { text: 'Location', value: 'location_code' },
  { text: 'Device ID', value: 'device_id' },
  { text: 'Value', value: 'value' },
  { text: 'Unit', value: 'unit' },
  { text: 'Qualifier', value: 'qualifier' },
];

// --- Methods ---
const fetchData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const url = new URL('/api/exposures', window.location.origin);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch data.');
    
    const result = await response.json();
    exposures.value = result.data;
    pagination.value = result.pagination;

  } catch (err) {
    error.value = err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  filters.page = 1;
  fetchData();
};

const changePage = (newPage) => {
  if (newPage > 0 && newPage <= pagination.value.total_pages) {
    filters.page = newPage;
    fetchData();
  }
};

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  // Note: The current backend API doesn't support sorting.
  // This is a client-side sort for the current page.
  exposures.value.sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    
    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
};

const getQualifierClass = (qualifier) => {
  switch (qualifier) {
    case 'OK': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'ALERT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'OVER_LIMIT': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'PENDING': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.text("Exposure Data Report", 14, 16);

  const tableColumn = headers.map(h => h.text);
  const tableRows = exposures.value.map(item => {
    return headers.map(header => {
      if (header.value === 'timestamp_utc') {
        return new Date(item[header.value]).toLocaleString();
      }
      return item[header.value];
    });
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  });

  const date = new Date().toISOString().split('T')[0];
  doc.save(`exposure_report_${date}.pdf`);
};

// --- Lifecycle ---
onMounted(() => {
  fetchData();
});
</script>
