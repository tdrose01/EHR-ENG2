<template>
  <div class="container mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold">⚕️ Patients</h2>
      <button
        @click="openAddModal"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Patient
      </button>
    </div>

    <div v-if="loading" data-test="loading">Loading...</div>
    <div v-else-if="error" data-test="error" class="text-red-500">{{ error }}</div>
    <div v-else-if="patients.length === 0" data-test="empty">No patients found</div>
    <div v-else class="bg-white dark:bg-gray-700 shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 dark:bg-gray-600">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Gender</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Paygrade</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Branch</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">DOB</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Phone</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">DoD Id</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
          <tr v-for="patient in patients" :key="patient.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ patient.first_name }} {{ patient.last_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ patient.gender }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ patient.paygrade }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ patient.branch_of_service }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(patient.date_of_birth) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ displayPhone(patient.phone_number) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="viewPatient(patient)"
                class="text-green-600 hover:text-green-900 mr-4"
              >
                View
              </button>
              <button
                @click="editPatient(patient)"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                Edit
              </button>
              <button
                @click="confirmDelete(patient)"
                class="text-red-600 hover:text-red-900"
              >
                Delete
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
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Last Name</label>
              <input
                type="text"
                v-model="patientForm.last_name"
                required
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Gender</label>
              <select
                v-model="patientForm.gender"
                required
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Marital Status</label>
              <select
                v-model="patientForm.marital_status"
                required
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Paygrade</label>
              <select
                v-model="patientForm.paygrade"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="E1">E1</option>
                <option value="E2">E2</option>
                <option value="E3">E3</option>
                <option value="O1">O1</option>
                <option value="O2">O2</option>
              </select>
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Branch of Service</label>
              <select
                v-model="patientForm.branch_of_service"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="Army">Army</option>
                <option value="Navy">Navy</option>
                <option value="Air Force">Air Force</option>
                <option value="Marines">Marines</option>
                <option value="Coast Guard">Coast Guard</option>
                <option value="Space Force">Space Force</option>
              </select>
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Blood Type</label>
              <select
                v-model="patientForm.blood_type"
                required
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Date of Birth</label>
              <input
                type="date"
                v-model="patientForm.date_of_birth"
                required
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Phone Number</label>
              <input
                type="tel"
                v-model="formattedPhoneNumber"
                required
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
        <p class="text-sm mb-1"><span class="font-semibold">Paygrade:</span> {{ viewPatientData.paygrade }}</p>
        <p class="text-sm mb-1"><span class="font-semibold">Branch:</span> {{ viewPatientData.branch_of_service }}</p>
        <p class="text-sm mb-1"><span class="font-semibold">Marital Status:</span> {{ viewPatientData.marital_status }}</p>
        <p class="text-sm mb-1"><span class="font-semibold">Blood Type:</span> {{ viewPatientData.blood_type }}</p>
        <p class="text-sm mb-1"><span class="font-semibold">DOB:</span> {{ formatDate(viewPatientData.date_of_birth) }}</p>
        <p class="text-sm mb-1"><span class="font-semibold">Phone:</span> {{ displayPhone(viewPatientData.phone_number) }}</p>
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
  <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-700">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">Confirm Delete</h3>
        <p class="text-sm mb-4">Are you sure you want to delete this patient? This action cannot be undone.</p>
        <div class="flex justify-end mt-6">
          <button
            @click="closeDeleteModal"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 mr-2"
          >
            Cancel
          </button>
          <button
            @click="deletePatient"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatPhoneNumber } from '../utils/formatters'
export default {
  name: 'PatientDashboard',
  data() {
    return {
      patients: [],
      loading: false,
      error: null,
      showModal: false,
      showViewModal: false,
      showDeleteModal: false,
      editingPatient: null,
      deletingPatient: null,
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
        marital_status: '',
        blood_type: '',
        paygrade: '',
        branch_of_service: '',
        date_of_birth: '',
        phone_number: ''
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    displayPhone(number) {
      return formatPhoneNumber(number)
    },
  async fetchPatients() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch('/api/patients')
        this.patients = await res.json()
      } catch (err) {
        console.error('Error fetching patients:', err)
        this.error = 'Failed to load patients'
      } finally {
        this.loading = false
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
    },
    confirmDelete(patient) {
      this.deletingPatient = patient
      this.showDeleteModal = true
    },
    async deletePatient() {
      if (!this.deletingPatient) return
      try {
        const res = await fetch(`/api/patients/${this.deletingPatient.id}`, {
          method: 'DELETE'
        })
        if (res.ok) {
          this.closeDeleteModal()
          this.fetchPatients()
        } else {
          console.error('Error deleting patient:', await res.text())
        }
      } catch (err) {
        console.error('Error deleting patient:', err)
      }
    },
    closeDeleteModal() {
      this.showDeleteModal = false
      this.deletingPatient = null
    }
  },
  mounted() {
    this.fetchPatients()
  }
}
</script>

<style scoped>
</style>
