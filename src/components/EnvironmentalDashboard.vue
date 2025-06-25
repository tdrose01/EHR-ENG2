<template>
  <div class="mt-8 space-y-8">
    <!-- Environment Status Cards -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <EnvironmentStatusCard
        v-for="env in environments"
        :key="env.id"
        :environment="env"
      />
    </section>
    <!-- Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-gray-700 p-4 rounded shadow">
        <p class="text-sm text-gray-500 dark:text-gray-300">Total Monitored Locations</p>
        <p class="text-2xl font-semibold">{{ metrics.locations }}</p>
      </div>
      <div class="bg-white dark:bg-gray-700 p-4 rounded shadow">
        <p class="text-sm text-gray-500 dark:text-gray-300">Personnel at Risk</p>
        <p class="text-2xl font-semibold">{{ metrics.personnel }}</p>
      </div>
      <div class="bg-white dark:bg-gray-700 p-4 rounded shadow">
        <p class="text-sm text-gray-500 dark:text-gray-300">Open Exposure Incidents</p>
        <p class="text-2xl font-semibold">{{ metrics.incidents }}</p>
      </div>
      <div class="bg-white dark:bg-gray-700 p-4 rounded shadow">
        <p class="text-sm text-gray-500 dark:text-gray-300">Samples Awaiting Lab Results</p>
        <p class="text-2xl font-semibold">{{ metrics.samples }}</p>
      </div>
    </div>

    <!-- Location-Based Exposure -->
    <section class="bg-white dark:bg-gray-700 p-4 rounded shadow">
      <h2 class="text-xl font-semibold mb-4">Location-Based Exposure</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm mb-1">Unit/Base Name</label>
          <select class="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800">
            <option>Main Base</option>
            <option>Forward Site</option>
          </select>
        </div>
        <div>
          <label class="block text-sm mb-1">Hazard Type</label>
          <select class="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800">
            <option>Asbestos</option>
            <option>Jet Fuel</option>
            <option>Lead</option>
          </select>
        </div>
      </div>
      <table class="w-full text-left text-sm">
        <thead>
          <tr>
            <th class="px-2 py-1">Location</th>
            <th class="px-2 py-1">Sample</th>
            <th class="px-2 py-1">Value</th>
            <th class="px-2 py-1">Threshold</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in locationSamples" :key="item.id" class="border-t">
            <td class="px-2 py-1">{{ item.location }}</td>
            <td class="px-2 py-1">{{ item.sampleType }}</td>
            <td class="px-2 py-1">{{ item.value }}</td>
            <td class="px-2 py-1">{{ item.threshold }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Individual Exposure History -->
    <section class="bg-white dark:bg-gray-700 p-4 rounded shadow">
      <h2 class="text-xl font-semibold mb-4">Individual Exposure History</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm mb-1">Service Member</label>
          <input type="text" class="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800" placeholder="Name or DoD ID" />
        </div>
      </div>
      <table class="w-full text-left text-sm">
        <thead>
          <tr>
            <th class="px-2 py-1">Deployment</th>
            <th class="px-2 py-1">Symptoms</th>
            <th class="px-2 py-1">Cumulative Score</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in exposureHistory" :key="item.id" class="border-t">
            <td class="px-2 py-1">{{ item.deployment }}</td>
            <td class="px-2 py-1">{{ item.symptoms }}</td>
            <td class="px-2 py-1">{{ item.score }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Material Safety Tracking -->
    <section class="bg-white dark:bg-gray-700 p-4 rounded shadow">
      <h2 class="text-xl font-semibold mb-4">Material Safety Tracking</h2>
      <table class="w-full text-left text-sm">
        <thead>
          <tr>
            <th class="px-2 py-1">Material</th>
            <th class="px-2 py-1">Location</th>
            <th class="px-2 py-1">Amount</th>
            <th class="px-2 py-1">Last Inspection</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in materials" :key="item.id" class="border-t">
            <td class="px-2 py-1">{{ item.name }}</td>
            <td class="px-2 py-1">{{ item.location }}</td>
            <td class="px-2 py-1">{{ item.amount }}</td>
            <td class="px-2 py-1">{{ item.inspection }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Sample Testing Logs -->
    <section class="bg-white dark:bg-gray-700 p-4 rounded shadow">
      <h2 class="text-xl font-semibold mb-4">Sample Testing Logs</h2>
      <table class="w-full text-left text-sm">
        <thead>
          <tr>
            <th class="px-2 py-1">Sample ID</th>
            <th class="px-2 py-1">Date</th>
            <th class="px-2 py-1">Type</th>
            <th class="px-2 py-1">Location</th>
            <th class="px-2 py-1">Result</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sampleLogs" :key="item.id" class="border-t">
            <td class="px-2 py-1">{{ item.id }}</td>
            <td class="px-2 py-1">{{ item.date }}</td>
            <td class="px-2 py-1">{{ item.type }}</td>
            <td class="px-2 py-1">{{ item.location }}</td>
            <td class="px-2 py-1">{{ item.result }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import EnvironmentStatusCard from './EnvironmentStatusCard.vue'
export default {
  name: 'EnvironmentalDashboard',
  components: { EnvironmentStatusCard },
  data() {
    return {
      environments: [],
      metrics: {
        locations: 3,
        personnel: 12,
        incidents: 2,
        samples: 5
      },
      locationSamples: [
        { id: 1, location: 'Main Base', sampleType: 'Air', value: '0.5 ppm', threshold: '1 ppm' },
        { id: 2, location: 'Forward Site', sampleType: 'Water', value: '3 ppb', threshold: '5 ppb' }
      ],
      exposureHistory: [
        { id: 1, deployment: '2021-2022', symptoms: 'None', score: 10 },
        { id: 2, deployment: '2020', symptoms: 'Coughing', score: 20 }
      ],
      materials: [
        { id: 1, name: 'JP-8', location: 'Hangar', amount: '200 L', inspection: '2024-04-01' },
        { id: 2, name: 'Asbestos', location: 'Storage A', amount: '50 kg', inspection: '2024-03-15' }
      ],
      sampleLogs: [
        { id: 'S-001', date: '2024-04-01', type: 'Air', location: 'Main Base', result: '0.5 ppm' },
        { id: 'S-002', date: '2024-04-05', type: 'Soil', location: 'Forward Site', result: '2 ppm' }
      ]
    }
  },
  methods: {
    async fetchEnvironments() {
      try {
        const res = await fetch('/api/environments')
        if (res.ok) {
          this.environments = await res.json()
        }
      } catch (err) {
        console.error('Failed to load environments', err)
      }
    }
  },
  mounted() {
    this.fetchEnvironments()
  }
}
</script>

<style scoped></style>
