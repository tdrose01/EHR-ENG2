<template>
  <div class="max-w-2xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">System Status</h1>
    <div v-if="loading" class="text-gray-600 dark:text-gray-300">Loading...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <ul v-else class="space-y-2">
      <li class="flex items-center" v-for="(value, key) in status" :key="key">
        <span
          :class="[
            'w-3 h-3 rounded-full mr-2',
            value === 'online' ? 'bg-green-500' : 'bg-red-500'
          ]"
        />
        <span class="font-medium capitalize mr-2">{{ key }}</span>
        <span class="text-sm" :class="value === 'online' ? 'text-green-600' : 'text-red-600'">{{ value }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'SystemStatus',
  setup() {
    const status = ref({})
    const loading = ref(true)
    const error = ref('')

    const loadStatus = async () => {
      loading.value = true
      error.value = ''
      try {
        const res = await fetch('/api/v1/health/status')
        const data = await res.json()
        if (!res.ok) throw new Error()
        status.value = data
      } catch (err) {
        error.value = 'Failed to load system status'
      } finally {
        loading.value = false
      }
    }

    onMounted(loadStatus)

    return { status, loading, error }
  }
}
</script>

<style scoped></style>
