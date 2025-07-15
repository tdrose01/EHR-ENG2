<template>
  <div class="bg-gray-800 p-4 rounded-lg shadow">
    <h3 class="text-lg font-semibold text-blue-300 mb-2">Water Quality Chart</h3>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  waterQuality: {
    type: Object,
    required: true
  }
})

const chartData = computed(() => ({
  labels: ['Lead', 'Arsenic'],
  datasets: [
    {
      label: 'Water Contaminants',
      backgroundColor: ['#D0021B', '#BD10E0'],
      data: [props.waterQuality.lead, props.waterQuality.arsenic]
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#9CA3AF'
      },
      grid: {
        color: '#4B5563'
      }
    },
    x: {
      ticks: {
        color: '#9CA3AF'
      },
      grid: {
        display: false
      }
    }
  }
}
</script>
