<template>
  <div class="container mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold">Patients</h2>
      <button
        @click="openAddModal"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Patient
      </button>
    </div>

    <div class="bg-white dark:bg-gray-700 shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 dark:bg-gray-600">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Gender</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">DOB</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Phone</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Insurance</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
          <tr v-for="patient in patients" :key="patient.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ patient.first_name }} {{ patient.last_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ patient.gender }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(patient.date_of_birth) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ patient.phone_number }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ patient.insurance_provider }} ({{ patient.insurance_id }})</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="viewPatient(patient)"
                class="text-green-600 hover:text-green-900 mr-4"
              >
                View
              </button>
              <button
                @click="editPatient(patient)"
                class="text-blue-600 hover:text-blue-900"
              >
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-700">
        <div class="mt-3">
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
            {{ editingPatient ? 'Edit Patient' : 'Add Patient' }}
          </h3>
          <form @submit.prevent="savePatient">
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">First Name</label>
              <input
                type="text"
                v-model="patientForm.first_name"
                required
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Last Name</label>
              <input
                type="text"
                v-model="patientForm.last_name"
                required
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Gender</label>
              <select
                v-model="patientForm.gender"
                required
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Date of Birth</label>
              <input
                type="date"
                v-model="patientForm.date_of_birth"
                required
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Phone Number</label>
              <input
                type="tel"
                v-model="formattedPhoneNumber"
                required
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Insurance Provider</label>
              <input
                type="text"
                v-model="patientForm.insurance_provider"
                required
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Insurance ID</label>
              <input
                type="text"
                v-model="patientForm.insurance_id"
                required
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="flex justify-end mt-6">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {{ editingPatient ? 'Update' : 'Add' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="showViewModal" class="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-700">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">Patient Details</h3>
        <p class="text-sm mb-1"><span class="font-semibold">Name:</span> {{ viewPatientData.first_name }} {{ viewPatientData.last_name }}</p>
        <p class="text-sm mb-1"><span class="font-semibold">Gender:</span> {{ viewPatientData.gender }}</p>
        <p class="text-sm mb-1"><span class="font-semibold">DOB:</span> {{ formatDate(viewPatientData.date_of_birth) }}</p>
        <p class="text-sm mb-1"><span class="font-semibold">Phone:</span> {{ viewPatientData.phone_number }}</p>
        <p class="text-sm"><span class="font-semibold">Insurance:</span> {{ viewPatientData.insurance_provider }} ({{ viewPatientData.insurance_id }})</p>
        <div class="flex justify-end mt-6">
          <button
            @click="closeViewModal"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PatientDashboard',
  data() {
    return {
      patients: [],
      showModal: false,
      showViewModal: false,
      editingPatient: null,
      viewPatientData: {},
      patientForm: this.getEmptyForm()
    }
  },
  computed: {
    formattedPhoneNumber: {
      get() {
        const digits = this.patientForm.phone_number
        if (!digits) return ''
        const cleaned = digits.replace(/\D/g, '').slice(0, 10)
        const len = cleaned.length
        if (len <= 3) return `(${cleaned}`
        if (len <= 6) return `(${cleaned.slice(0, 3)})-${cleaned.slice(3)}`
        return `(${cleaned.slice(0, 3)})-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
      },
      set(value) {
        this.patientForm.phone_number = value.replace(/\D/g, '').slice(0, 10)
      }
    }
  },
  methods: {
    getEmptyForm() {
      return {
        first_name: '',
        last_name: '',
        gender: '',
        date_of_birth: '',
        phone_number: '',
        insurance_provider: '',
        insurance_id: ''
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    async fetchPatients() {
      try {
        const res = await fetch('/api/patients')
        this.patients = await res.json()
      } catch (err) {
        console.error('Error fetching patients:', err)
      }
    },
    openAddModal() {
      this.editingPatient = null
      this.patientForm = this.getEmptyForm()
      this.showModal = true
    },
    editPatient(patient) {
      this.editingPatient = patient
      this.patientForm = { ...patient }
      this.patientForm.date_of_birth =
        new Date(patient.date_of_birth).toISOString().split('T')[0]
      this.showModal = true
    },
    async savePatient() {
      try {
        const url = this.editingPatient
          ? `/api/patients/${this.editingPatient.id}`
          : '/api/patients'
        const method = this.editingPatient ? 'PUT' : 'POST'
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.patientForm)
        })
        if (res.ok) {
          this.closeModal()
          this.fetchPatients()
        } else {
          console.error('Error saving patient:', await res.text())
        }
      } catch (err) {
        console.error('Error saving patient:', err)
      }
    },
    viewPatient(patient) {
      this.viewPatientData = patient
      this.showViewModal = true
    },
    closeModal() {
      this.showModal = false
      this.editingPatient = null
    },
    closeViewModal() {
      this.showViewModal = false
      this.viewPatientData = {}
    }
  },
  mounted() {
    this.fetchPatients()
  }
}
</script>

<style scoped>
</style>
