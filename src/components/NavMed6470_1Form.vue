<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-6xl mx-auto">
    <!-- Header Section -->
    <div class="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">NAVMED 6470/1</h2>
          <h3 class="text-xl text-gray-700 dark:text-gray-300 mt-1">Exposure to Ionizing Radiation</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Annual/Situational Report of Personnel Exposure</p>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-500 dark:text-gray-400">Form Version: 2024.1</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Effective Date: 01 Jan 2024</div>
        </div>
      </div>
    </div>

    <!-- Form Content -->
    <form @submit.prevent="submitForm" class="space-y-8">
      <!-- Report Type Selection -->
      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Type</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label class="flex items-center space-x-3 cursor-pointer">
            <input 
              type="radio" 
              v-model="formData.report_type" 
              value="ANNUAL" 
              class="text-blue-600 focus:ring-blue-500"
            >
            <span class="text-gray-700 dark:text-gray-300">Annual Report</span>
          </label>
          <label class="flex items-center space-x-3 cursor-pointer">
            <input 
              type="radio" 
              v-model="formData.report_type" 
              value="SITUATIONAL" 
              class="text-blue-600 focus:ring-blue-500"
            >
            <span class="text-gray-700 dark:text-gray-300">Situational Report</span>
          </label>
          <label class="flex items-center space-x-3 cursor-pointer">
            <input 
              type="radio" 
              v-model="formData.report_type" 
              value="OVER_LIMIT" 
              class="text-red-600 focus:ring-red-500"
            >
            <span class="text-red-700 dark:text-red-300 font-semibold">Over-Limit (MED 6470-2)</span>
          </label>
        </div>
      </div>

      <!-- Personnel Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Personnel * ({{ personnel.length }} available)
          </label>
          <select 
            v-model="formData.personnel_id" 
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
            :disabled="isLoadingPersonnel"
          >
            <option value="">{{ isLoadingPersonnel ? 'Loading personnel...' : 'Select Personnel' }}</option>
            <option v-for="person in personnel" :key="person.id" :value="person.id">
              {{ person.rank_rate }} {{ person.lname }}, {{ person.fname }} ({{ person.edipi }})
            </option>
          </select>
        </div>
        <div v-if="selectedPersonnel" class="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
          <h4 class="font-semibold text-blue-900 dark:text-blue-100">Selected Personnel</h4>
          <p class="text-sm text-blue-700 dark:text-blue-200">
            {{ selectedPersonnel.rank_rate }} {{ selectedPersonnel.lname }}, {{ selectedPersonnel.fname }}
          </p>
          <p class="text-sm text-blue-600 dark:text-blue-300">EDIPI: {{ selectedPersonnel.edipi }}</p>
          <p class="text-sm text-blue-600 dark:text-blue-300">Unit: {{ selectedPersonnel.unit_name }}</p>
        </div>
      </div>

      <!-- Reporting Period -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Period Start Date *
          </label>
          <input 
            type="date" 
            v-model="formData.period_start" 
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Period End Date *
          </label>
          <input 
            type="date" 
            v-model="formData.period_end" 
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Calendar Year
          </label>
          <input 
            type="number" 
            v-model="formData.calendar_year" 
            min="2020" 
            max="2030"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
        </div>
      </div>

      <!-- Dose Measurements -->
      <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dose Equivalent Measurements (mSv)</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deep Dose Equivalent
            </label>
            <input 
              type="number" 
              v-model="formData.deep_dose_msv" 
              step="0.001" 
              min="0"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Annual Limit: 20 mSv</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Shallow Dose Equivalent
            </label>
            <input 
              type="number" 
              v-model="formData.shallow_dose_msv" 
              step="0.001" 
              min="0"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Annual Limit: 50 mSv</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Extremity Dose Equivalent
            </label>
            <input 
              type="number" 
              v-model="formData.extremity_dose_msv" 
              step="0.001" 
              min="0"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Annual Limit: 500 mSv</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Internal Dose Equivalent
            </label>
            <input 
              type="number" 
              v-model="formData.internal_dose_msv" 
              step="0.001" 
              min="0"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Annual Limit: 20 mSv</p>
          </div>
        </div>
      </div>

      <!-- Over-Limit Exposure Information (Conditional) -->
      <div v-if="formData.report_type === 'OVER_LIMIT'" class="bg-red-50 dark:bg-red-900 p-6 rounded-lg border border-red-200 dark:border-red-700">
        <h3 class="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">Over-Limit Exposure Information (MED 6470-2)</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
              Limit Exceeded *
            </label>
            <select 
              v-model="formData.limit_exceeded" 
              class="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Limit Exceeded</option>
              <option value="DEEP_DOSE">Deep Dose (20 mSv)</option>
              <option value="SHALLOW_DOSE">Shallow Dose (50 mSv)</option>
              <option value="EXTREMITY_DOSE">Extremity Dose (500 mSv)</option>
              <option value="INTERNAL_DOSE">Internal Dose (20 mSv)</option>
              <option value="TOTAL_DOSE">Total Dose (Combined)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
              Discovery Date *
            </label>
            <input 
              type="date" 
              v-model="formData.discovery_date" 
              class="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              required
            >
          </div>
        </div>
        <div class="mt-4">
          <label class="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
            Exposure Circumstances *
          </label>
          <textarea 
            v-model="formData.exposure_circumstances" 
            rows="4"
            class="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
            placeholder="Describe the circumstances that led to the over-limit exposure..."
            required
          ></textarea>
        </div>
      </div>

      <!-- Certification Section -->
      <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Certification</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prepared By *
            </label>
            <input 
              type="text" 
              v-model="formData.prepared_by" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Prepared *
            </label>
            <input 
              type="date" 
              v-model="formData.date_prepared" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              RSO Signature
            </label>
            <input 
              type="text" 
              v-model="formData.rso_signature" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Command Signature
            </label>
            <input 
              type="text" 
              v-model="formData.command_signature" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
          </div>
        </div>
      </div>

      <!-- Comments -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Comments
        </label>
        <textarea 
          v-model="formData.comments" 
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Additional comments or notes..."
        ></textarea>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex space-x-3">
          <button 
            type="button" 
            @click="saveDraft"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Save Draft
          </button>
          <button 
            type="button" 
            @click="loadDraft"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Load Draft
          </button>
        </div>
        <div class="flex space-x-3">
          <button 
            type="button" 
            @click="resetForm"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Reset
          </button>
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit Report' }}
          </button>
        </div>
      </div>
    </form>

    <!-- Success/Error Messages -->
    <div v-if="message" class="mt-4 p-4 rounded-md" :class="messageType === 'success' ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200'">
      {{ message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavMed6470_1Form',
  data() {
    return {
      formData: {
        report_type: '',
        personnel_id: '',
        period_start: '',
        period_end: '',
        calendar_year: new Date().getFullYear(),
        deep_dose_msv: 0,
        shallow_dose_msv: 0,
        extremity_dose_msv: 0,
        internal_dose_msv: 0,
        limit_exceeded: '',
        discovery_date: '',
        exposure_circumstances: '',
        prepared_by: '',
        date_prepared: new Date().toISOString().split('T')[0],
        rso_signature: '',
        command_signature: '',
        comments: ''
      },
      personnel: [],
      isSubmitting: false,
      isLoadingPersonnel: true,
      message: '',
      messageType: ''
    }
  },
  computed: {
    selectedPersonnel() {
      return this.personnel.find(p => p.id === this.formData.personnel_id)
    }
  },
  async mounted() {
    await this.loadPersonnel()
    this.loadDraft()
  },
  methods: {
    async loadPersonnel() {
      try {
        this.isLoadingPersonnel = true
        const response = await fetch('/api/radiation/personnel')
        if (response.ok) {
          const data = await response.json()
          console.log('Personnel API response:', data)
          
          // Handle different response formats
          if (Array.isArray(data)) {
            this.personnel = data
          } else if (data.value && Array.isArray(data.value)) {
            this.personnel = data.value
          } else if (data.personnel && Array.isArray(data.personnel)) {
            this.personnel = data.personnel
          } else {
            this.personnel = []
          }
          
          console.log('Personnel loaded:', this.personnel.length, 'records')
          console.log('First personnel record:', this.personnel[0])
        } else {
          console.error('Failed to load personnel:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error loading personnel:', error)
      } finally {
        this.isLoadingPersonnel = false
      }
    },
    async submitForm() {
      this.isSubmitting = true
      this.message = ''
      
      try {
        // Clean up form data - convert empty strings to null for date fields
        const cleanedFormData = {
          ...this.formData,
          discovery_date: this.formData.discovery_date && this.formData.discovery_date.trim() !== '' ? this.formData.discovery_date : null,
          period_start: this.formData.period_start && this.formData.period_start.trim() !== '' ? this.formData.period_start : null,
          period_end: this.formData.period_end && this.formData.period_end.trim() !== '' ? this.formData.period_end : null,
          date_prepared: this.formData.date_prepared && this.formData.date_prepared.trim() !== '' ? this.formData.date_prepared : null
        }
        
        console.log('Submitting form data:', cleanedFormData)
        
        const response = await fetch('/api/radiation/reports/6470-1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cleanedFormData)
        })
        
        const result = await response.json()
        
        if (response.ok) {
          this.message = `Report submitted successfully! Report ID: ${result.report_id}`
          this.messageType = 'success'
          this.resetForm()
        } else {
          this.message = result.error || 'Failed to submit report'
          this.messageType = 'error'
        }
      } catch (error) {
        this.message = 'Network error. Please try again.'
        this.messageType = 'error'
        console.error('Submission error:', error)
      } finally {
        this.isSubmitting = false
      }
    },
    saveDraft() {
      localStorage.setItem('navmed_6470_1_draft', JSON.stringify(this.formData))
      this.message = 'Draft saved successfully'
      this.messageType = 'success'
      setTimeout(() => { this.message = '' }, 3000)
    },
    loadDraft() {
      const draft = localStorage.getItem('navmed_6470_1_draft')
      if (draft) {
        this.formData = { ...this.formData, ...JSON.parse(draft) }
        this.message = 'Draft loaded successfully'
        this.messageType = 'success'
        setTimeout(() => { this.message = '' }, 3000)
      }
    },
    resetForm() {
      this.formData = {
        report_type: '',
        personnel_id: '',
        period_start: '',
        period_end: '',
        calendar_year: new Date().getFullYear(),
        deep_dose_msv: 0,
        shallow_dose_msv: 0,
        extremity_dose_msv: 0,
        internal_dose_msv: 0,
        limit_exceeded: '',
        discovery_date: '',
        exposure_circumstances: '',
        prepared_by: '',
        date_prepared: new Date().toISOString().split('T')[0],
        rso_signature: '',
        command_signature: '',
        comments: ''
      }
      this.message = ''
    }
  }
}
</script>