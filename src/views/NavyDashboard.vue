<template>
  <div class="min-h-screen bg-black text-white py-10 px-4 relative">
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <svg class="animate-spin h-10 w-10 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>
    <div v-if="error" class="max-w-7xl mx-auto mt-20 p-6 border border-red-500 text-red-400 rounded bg-gray-900 text-center">
      {{ error }}
    </div>
    <div v-else>
    <!-- Title -->
    <div class="max-w-7xl mx-auto mb-8">
      <h1 class="text-4xl font-bold text-blue-300 mb-2">Navy Environmental Health Tracker</h1>
      <div class="text-lg text-gray-400">
        Location: {{ overview.location }} &bull; Unit: {{ overview.unit }}
      </div>
    </div>

    <!-- Overview Panel -->
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
      <div class="bg-gray-900 rounded-2xl shadow p-6 flex flex-col items-center">
        <div class="text-2xl font-bold text-blue-400">{{ overview.personnelMonitored }}</div>
        <div class="text-gray-300 mt-1">Personnel Monitored</div>
      </div>
      <div class="bg-gray-900 rounded-2xl shadow p-6 flex flex-col items-center">
        <div class="text-2xl font-bold text-yellow-400">{{ overview.incidentsThisMonth }}</div>
        <div class="text-gray-300 mt-1">Incidents This Month</div>
      </div>
      <div class="bg-gray-900 rounded-2xl shadow p-6 flex flex-col items-center">
        <div class="text-2xl font-bold text-pink-400">{{ overview.pendingTests }}</div>
        <div class="text-gray-300 mt-1">Pending Tests</div>
      </div>
      <div class="bg-gray-900 rounded-2xl shadow p-6 flex flex-col items-center">
        <div class="text-2xl font-bold text-red-400">{{ overview.recentAlerts }}</div>
        <div class="text-gray-300 mt-1">Recent Alerts</div>
      </div>
      <div class="bg-gray-900 rounded-2xl shadow p-6 flex flex-col items-center">
        <div class="text-2xl font-bold text-green-400">{{ overview.unit }}</div>
        <div class="text-gray-300 mt-1">Unit/Command</div>
      </div>
    </div>

    <!-- Exposure Event Log -->
    <div class="max-w-7xl mx-auto mb-10">
      <h2 class="text-2xl font-bold text-blue-200 mb-4">Exposure Event Log</h2>
      <div class="overflow-x-auto rounded-2xl shadow">
        <table class="min-w-full bg-gray-900 text-white">
          <thead>
            <tr class="bg-gray-800 text-blue-300">
              <th class="px-4 py-2">Date</th>
              <th class="px-4 py-2">Event</th>
              <th class="px-4 py-2">Type</th>
              <th class="px-4 py-2">Location</th>
              <th class="px-4 py-2">Exposure Level</th>
              <th class="px-4 py-2">Affected Personnel</th>
              <th class="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in exposureEvents" :key="row.date + row.event">
              <td class="px-4 py-2">{{ row.date }}</td>
              <td class="px-4 py-2">{{ row.event }}</td>
              <td class="px-4 py-2">{{ row.type }}</td>
              <td class="px-4 py-2">{{ row.location }}</td>
              <td class="px-4 py-2" :class="row.exposure_level === 'High' ? 'text-red-400 font-bold' : row.exposure_level === 'Moderate' ? 'text-yellow-400 font-bold' : ''">{{ row.exposure_level }}</td>
              <td class="px-4 py-2">{{ row.affected_personnel }}</td>
              <td class="px-4 py-2">{{ row.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Biological Test Results -->
    <div class="max-w-7xl mx-auto mb-10">
      <h2 class="text-2xl font-bold text-blue-200 mb-4">Biological Test Results</h2>
      <div class="flex flex-wrap gap-4 mb-2">
        <input type="text" placeholder="Filter by Test Type" class="bg-gray-800 rounded px-4 py-2 text-white placeholder-gray-400" />
        <input type="text" placeholder="Filter by Site" class="bg-gray-800 rounded px-4 py-2 text-white placeholder-gray-400" />
        <select class="bg-gray-800 rounded px-4 py-2 text-white">
          <option>All Statuses</option>
          <option>Flagged</option>
          <option>Normal</option>
        </select>
        <button class="bg-blue-600 text-white px-4 py-2 rounded shadow">Attach PDF</button>
      </div>
      <div class="overflow-x-auto rounded-2xl shadow">
        <table class="min-w-full bg-gray-900 text-white">
          <thead>
            <tr class="bg-gray-800 text-blue-300">
              <th class="px-4 py-2">Name</th>
              <th class="px-4 py-2">Test Type</th>
              <th class="px-4 py-2">Sample Date</th>
              <th class="px-4 py-2">Result</th>
              <th class="px-4 py-2">Reference Range</th>
              <th class="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in bioTests" :key="row.name + row.test_type + row.sample_date">
              <td class="px-4 py-2">{{ row.name }}</td>
              <td class="px-4 py-2">{{ row.test_type }}</td>
              <td class="px-4 py-2">{{ row.sample_date }}</td>
              <td class="px-4 py-2" :class="row.status === 'Flagged' ? 'text-red-400 font-bold' : row.status === 'Normal' ? 'text-green-400 font-bold' : ''">{{ row.result }}</td>
              <td class="px-4 py-2">{{ row.reference_range }}</td>
              <td class="px-4 py-2" :class="row.status === 'Flagged' ? 'text-red-400 font-bold' : row.status === 'Normal' ? 'text-green-400 font-bold' : ''">{{ row.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Medical Surveillance Compliance -->
    <div class="max-w-7xl mx-auto mb-10">
      <h2 class="text-2xl font-bold text-blue-200 mb-4">Medical Surveillance Compliance</h2>
      <div class="overflow-x-auto rounded-2xl shadow">
        <table class="min-w-full bg-gray-900 text-white">
          <thead>
            <tr class="bg-gray-800 text-blue-300">
              <th class="px-4 py-2">Personnel</th>
              <th class="px-4 py-2">NEC</th>
              <th class="px-4 py-2">Required Surveillance</th>
              <th class="px-4 py-2">Last Exam</th>
              <th class="px-4 py-2">Next Due</th>
              <th class="px-4 py-2">Compliant</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in medSurveillance" :key="row.personnel + row.required_exam">
              <td class="px-4 py-2">{{ row.personnel }}</td>
              <td class="px-4 py-2">{{ row.nec }}</td>
              <td class="px-4 py-2">{{ row.required_exam }}</td>
              <td class="px-4 py-2">{{ row.last_exam }}</td>
              <td class="px-4 py-2">{{ row.next_due }}</td>
              <td class="px-4 py-2" :class="row.compliant ? 'text-green-400 font-bold' : 'text-red-400 font-bold'">{{ row.compliant ? '✅' : '❌' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-2 text-sm text-gray-400">🔔 Reminders & auto-email alerts for overdue exams (coming soon)</div>
    </div>

    <!-- Deployment Environmental Logs -->
    <div class="max-w-7xl mx-auto mb-10">
      <h2 class="text-2xl font-bold text-blue-200 mb-4">Deployment Environmental Logs</h2>
      <div class="overflow-x-auto rounded-2xl shadow">
        <table class="min-w-full bg-gray-900 text-white">
          <thead>
            <tr class="bg-gray-800 text-blue-300">
              <th class="px-4 py-2">Deployment</th>
              <th class="px-4 py-2">Dates</th>
              <th class="px-4 py-2">Exposure Type</th>
              <th class="px-4 py-2">Monitoring Type</th>
              <th class="px-4 py-2">Results Available</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in deploymentLogs" :key="row.deployment + row.dates">
              <td class="px-4 py-2">{{ row.deployment }}</td>
              <td class="px-4 py-2">{{ row.dates }}</td>
              <td class="px-4 py-2">{{ row.exposure_type }}</td>
              <td class="px-4 py-2">{{ row.monitoring_type }}</td>
              <td class="px-4 py-2" :class="row.results_available ? 'text-green-400 font-bold' : 'text-red-400 font-bold'">{{ row.results_available ? '✅' : '❌' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const overview = ref({
  location: '',
  unit: '',
  personnelMonitored: 0,
  incidentsThisMonth: 0,
  pendingTests: 0,
  recentAlerts: ''
})
const exposureEvents = ref([])
const bioTests = ref([])
const medSurveillance = ref([])
const deploymentLogs = ref([])
const isLoading = ref(true)
const error = ref(null)

async function fetchAll() {
  isLoading.value = true
  error.value = null
  try {
    const [ov, ev, bt, ms, dl] = await Promise.all([
      fetch('/api/navy/overview').then(r => r.json()),
      fetch('/api/navy/exposure-events').then(r => r.json()),
      fetch('/api/navy/bio-tests').then(r => r.json()),
      fetch('/api/navy/med-surveillance').then(r => r.json()),
      fetch('/api/navy/deployment-logs').then(r => r.json()),
    ])
    overview.value = ov
    exposureEvents.value = ev
    bioTests.value = bt
    medSurveillance.value = ms
    deploymentLogs.value = dl
  } catch (e) {
    console.error(e)
    error.value = 'Failed to fetch Navy dashboard data.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchAll)
</script> 