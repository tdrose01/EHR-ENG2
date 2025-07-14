<template>
  <form @submit.prevent="submit" class="grid grid-cols-1 gap-4 mt-4">
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Lead (ppm)</label>
      <input type="number" step="0.001" v-model.number="lead" class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Arsenic (ppm)</label>
      <input type="number" step="0.001" v-model.number="arsenic" class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
    </div>
    <div>
      <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">Status</label>
      <select v-model="status" class="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700">
        <option value="Safe">Safe</option>
        <option value="Moderate">Moderate</option>
        <option value="Unsafe">Unsafe</option>
      </select>
    </div>
    <div class="flex justify-end">
      <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Add Test</button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'WaterTestForm',
  props: {
    patientId: { type: Number, required: true }
  },
  data() {
    return { lead: null, arsenic: null, status: 'Safe' }
  },
  methods: {
    async submit() {
      const res = await fetch(`/api/patients/${this.patientId}/water-tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead: this.lead, arsenic: this.arsenic, status: this.status })
      })
      if (res.ok) {
        this.lead = null
        this.arsenic = null
        this.status = 'Safe'
        this.$emit('saved')
      } else {
        console.error('Failed to save water test', await res.text())
      }
    }
  }
}
</script>

<style scoped></style>
