<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Water Quality Testing</h1>
    <div class="mb-4">
      <button @click="showForm = !showForm" class="px-4 py-2 bg-blue-600 text-white rounded">
        {{ showForm ? 'Cancel' : 'Add New Test' }}
      </button>
    </div>
    <div v-if="showForm">
      <WaterTestForm @saved="fetchWaterTests" @cancel="showForm = false" />
    </div>
    <div class="mt-4">
      <h2 class="text-xl font-bold mb-2">Recent Tests</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th class="py-2 px-4 border-b">Timestamp</th>
              <th class="py-2 px-4 border-b">Location</th>
              <th class="py-2 px-4 border-b">Value</th>
              <th class="py-2 px-4 border-b">Unit</th>
              <th class="py-2 px-4 border-b">Qualifier</th>
              <th class="py-2 px-4 border-b">pH</th>
              <th class="py-2 px-4 border-b">Turbidity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="test in tests" :key="test.sample_id">
              <td class="py-2 px-4 border-b">{{ new Date(test.timestamp_utc).toLocaleString() }}</td>
              <td class="py-2 px-4 border-b">{{ test.location_code }}</td>
              <td class="py-2 px-4 border-b">{{ test.value }}</td>
              <td class="py-2 px-4 border-b">{{ test.unit }}</td>
              <td class="py-2 px-4 border-b">{{ test.qualifier }}</td>
              <td class="py-2 px-4 border-b">{{ test.ph }}</td>
              <td class="py-2 px-4 border-b">{{ test.turbidity_ntu }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import WaterTestForm from '../components/WaterTestForm.vue';

export default {
  name: 'WaterTesting',
  components: {
    WaterTestForm,
  },
  data() {
    return {
      showForm: false,
      tests: [],
    };
  },
  methods: {
    async fetchWaterTests() {
      try {
        const res = await fetch('/api/water-tests');
        if (res.ok) {
          this.tests = await res.json();
          this.showForm = false;
        } else {
          console.error('Error fetching water tests', await res.text());
        }
      } catch (err) {
        console.error('Error fetching water tests', err);
      }
    },
  },
  created() {
    this.fetchWaterTests();
  },
};
</script>
