<template>
  <div class="real-time-chart bg-gradient-to-br from-slate-800/80 to-indigo-900/80 rounded-xl p-6 border border-indigo-500/30 shadow-xl backdrop-blur-sm">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-semibold text-indigo-400 flex items-center">
        📈 Real-Time Trends
        <span class="ml-2 text-sm bg-indigo-500/20 px-2 py-1 rounded-full">{{ dataPoints.length }}</span>
      </h3>
      <div class="flex space-x-2">
        <button 
          @click="clearChart"
          class="text-xs bg-indigo-600/30 hover:bg-indigo-600/50 px-3 py-1 rounded-lg transition-colors border border-indigo-500/30"
        >
          Clear
        </button>
        <button 
          @click="togglePause"
          class="text-xs px-3 py-1 rounded-lg transition-colors border"
          :class="isPaused ? 'bg-green-600/30 hover:bg-green-600/50 border-green-500/30' : 'bg-red-600/30 hover:bg-red-600/50 border-red-500/30'"
        >
          {{ isPaused ? '▶️ Resume' : '⏸️ Pause' }}
        </button>
      </div>
    </div>
    
    <!-- Chart Container -->
    <div class="relative">
      <!-- Chart Canvas -->
      <canvas 
        ref="chartCanvas" 
        class="w-full h-64 bg-slate-900/30 rounded-lg border border-indigo-500/20"
      ></canvas>
      
      <!-- Chart Legend -->
      <div class="flex justify-center space-x-6 mt-4">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span class="text-sm text-blue-300">HP10 (mSv)</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-cyan-500 rounded-full"></div>
          <span class="text-sm text-cyan-300">HP07 (mSv)</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span class="text-sm text-purple-300">Rate (µSv/h)</span>
        </div>
      </div>
      
      <!-- Live Indicator -->
      <div class="absolute top-2 right-2 flex items-center space-x-2">
        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span class="text-xs text-green-400 font-medium">LIVE</span>
      </div>
    </div>
    
    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div class="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30 text-center">
        <p class="text-xs text-slate-300">Max HP10</p>
        <p class="text-lg font-bold text-blue-400">{{ maxHp10.toFixed(2) }} mSv</p>
      </div>
      <div class="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30 text-center">
        <p class="text-xs text-slate-300">Max Rate</p>
        <p class="text-lg font-bold text-purple-400">{{ maxRate.toFixed(1) }} µSv/h</p>
      </div>
      <div class="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30 text-center">
        <p class="text-xs text-slate-300">Data Points</p>
        <p class="text-lg font-bold text-indigo-400">{{ dataPoints.length }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

export default {
  name: 'RealTimeChart',
  props: {
    readings: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const chartCanvas = ref(null)
    const chart = ref(null)
    const isPaused = ref(false)
    const dataPoints = ref([])
    
    // Chart configuration
    const chartConfig = {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'HP10 (mSv)',
            data: [],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6
          },
          {
            label: 'HP07 (mSv)',
            data: [],
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6
          },
          {
            label: 'Rate (µSv/h)',
            data: [],
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 750,
          easing: 'easeInOutQuart'
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Time',
              color: '#94a3b8'
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)'
            },
            ticks: {
              color: '#94a3b8',
              maxTicksLimit: 8
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Dose (mSv)',
              color: '#94a3b8'
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)'
            },
            ticks: {
              color: '#94a3b8'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Rate (µSv/h)',
              color: '#94a3b8'
            },
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              color: '#94a3b8'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#e2e8f0',
            bodyColor: '#cbd5e1',
            borderColor: '#475569',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true
          }
        }
      }
    }
    
    // Computed properties
    const maxHp10 = computed(() => {
      if (dataPoints.value.length === 0) return 0
      return Math.max(...dataPoints.value.map(p => p.hp10_msv))
    })
    
    const maxRate = computed(() => {
      if (dataPoints.value.length === 0) return 0
      return Math.max(...dataPoints.value.map(p => p.rate_usv_h))
    })
    
    // Methods
    const initChart = () => {
      if (!chartCanvas.value) return
      
      const ctx = chartCanvas.value.getContext('2d')
      chart.value = new Chart(ctx, chartConfig)
    }
    
    const updateChart = () => {
      if (!chart.value || isPaused.value) return
      
      const labels = dataPoints.value.map((_, index) => {
        const now = new Date()
        const time = new Date(now.getTime() - (dataPoints.value.length - index - 1) * 1000)
        return time.toLocaleTimeString()
      })
      
      const hp10Data = dataPoints.value.map(p => p.hp10_msv)
      const hp07Data = dataPoints.value.map(p => p.hp007_msv)
      const rateData = dataPoints.value.map(p => p.rate_usv_h)
      
      chart.value.data.labels = labels
      chart.value.data.datasets[0].data = hp10Data
      chart.value.data.datasets[1].data = hp07Data
      chart.value.data.datasets[2].data = rateData
      
      chart.value.update('none')
    }
    
    const addDataPoint = (reading) => {
      if (isPaused.value) return
      
      const dataPoint = {
        timestamp: new Date(),
        hp10_msv: reading.hp10_msv || 0,
        hp007_msv: reading.hp007_msv || 0,
        rate_usv_h: reading.rate_usv_h || 0
      }
      
      dataPoints.value.push(dataPoint)
      
      // Keep only last 50 data points
      if (dataPoints.value.length > 50) {
        dataPoints.value = dataPoints.value.slice(-50)
      }
      
      updateChart()
    }
    
    const clearChart = () => {
      dataPoints.value = []
      updateChart()
    }
    
    const togglePause = () => {
      isPaused.value = !isPaused.value
    }
    
    // Watch for new readings
    watch(() => props.readings, (newReadings) => {
      if (newReadings.length === 0) return
      
      const latest = newReadings[0]
      addDataPoint(latest)
    }, { deep: true })
    
    // Lifecycle
    onMounted(() => {
      // Import Chart.js dynamically
      import('chart.js/auto').then(() => {
        initChart()
      })
    })
    
    onUnmounted(() => {
      if (chart.value) {
        chart.value.destroy()
      }
    })
    
    return {
      chartCanvas,
      isPaused,
      dataPoints,
      maxHp10,
      maxRate,
      clearChart,
      togglePause
    }
  }
}
</script>

<style scoped>
.real-time-chart {
  position: relative;
}

/* Chart container styling */
canvas {
  border-radius: 0.5rem;
}

/* Live indicator animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.animate-pulse {
  animation: pulse 2s infinite;
}

/* Smooth transitions */
.transition-colors {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced hover effects */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Glassmorphism effects */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

/* Enhanced shadows */
.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}
</style>
