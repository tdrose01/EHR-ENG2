<template>
  <form @submit.prevent="handleSubmit" class="grid grid-cols-2 gap-4">
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Device ID</label>
      <input
        type="text"
        v-model="form.device_id"
        required
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Location Code</label>
      <input
        type="text"
        v-model="form.location_code"
        required
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Timestamp</label>
      <input
        type="datetime-local"
        v-model="form.timestamp_utc"
        required
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Captured By</label>
      <input
        type="text"
        v-model="form.captured_by"
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Method Code</label>
      <input
        type="text"
        v-model="form.method_code"
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Value</label>
      <input
        type="number"
        step="any"
        v-model.number="form.value"
        required
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Unit</label>
      <input
        type="text"
        v-model="form.unit"
        required
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Qualifier</label>
      <select
        v-model="form.qualifier"
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700"
      >
        <option value="OK">OK</option>
        <option value="ALERT">ALERT</option>
        <option value="OVER_LIMIT">OVER_LIMIT</option>
        <option value="PENDING">PENDING</option>
      </select>
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Sample Type</label>
      <select
        v-model="form.sample_type"
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700"
      >
        <option value="grab">Grab</option>
        <option value="composite">Composite</option>
      </select>
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Temperature (°C)</label>
      <input
        type="number"
        step="any"
        v-model.number="form.temp_c"
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Residual Chlorine (mg/L)</label>
      <input
        type="number"
        step="any"
        v-model.number="form.residual_chlorine_mg_l"
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">pH</label>
      <input
        type="number"
        step="any"
        v-model.number="form.ph"
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Turbidity (NTU)</label>
      <input
        type="number"
        step="any"
        v-model.number="form.turbidity_ntu"
        class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
    <div class="col-span-2 flex justify-end mt-4">
      <button type="button" @click="$emit('cancel')" class="px-4 py-2 bg-gray-200 rounded mr-2">Cancel</button>
      <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Add Test</button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'WaterTestForm',
  data() {
    return {
      form: {
        device_id: '',
        location_code: '',
        timestamp_utc: new Date().toISOString().slice(0, 16),
        captured_by: '',
        method_code: '',
        value: null,
        unit: 'mg/L',
        qualifier: 'OK',
        sample_type: 'grab',
        temp_c: null,
        residual_chlorine_mg_l: null,
        ph: null,
        turbidity_ntu: null,
      }
    }
  },
  methods: {
    async handleSubmit() {
      try {
        const res = await fetch('/api/water-tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        })
        if (res.ok) {
          this.$emit('saved')
        } else {
          console.error('Error saving water test', await res.text())
        }
      } catch (err) {
        console.error('Error saving water test', err)
      }
    }
  }
}
</script>