<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white dark:bg-gray-800">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
              Device Readings - {{ device?.serial }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ device?.vendor }} {{ device?.model }}
            </p>
          </div>
          <button 
            @click="handleClose" 
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Device Info Card -->
        <div class="bg-gray-700 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span class="text-gray-400 text-sm">Firmware:</span>
              <div class="text-white font-medium">{{ device?.firmware || 'N/A' }}</div>
            </div>
            <div>
              <span class="text-gray-400 text-sm">Calibration Due:</span>
              <div class="text-white font-medium">{{ formatDate(device?.calib_due) }}</div>
            </div>
            <div>
              <span class="text-gray-400 text-sm">RF Policy:</span>
              <div class="text-white font-medium">{{ device?.rf_policy || 'N/A' }}</div>
            </div>
            <div>
              <span class="text-gray-400 text-sm">Total Readings:</span>
              <div class="text-white font-medium">{{ readings.length }}</div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-4 mb-4">
          <div class="flex-1 min-w-48">
            <label class="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
            <div class="flex gap-2">
              <input 
                v-model="filters.startDate" 
                type="date" 
                class="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input 
                v-model="filters.endDate" 
                type="date" 
                class="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div class="flex-1 min-w-48">
            <label class="block text-sm font-medium text-gray-300 mb-2">Personnel</label>
            <select 
              v-model="filters.personnelId" 
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Personnel</option>
              <option 
                v-for="person in personnel" 
                :key="person.id" 
                :value="person.id"
              >
                {{ person.rank_rate }} {{ person.lname }}, {{ person.fname }}
              </option>
            </select>
          </div>
          <div class="flex items-end">
            <button 
              @click="applyFilters"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i class="fas fa-filter mr-2"></i>Filter
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
          <div class="text-gray-400 mt-2">Loading readings...</div>
        </div>

        <!-- Readings Table -->
        <div v-else-if="filteredReadings.length > 0" class="bg-gray-800 rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-700">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date/Time</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Personnel</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">HP(10) mSv</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">HP(0.07) mSv</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rate µSv/h</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                <tr 
                  v-for="reading in paginatedReadings" 
                  :key="reading.id"
                  class="hover:bg-gray-700 transition-colors"
                >
                  <td class="px-4 py-3 text-sm text-white">
                    {{ formatDateTime(reading.measured_ts) }}
                  </td>
                  <td class="px-4 py-3 text-sm text-white">
                    <span v-if="reading.lname">{{ reading.rank_rate }} {{ reading.lname }}{{ reading.fname ? `, ${reading.fname}` : '' }}</span>
                    <span v-else class="text-gray-500 italic">No personnel assigned</span>
                  </td>
                  <td class="px-4 py-3 text-sm text-white font-mono">
                    {{ formatDose(reading.hp10_mSv) }}
                  </td>
                  <td class="px-4 py-3 text-sm text-white font-mono">
                    {{ formatDose(reading.hp007_mSv) }}
                  </td>
                  <td class="px-4 py-3 text-sm text-white font-mono">
                    {{ formatRate(reading.rate_uSv_h) }}
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <span 
                      :class="getStatusClass(reading)"
                      class="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {{ getStatusText(reading) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="bg-gray-700 px-4 py-3 flex items-center justify-between">
            <div class="text-sm text-gray-300">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredReadings.length) }} of {{ filteredReadings.length }} results
            </div>
            <div class="flex space-x-2">
              <button 
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500 transition-colors"
              >
                Previous
              </button>
              <span class="px-3 py-1 text-gray-300">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button 
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-else class="text-center py-8 text-gray-400">
          <i class="fas fa-chart-line text-4xl mb-4"></i>
          <div>No readings found</div>
          <div class="text-sm">Try adjusting your filters</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'DeviceReadingsModal',
  props: {
    device: {
      type: Object,
      required: true
    },
    personnel: {
      type: Array,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const loading = ref(false)
    const readings = ref([])
    const currentPage = ref(1)
    const itemsPerPage = 20

    const filters = ref({
      startDate: '',
      endDate: '',
      personnelId: ''
    })

    // Computed properties
    const filteredReadings = computed(() => {
      let filtered = [...readings.value]

      if (filters.value.startDate) {
        const startDate = new Date(filters.value.startDate)
        filtered = filtered.filter(reading => new Date(reading.measured_ts) >= startDate)
      }

      if (filters.value.endDate) {
        const endDate = new Date(filters.value.endDate)
        endDate.setHours(23, 59, 59, 999) // Include entire end date
        filtered = filtered.filter(reading => new Date(reading.measured_ts) <= endDate)
      }

      if (filters.value.personnelId) {
        // Find the personnel record to get the name for matching
        const selectedPersonnel = props.personnel.find(p => p.id === parseInt(filters.value.personnelId))
        if (selectedPersonnel) {
          const personnelName = `${selectedPersonnel.rank_rate} ${selectedPersonnel.lname}`
          filtered = filtered.filter(reading => {
            // If no personnel info (manual entries), don't show them when filtering by personnel
            if (!reading.lname && !reading.fname) {
              return false
            }
            // Match by personnel name since personnel_id is not available in readings
            const readingName = `${reading.rank_rate} ${reading.lname}`
            return readingName === personnelName
          })
        }
      }

      return filtered.sort((a, b) => new Date(b.measured_ts) - new Date(a.measured_ts))
    })

    const totalPages = computed(() => Math.ceil(filteredReadings.value.length / itemsPerPage))

    const paginatedReadings = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredReadings.value.slice(start, end)
    })

    // Methods
    const fetchReadings = async () => {
      if (!props.device?.id) return

      loading.value = true
      try {
        const response = await fetch(`/api/radiation/readings?device_id=${props.device.id}`)
        if (response.ok) {
          const data = await response.json()
          readings.value = data
        } else {
          console.error('Failed to fetch readings')
        }
      } catch (error) {
        console.error('Error fetching readings:', error)
      } finally {
        loading.value = false
      }
    }

    const applyFilters = () => {
      currentPage.value = 1 // Reset to first page when applying filters
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString()
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    }

    const formatDose = (value) => {
      if (value === null || value === undefined) return 'N/A'
      return parseFloat(value).toFixed(6)
    }

    const formatRate = (value) => {
      if (value === null || value === undefined) return 'N/A'
      return parseFloat(value).toFixed(2)
    }

    const getStatusClass = (reading) => {
      // Use HP(10) mSv for status determination (convert to mR: 1 mSv = 100 mR)
      const doseRate = parseFloat(reading.hp10_mSv) * 100 // Convert mSv to mR
      if (doseRate > 100) return 'bg-red-600 text-white' // High dose rate
      if (doseRate > 50) return 'bg-yellow-600 text-white' // Medium dose rate
      return 'bg-green-600 text-white' // Normal dose rate
    }

    const getStatusText = (reading) => {
      // Use HP(10) mSv for status determination (convert to mR: 1 mSv = 100 mR)
      const doseRate = parseFloat(reading.hp10_mSv) * 100 // Convert mSv to mR
      if (doseRate > 100) return 'High'
      if (doseRate > 50) return 'Medium'
      return 'Normal'
    }

    const handleClose = () => {
      emit('close')
    }

    // Watchers
    watch(() => props.visible, (newVal) => {
      if (newVal && props.device) {
        fetchReadings()
        // Reset filters when opening
        filters.value = {
          startDate: '',
          endDate: '',
          personnelId: ''
        }
        currentPage.value = 1
      }
    })

    // Lifecycle
    onMounted(() => {
      if (props.visible && props.device) {
        fetchReadings()
      }
    })

    return {
      loading,
      readings,
      currentPage,
      itemsPerPage,
      filters,
      filteredReadings,
      totalPages,
      paginatedReadings,
      fetchReadings,
      applyFilters,
      formatDateTime,
      formatDate,
      formatDose,
      formatRate,
      getStatusClass,
      getStatusText,
      handleClose
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #374151;
}

::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
