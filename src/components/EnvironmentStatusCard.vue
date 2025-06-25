<template>
  <div
    @click="openModal"
    class="p-4 bg-white dark:bg-gray-700 rounded shadow cursor-pointer flex justify-between items-center hover:shadow-lg"
  >
    <div>
      <p class="text-lg font-semibold">{{ environment.name }}</p>
      <p class="text-sm text-gray-500 dark:text-gray-300">{{ formattedDate }}</p>
    </div>
    <span :class="['w-3 h-3 rounded-full', statusColor]"></span>
  </div>

  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white dark:bg-gray-700 p-4 rounded shadow w-80">
      <h2 class="text-xl font-semibold mb-2">{{ environment.name }} Details</h2>
      <p class="mb-1"><strong>Status:</strong> {{ details.status }}</p>
      <p class="mb-1"><strong>API Version:</strong> {{ details.api_version }}</p>
      <p class="mb-1"><strong>Database:</strong> {{ details.db_status }}</p>
      <p class="mb-3"><strong>Uptime:</strong> {{ details.uptime_seconds }}s</p>
      <button
        @click="show = false"
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  environment: { type: Object, required: true }
})

const show = ref(false)
const details = ref({ ...props.environment })

const formattedDate = computed(() =>
  new Date(props.environment.last_check).toLocaleString()
)

const statusColor = computed(() => {
  const status = props.environment.status
  if (status === 'Online') return 'bg-green-500'
  if (status === 'Degraded') return 'bg-yellow-500'
  return 'bg-red-500'
})

const openModal = async () => {
  try {
    const res = await fetch(`/api/environments/${props.environment.id}`)
    if (res.ok) {
      details.value = await res.json()
    }
  } catch (err) {
    console.error('Error loading environment details', err)
  } finally {
    show.value = true
  }
}
</script>

<style scoped></style>
