<template>
  <form @submit.prevent="handleSubmit" class="grid grid-cols-2 gap-4">
    <!-- Basic Information -->
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">First Name</label>
      <input
        type="text"
        v-model="form.fname"
        required
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Last Name</label>
      <input
        type="text"
        v-model="form.lname"
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

    <!-- Unit Assignment -->
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

    <!-- Status -->
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Status</label>
      <select
        v-model="form.active"
        required
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700"
      >
        <option :value="true">Active</option>
        <option :value="false">Inactive</option>
      </select>
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
        fname: '',
        lname: '',
        rank_rate: '',
        edipi: '',
        unit_id: '',
        active: true
      }
    }
  },
  watch: {
    personnel: {
      immediate: true,
      handler(value) {
        if (value) {
          // Map the personnel data to form fields
          this.form = {
            fname: value.fname || '',
            lname: value.lname || '',
            rank_rate: value.rank_rate || '',
            edipi: value.edipi || '',
            unit_id: value.unit_id || '',
            active: value.active !== undefined ? value.active : true
          }
        } else {
          // Reset form for new personnel
          this.form = {
            fname: '',
            lname: '',
            rank_rate: '',
            edipi: '',
            unit_id: '',
            active: true
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
