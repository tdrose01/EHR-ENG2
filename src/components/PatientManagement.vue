<template>
  <div class="container mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">
    <!-- Search and Add New Patient -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex-1 max-w-md">
        <input
          type="text"
          v-model="searchQuery"
          @input="handleSearch"
          placeholder="Search patients..."
          class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        @click="openAddPatientModal"
        class="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add Patient
      </button>
    </div>

    <!-- Patients List -->
    <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 dark:bg-gray-600">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gender</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">DOB</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Insurance</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
          <tr v-for="patient in patients" :key="patient.id" :class="{ 'bg-gray-50 dark:bg-gray-600': !patient.is_active }">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ patient.first_name }} {{ patient.last_name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-gray-100">{{ patient.gender }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-gray-100">{{ formatDate(patient.date_of_birth) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-gray-100">{{ patient.phone_number }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-gray-100">
                {{ patient.insurance_provider }}
                <span class="text-gray-500 dark:text-gray-300">({{ patient.insurance_id }})</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

    <!-- Add/Edit Patient Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-700">
        <div class="mt-3">
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
            {{ editingPatient ? 'Edit Patient' : 'Add New Patient' }}
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
                v-model="patientForm.phone_number"
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

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-700">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">Confirm Delete</h3>
        <p class="text-sm text-gray-500 dark:text-gray-300">
          Are you sure you want to delete {{ deletePatient?.first_name }} {{ deletePatient?.last_name }}?
          This action cannot be undone.
        </p>
        <div class="flex justify-end mt-6">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 mr-2"
          >
            Cancel
          </button>
          <button
            @click="deletePatientRecord"
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
export default {
  name: 'PatientManagement',
  data() {
    return {
      patients: [],
      searchQuery: '',
      showModal: false,
      showDeleteModal: false,
      editingPatient: null,
      deletePatient: null,
      patientForm: this.getEmptyPatientForm(),
      searchTimeout: null
    }
  },
  methods: {
    getEmptyPatientForm() {
      return {
        first_name: '',
        last_name: '',
        gender: '',
        date_of_birth: '',
        phone_number: '',
        insurance_provider: '',
        insurance_id: '',
        is_active: true
      }
    },
    async fetchPatients() {
      try {
        const response = await fetch('/api/patients')
        const data = await response.json()
        this.patients = data
      } catch (error) {
        console.error('Error fetching patients:', error)
      }
    },
    async handleSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(async () => {
        if (this.searchQuery.trim()) {
          try {
            const response = await fetch(`/api/patients/search/${this.searchQuery}`)
            const data = await response.json()
            this.patients = data
          } catch (error) {
            console.error('Error searching patients:', error)
          }
        } else {
          this.fetchPatients()
        }
      }, 300)
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },
    openAddPatientModal() {
      this.editingPatient = null
      this.patientForm = this.getEmptyPatientForm()
      this.showModal = true
    },
    editPatient(patient) {
      this.editingPatient = patient
      this.patientForm = { ...patient }
      this.patientForm.date_of_birth = new Date(patient.date_of_birth).toISOString().split('T')[0]
      this.showModal = true
    },
    async savePatient() {
      try {
        const url = this.editingPatient
          ? `/api/patients/${this.editingPatient.id}`
          : '/api/patients'
        
        const response = await fetch(url, {
          method: this.editingPatient ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.patientForm)
        })

        if (response.ok) {
          this.closeModal()
          this.fetchPatients()
        } else {
          console.error('Error saving patient:', await response.text())
        }
      } catch (error) {
        console.error('Error saving patient:', error)
      }
    },
    confirmDelete(patient) {
      this.deletePatient = patient
      this.showDeleteModal = true
    },
    async deletePatientRecord() {
      try {
        const response = await fetch(`/api/patients/${this.deletePatient.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          this.showDeleteModal = false
          this.fetchPatients()
        } else {
          console.error('Error deleting patient:', await response.text())
        }
      } catch (error) {
        console.error('Error deleting patient:', error)
      }
    },
    closeModal() {
      this.showModal = false
      this.editingPatient = null
      this.patientForm = this.getEmptyPatientForm()
    }
  },
  mounted() {
    this.fetchPatients()
  }
}
</script> 