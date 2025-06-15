<template>
  <div class="p-4">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="patient in patients"
        :key="patient.id"
        class="bg-white rounded-lg shadow p-4"
      >
        <h3 class="text-lg font-semibold mb-1">
          {{ patient.first_name }} {{ patient.last_name }}
        </h3>
        <p class="text-sm text-gray-500 mb-2">
          {{ patient.gender }} | {{ formatDate(patient.date_of_birth) }}
        </p>
        <p class="text-sm">
          <span class="font-medium">Phone:</span> {{ patient.phone_number }}
        </p>
        <p class="text-sm">
          <span class="font-medium">Insurance:</span>
          {{ patient.insurance_provider }} ({{ patient.insurance_id }})
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PatientDashboard',
  data() {
    return {
      patients: [
        {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          gender: 'Male',
          date_of_birth: '1980-01-15',
          phone_number: '555-0123',
          insurance_provider: 'Blue Cross',
          insurance_id: 'BC123456'
        },
        {
          id: 2,
          first_name: 'Jane',
          last_name: 'Smith',
          gender: 'Female',
          date_of_birth: '1992-05-22',
          phone_number: '555-0124',
          insurance_provider: 'Aetna',
          insurance_id: 'AE789012'
        },
        {
          id: 3,
          first_name: 'Alice',
          last_name: 'Johnson',
          gender: 'Female',
          date_of_birth: '1985-09-10',
          phone_number: '555-0456',
          insurance_provider: 'Cigna',
          insurance_id: 'CI234567'
        }
      ]
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    }
  }
}
</script>

<style scoped>
</style>
