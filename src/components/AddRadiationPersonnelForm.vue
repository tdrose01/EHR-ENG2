<template>
  <form @submit.prevent="handleSubmit" class="grid grid-cols-2 gap-4">
    <!-- Basic Information -->
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">First Name</label>
      <input
        type="text"
        v-model="form.first_name"
        required
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Last Name</label>
      <input
        type="text"
        v-model="form.last_name"
        required
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
    
    <!-- Military Information -->
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Rank/Rate</label>
      <select
        v-model="form.rank_rate"
        required
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700"
      >
        <option value="">Select Rank/Rate</option>
        <option value="E1">E1 - Seaman Recruit</option>
        <option value="E2">E2 - Seaman Apprentice</option>
        <option value="E3">E3 - Seaman</option>
        <option value="E4">E4 - Petty Officer 3rd Class</option>
        <option value="E5">E5 - Petty Officer 2nd Class</option>
        <option value="E6">E6 - Petty Officer 1st Class</option>
        <option value="E7">E7 - Chief Petty Officer</option>
        <option value="E8">E8 - Senior Chief Petty Officer</option>
        <option value="E9">E9 - Master Chief Petty Officer</option>
        <option value="O1">O1 - Ensign</option>
        <option value="O2">O2 - Lieutenant (Junior Grade)</option>
        <option value="O3">O3 - Lieutenant</option>
        <option value="O4">O4 - Lieutenant Commander</option>
        <option value="O5">O5 - Commander</option>
        <option value="O6">O6 - Captain</option>
      </select>
    </div>
    
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">EDIPI</label>
      <input
        type="text"
        v-model="form.edipi"
        required
        placeholder="10-digit EDIPI"
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>

    <!-- Radiation Health Specific Fields -->
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Unit</label>
      <select
        v-model="form.unit_id"
        required
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700"
      >
        <option value="">Select Unit</option>
        <option v-for="unit in units" :key="unit.id" :value="unit.id">
          {{ unit.name }}
        </option>
      </select>
    </div>

    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Radiation Category</label>
      <select
        v-model="form.radiation_category"
        required
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700"
      >
        <option value="">Select Category</option>
        <option value="CAT1">Category 1 - High Risk</option>
        <option value="CAT2">Category 2 - Medium Risk</option>
        <option value="CAT3">Category 3 - Low Risk</option>
        <option value="CAT4">Category 4 - Minimal Risk</option>
      </select>
    </div>

    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Monitoring Frequency</label>
      <select
        v-model="form.monitoring_frequency"
        required
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700"
      >
        <option value="">Select Frequency</option>
        <option value="DAILY">Daily</option>
        <option value="WEEKLY">Weekly</option>
        <option value="MONTHLY">Monthly</option>
        <option value="QUARTERLY">Quarterly</option>
      </select>
    </div>

    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Last Medical Exam</label>
      <input
        type="date"
        v-model="form.last_medical_exam"
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>

    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Next Medical Due</label>
      <input
        type="date"
        v-model="form.next_medical_due"
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>

    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Dosimeter Type</label>
      <select
        v-model="form.dosimeter_type"
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700"
      >
        <option value="">Select Dosimeter</option>
        <option value="TLD">TLD - Thermoluminescent</option>
        <option value="OSL">OSL - Optically Stimulated Luminescence</option>
        <option value="EPD">EPD - Electronic Personal Dosimeter</option>
        <option value="BETA">Beta Dosimeter</option>
      </select>
    </div>

    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Status</label>
      <select
        v-model="form.active"
        required
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700"
      >
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>

    <!-- Notes -->
    <div class="col-span-2">
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Notes</label>
      <textarea
        v-model="form.notes"
        rows="3"
        placeholder="Additional notes about this personnel..."
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      ></textarea>
    </div>

    <!-- Action Buttons -->
    <div class="col-span-2 flex justify-end mt-4">
      <button 
        type="button" 
        @click="$emit('cancel')" 
        class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded mr-2 hover:bg-gray-300 dark:hover:bg-gray-500"
      >
        Cancel
      </button>
      <button 
        type="submit" 
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {{ personnel ? 'Update' : 'Add' }} Personnel
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'AddRadiationPersonnelForm',
  props: {
    personnel: {
      type: Object,
      default: null
    },
    units: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: {
        first_name: '',
        last_name: '',
        rank_rate: '',
        edipi: '',
        unit_id: '',
        radiation_category: '',
        monitoring_frequency: '',
        last_medical_exam: '',
        next_medical_due: '',
        dosimeter_type: '',
        active: true,
        notes: ''
      }
    }
  },
  watch: {
    personnel: {
      immediate: true,
      handler(value) {
        if (value) {
          this.form = { ...value }
          // Convert dates to YYYY-MM-DD format for input fields
          if (this.form.last_medical_exam) {
            this.form.last_medical_exam = new Date(this.form.last_medical_exam).toISOString().split('T')[0]
          }
          if (this.form.next_medical_due) {
            this.form.next_medical_due = new Date(this.form.next_medical_due).toISOString().split('T')[0]
          }
        }
      }
    }
  },
  methods: {
    async handleSubmit() {
      try {
        const url = this.personnel && this.personnel.id
          ? `/api/radiation/personnel/${this.personnel.id}`
          : '/api/radiation/personnel'
        const method = this.personnel && this.personnel.id ? 'PUT' : 'POST'
        
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        })
        
        if (res.ok) {
          this.$emit('saved')
        } else {
          const errorText = await res.text()
          console.error('Error saving personnel:', errorText)
          this.$emit('error', errorText)
        }
      } catch (err) {
        console.error('Error saving personnel:', err)
        this.$emit('error', err.message)
      }
    }
  }
}
</script>
