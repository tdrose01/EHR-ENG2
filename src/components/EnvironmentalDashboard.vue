<template>
  <div class="bg-gray-700 rounded-lg shadow-lg p-8 mb-8">
    <h2 class="text-3xl font-bold text-blue-400 mb-2">Environmental Dashboard</h2>
    <p class="text-lg text-gray-200 mb-6">Monitor and analyze environmental data and trends.</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Air Quality Card -->
      <div class="bg-gray-800 rounded p-6 shadow flex flex-col">
        <h3 class="text-xl font-semibold text-blue-300 mb-2">Air Quality</h3>
        <div class="mb-2">PM2.5: <span class="font-mono">{{ data.airQuality.pm25 }}</span></div>
        <div class="mb-2">PM10: <span class="font-mono">{{ data.airQuality.pm10 }}</span></div>
        <div class="mb-2">O₃: <span class="font-mono">{{ data.airQuality.o3 }}</span></div>
        <div>Status: <span :class="statusColor(data.airQuality.status)">{{ data.airQuality.status }}</span></div>
      </div>
      <!-- Water Quality Card -->
      <div class="bg-gray-800 rounded p-6 shadow flex flex-col">
        <h3 class="text-xl font-semibold text-blue-300 mb-2">Water Quality</h3>
        <div class="mb-2">Lead: <span class="font-mono">{{ data.waterQuality.lead }}</span></div>
        <div class="mb-2">Arsenic: <span class="font-mono">{{ data.waterQuality.arsenic }}</span></div>
        <div>Status: <span :class="statusColor(data.waterQuality.status)">{{ data.waterQuality.status }}</span></div>
      </div>
    </div>
    <div class="mt-6 text-gray-400 text-sm">Last updated: {{ new Date(data.lastUpdated).toLocaleString() }}</div>
    <PatientCard :patient-id="1" class="mt-6" />
    <!-- Chart placeholder: Add chart here in the future -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PatientCard from './PatientCard.vue'

const data = ref({
  airQuality: {},
  waterQuality: {},
  lastUpdated: ''
})
const loading = ref(true)
const error = ref('')

function statusColor(status) {
  if (status === 'Good' || status === 'Safe') return 'text-green-400 font-bold'
  if (status === 'Moderate') return 'text-yellow-400 font-bold'
  return 'text-red-400 font-bold'
}

async function fetchEnvironmentalData() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api/environmental/latest')
    if (!res.ok) throw new Error('Failed to fetch environmental data')
    data.value = await res.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchEnvironmentalData)
</script>

<style scoped></style>
