<template>
  <div class="container mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">
    <button
      @click="$router.back()"
      class="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Back
    </button>
    <h2 class="text-2xl font-semibold mb-4">Patient Details</h2>
    <div v-if="patient" class="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
      <p class="mb-2"><span class="font-bold">Name:</span> {{ patient.first_name }} {{ patient.last_name }}</p>
      <p class="mb-2"><span class="font-bold">Gender:</span> {{ patient.gender }}</p>
      <p class="mb-2"><span class="font-bold">Blood Type:</span> {{ patient.blood_type }}</p>
      <p class="mb-2"><span class="font-bold">RH Factor:</span> {{ patient.rh_factor }}</p>
      <p class="mb-2"><span class="font-bold">Duty Status:</span> {{ patient.duty_status }}</p>
      <p class="mb-2"><span class="font-bold">Paygrade:</span> {{ patient.paygrade }}</p>
      <p class="mb-2"><span class="font-bold">Branch:</span> {{ patient.branch_of_service }}</p>
      <p class="mb-2"><span class="font-bold">Ethnicity:</span> {{ patient.ethnicity }}</p>
      <p class="mb-2"><span class="font-bold">Religion:</span> {{ patient.religion }}</p>
      <p class="mb-2"><span class="font-bold">DoD ID:</span> {{ patient.dod_id }}</p>
      <p class="mb-2"><span class="font-bold">PID:</span> {{ patient.pid }}</p>
      <p class="mb-2"><span class="font-bold">Date of Birth:</span> {{ formatDate(patient.date_of_birth) }}</p>
      <p class="mb-2"><span class="font-bold">Phone:</span> {{ displayPhone(patient.phone_number) }}</p>
    </div>
  </div>
</template>

<script>
import { formatPhoneNumber } from '../utils/formatters'
export default {
  name: 'PatientView',
  data() {
    return {
      patient: null
    }
  },
  async mounted() {
    const { id } = this.$route.params
    try {
      const res = await fetch(`/api/patients/${id}`)
      if (res.ok) {
        this.patient = await res.json()
      } else {
        console.error('Failed to fetch patient', await res.text())
      }
    } catch (err) {
      console.error('Failed to fetch patient', err)
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    displayPhone(number) {
      return formatPhoneNumber(number)
    }
  }
}
</script>
