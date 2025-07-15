<template>
  <div class="bg-gray-800 rounded p-6 shadow flex flex-col text-gray-100">
    <div v-if="loading" class="text-gray-400">Loading...</div>
    <div v-else-if="error" class="text-red-400">{{ error }}</div>
    <div v-else>
      <h3 class="text-xl font-semibold text-blue-300 mb-2">⚕️ {{ patient.first_name }} {{ patient.last_name }}</h3>
      <p class="mb-1"><span class="font-semibold">Gender:</span> {{ patient.gender }}</p>
      <p class="mb-1"><span class="font-semibold">Paygrade:</span> {{ patient.paygrade }}</p>
      <p class="mb-1"><span class="font-semibold">Branch:</span> {{ patient.branch_of_service }}</p>
      <p class="mb-1"><span class="font-semibold">DoD ID:</span> {{ patient.dod_id }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  patientId: { type: Number, required: true }
})

const patient = ref(null)
const loading = ref(true)
const error = ref('')

async function fetchPatient() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`/api/patients/${props.patientId}`)
    if (!res.ok) throw new Error('Failed to fetch patient')
    patient.value = await res.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchPatient)
</script>

<style scoped></style>
