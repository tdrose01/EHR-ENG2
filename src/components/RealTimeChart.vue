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
    
    <!-- Chart Container with Fixed Height -->
    <div class="relative chart-container" style="height: 400px; max-height: 400px; overflow: hidden;">
      <!-- Chart Canvas with Constrained Dimensions -->
      <canvas 
        ref="chartCanvas" 
        class="chart-canvas"
        style="width: 100% !important; height: 100% !important; max-height: 400px !important;"
      ></canvas>
      
      <!-- Chart Legend -->
      <div class="flex justify-center space-x-6 mt-4 absolute bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-sm py-2 rounded-t-lg">
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
      <div class="absolute top-2 right-2 flex items-center space-x-2 bg-slate-800/80 backdrop-blur-sm px-2 py-1 rounded-lg">
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
    const isChartReady = ref(false) // Add flag to track chart readiness
    const debugMode = ref(true) // Enable debug mode for troubleshooting
    
    // Debug logging function
    const debugLog = (message, data = null) => {
      if (debugMode.value) {
        console.log(`[RealTimeChart] ${message}`, data)
      }
    }
    
    // Chart configuration with improved responsive settings
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
            pointRadius: 2,
            pointHoverRadius: 5,
            borderWidth: 2
          },
          {
            label: 'HP07 (mSv)',
            data: [],
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 5,
            borderWidth: 2
          },
          {
            label: 'Rate (µSv/h)',
            data: [],
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 5,
            borderWidth: 2,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0, // Disable animations to prevent internal errors
          easing: 'linear'
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        layout: {
          padding: {
            top: 20,
            right: 20,
            bottom: 40,
            left: 20
          }
        },
        elements: {
          point: {
            radius: 2,
            hoverRadius: 5
          },
          line: {
            tension: 0.4
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Time',
              color: '#94a3b8',
              font: {
                size: 12
              }
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: '#94a3b8',
              maxTicksLimit: 6,
              font: {
                size: 10
              }
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Dose (mSv)',
              color: '#94a3b8',
              font: {
                size: 12
              }
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: '#94a3b8',
              font: {
                size: 10
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Rate (µSv/h)',
              color: '#94a3b8',
              font: {
                size: 12
              }
            },
            grid: {
              drawOnChartArea: false,
              drawBorder: false
            },
            ticks: {
              color: '#94a3b8',
              font: {
                size: 10
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#e2e8f0',
            bodyColor: '#cbd5e1',
            borderColor: '#475569',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            titleFont: {
              size: 12
            },
            bodyFont: {
              size: 11
            }
          }
        },
        // Add error handling for plugins
        onHover: (event, activeElements) => {
          // Prevent plugin errors
        },
        onClick: (event, activeElements) => {
          // Prevent plugin errors
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
    
    // Safe chart update method to handle fullSize and includes errors
    const safeChartUpdate = () => {
      if (!chart.value) return false
      
      try {
        // Check if chart is properly initialized
        if (!chart.value.update || !chart.value.data) {
          throw new Error('Chart not properly initialized')
        }
        
        // Try to update with error handling for fullSize and includes
        chart.value.update('none', { duration: 0 })
        return true
      } catch (error) {
        // Handle specific fullSize error
        if (error.message && error.message.includes('fullSize')) {
          console.warn('fullSize error detected, recreating chart...')
          recreateChart()
          return false
        }
        
        // Handle includes error
        if (error.message && error.message.includes('includes')) {
          console.warn('includes error detected, recreating chart...')
          recreateChart()
          return false
        }
        
        // Handle other Chart.js errors
        if (error.message && (error.message.includes('Chart') || error.message.includes('plugin'))) {
          console.warn('Chart.js error detected, recreating chart...', error.message)
          recreateChart()
          return false
        }
        
        // Handle other errors
        console.warn('Chart update error:', error)
        return false
      }
    }

    // Helper function to recreate chart
    const recreateChart = () => {
      // Destroy the problematic chart first
      if (chart.value) {
        try {
          chart.value.destroy()
        } catch (destroyError) {
          console.warn('Error destroying chart:', destroyError)
        }
        chart.value = null
      }
      
      // Recreate the chart after a short delay
      setTimeout(() => {
        try {
          initChart()
        } catch (recreateError) {
          console.error('Failed to recreate chart:', recreateError)
        }
      }, 100)
    }

    // Methods
    const initChart = async () => {
      if (!chartCanvas.value) return
      
      try {
        debugLog('Initializing chart...')
        const ctx = chartCanvas.value.getContext('2d')
        
        // Destroy existing chart if it exists
        if (chart.value) {
          debugLog('Destroying existing chart')
          try {
            chart.value.destroy()
          } catch (destroyError) {
            console.warn('Error destroying chart:', destroyError)
          }
        }
        
        // Create chart with error handling and plugin safety
        try {
          // Ensure Chart.js is properly loaded
          if (typeof Chart === 'undefined') {
            throw new Error('Chart.js not loaded')
          }
          
          // Create a safe configuration that prevents includes errors
          const safeConfig = {
            ...chartConfig,
            options: {
              ...chartConfig.options,
              // Ensure all arrays are defined to prevent includes errors
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  titleColor: '#e2e8f0',
                  bodyColor: '#cbd5e1',
                  borderColor: '#475569',
                  borderWidth: 1,
                  cornerRadius: 8,
                  displayColors: true,
                  titleFont: {
                    size: 12
                  },
                  bodyFont: {
                    size: 11
                  }
                }
              },
              // Disable animations that might cause issues
              animation: {
                duration: 0
              },
              // Add event handlers that prevent errors
              onHover: (event, activeElements) => {
                // Prevent plugin errors
              },
              onClick: (event, activeElements) => {
                // Prevent plugin errors
              }
            }
          }
          
          chart.value = new Chart(ctx, safeConfig)
          debugLog('Chart created successfully', chart.value)
        } catch (createError) {
          console.error('Failed to create chart:', createError)
          debugLog('Chart creation failed', createError)
          
          // Try with a simplified configuration
          const simpleConfig = {
            type: 'line',
            data: {
              labels: [],
              datasets: [{
                label: 'HP10 (mSv)',
                data: [],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              plugins: { legend: { display: false } }
            }
          }
          
          chart.value = new Chart(ctx, simpleConfig)
          debugLog('Chart created with simplified config')
        }
        
        // Force chart resize to fit container
        setTimeout(() => {
          if (chart.value) {
            try {
              chart.value.resize()
              isChartReady.value = true // Mark chart as ready
              debugLog('Chart marked as ready')
            } catch (resizeError) {
              console.warn('Chart resize failed:', resizeError)
              // Still mark as ready even if resize fails
              isChartReady.value = true
              debugLog('Chart marked as ready (resize failed)')
            }
          }
        }, 100)
      } catch (error) {
        console.error('Chart initialization error:', error)
        isChartReady.value = false
        debugLog('Chart initialization failed', error)
      }
    }
    
    const updateChart = () => {
      // Add multiple safety checks
      if (!chart.value || !isChartReady.value || isPaused.value) {
        debugLog('Chart update skipped - not ready or paused', { 
          hasChart: !!chart.value, 
          isReady: isChartReady.value, 
          isPaused: isPaused.value 
        })
        return
      }
      
      try {
        // Ensure chart data structure exists
        if (!chart.value.data || !chart.value.data.datasets || chart.value.data.datasets.length < 3) {
          debugLog('Chart data structure not ready, skipping update')
          return
        }
        
        debugLog('Updating chart with data points', dataPoints.value.length)
        
        const labels = dataPoints.value.map((_, index) => {
          const now = new Date()
          const time = new Date(now.getTime() - (dataPoints.value.length - index - 1) * 1000)
          return time.toLocaleTimeString()
        })
        
        const hp10Data = dataPoints.value.map(p => p.hp10_msv)
        const hp07Data = dataPoints.value.map(p => p.hp007_msv)
        const rateData = dataPoints.value.map(p => p.rate_usv_h)
        
        // Ensure chart and data properties exist before updating
        if (chart.value.data && chart.value.data.datasets && chart.value.data.datasets.length >= 3) {
          // Use a safer update method that doesn't trigger internal Chart.js errors
          try {
            // Update data without triggering full chart redraw
            chart.value.data.labels = labels
            chart.value.data.datasets[0].data = hp10Data
            chart.value.data.datasets[1].data = hp07Data
            chart.value.data.datasets[2].data = rateData
            
            // Use safe chart update method
            const updateSuccess = safeChartUpdate()
            if (updateSuccess) {
              debugLog('Chart updated successfully')
            } else {
              debugLog('Chart update failed, will retry on next update')
            }
          } catch (updateError) {
            // If the update fails, try to recreate the chart
            console.warn('Chart update failed, attempting to recreate:', updateError)
            debugLog('Chart update failed, recreating chart', updateError)
            
            // Recreate the chart
            setTimeout(() => {
              try {
                initChart()
              } catch (recreateError) {
                console.error('Failed to recreate chart:', recreateError)
                debugLog('Chart recreation failed', recreateError)
              }
            }, 100)
          }
        }
      } catch (error) {
        console.error('Chart update error:', error)
        debugLog('Chart update failed', error)
        
        // If we get a critical error, try to recreate the chart
        if (error.message && error.message.includes('fullSize')) {
          console.warn('Critical chart error detected, recreating chart...')
          setTimeout(() => {
            try {
              initChart()
            } catch (recreateError) {
              console.error('Failed to recreate chart after critical error:', recreateError)
            }
          }, 200)
        }
      }
    }
    
    const addDataPoint = (reading) => {
      if (isPaused.value || !isChartReady.value) {
        debugLog('Data point addition skipped', { isPaused: isPaused.value, isReady: isChartReady.value })
        return
      }
      
      try {
        debugLog('Processing new reading', reading)
        
        // Convert string values to numbers and handle null/undefined values
        const dataPoint = {
          timestamp: new Date(),
          hp10_msv: parseFloat(reading.hp10_msv) || 0,
          hp007_msv: parseFloat(reading.hp007_msv) || 0,
          rate_usv_h: parseFloat(reading.rate_usv_h) || 0
        }
        
        // Validate the data point
        if (isNaN(dataPoint.hp10_msv) || isNaN(dataPoint.hp007_msv) || isNaN(dataPoint.rate_usv_h)) {
          console.warn('Invalid data point received:', reading, 'Processed:', dataPoint)
          debugLog('Invalid data point, skipping', { original: reading, processed: dataPoint })
          return
        }
        
        debugLog('Adding valid data point', dataPoint)
        dataPoints.value.push(dataPoint)
        
        // Keep only last 50 data points
        if (dataPoints.value.length > 50) {
          dataPoints.value = dataPoints.value.slice(-50)
        }
        
        updateChart()
      } catch (error) {
        console.error('Error adding data point:', error, 'Reading:', reading)
        debugLog('Error adding data point', error)
      }
    }
    
    const clearChart = () => {
      dataPoints.value = []
      if (isChartReady.value) {
        updateChart()
      }
    }
    
    const togglePause = () => {
      isPaused.value = !isPaused.value
    }
    
    // Handle window resize
    const handleResize = () => {
      if (chart.value && isChartReady.value) {
        try {
          chart.value.resize()
        } catch (error) {
          console.error('Chart resize error:', error)
        }
      }
    }
    
    // Watch for new readings with better error handling
    watch(() => props.readings, (newReadings) => {
      debugLog('Watch triggered with new readings', { 
        count: newReadings?.length, 
        isChartReady: isChartReady.value 
      })
      
      if (!newReadings || newReadings.length === 0 || !isChartReady.value) {
        debugLog('Watch skipped - no readings or chart not ready')
        return
      }
      
      try {
        const latest = newReadings[0]
        if (latest && typeof latest === 'object') {
          // Validate that the reading has the required properties
          if (latest.hasOwnProperty('hp10_msv') || latest.hasOwnProperty('hp007_msv') || latest.hasOwnProperty('rate_usv_h')) {
            debugLog('Processing latest reading', latest)
            addDataPoint(latest)
          } else {
            console.warn('Reading missing required properties:', latest)
            debugLog('Reading missing required properties', latest)
          }
        } else {
          console.warn('Invalid reading format:', latest)
          debugLog('Invalid reading format', latest)
        }
      } catch (error) {
        console.error('Error processing new readings:', error, 'Readings:', newReadings)
        debugLog('Error processing readings', error)
      }
    }, { deep: true })
    
    // Global error handler for Chart.js
    const handleChartError = (error) => {
      console.warn('Chart.js error caught:', error)
      if (error.message && (error.message.includes('includes') || error.message.includes('fullSize'))) {
        recreateChart()
      }
    }

    // Lifecycle
    onMounted(async () => {
      try {
        debugLog('Component mounting...')
        
        // Add global error handler
        window.addEventListener('error', handleChartError)
        
        // Import Chart.js dynamically
        const { Chart } = await import('chart.js/auto')
        
        // Check Chart.js version for compatibility
        if (Chart.version) {
          debugLog('Chart.js version detected', Chart.version)
          
          // Check for known problematic versions
          const version = Chart.version
          if (version.startsWith('4.') && parseInt(version.split('.')[1]) < 4) {
            console.warn('Chart.js version 4.0-4.3 may have compatibility issues. Consider upgrading to 4.4+')
          }
        } else {
          debugLog('Chart.js version not detected - using fallback configuration')
        }
        
        // Make Chart available globally for this component
        window.Chart = Chart
        debugLog('Chart.js imported successfully')
        
        await initChart()
        debugLog('Chart initialization completed')
        
        // Add resize listener
        window.addEventListener('resize', handleResize)
        debugLog('Component mounted successfully')
      } catch (error) {
        console.error('Component mount error:', error)
        isChartReady.value = false
        debugLog('Component mount failed', error)
      }
    })
    
    onUnmounted(() => {
      try {
        debugLog('Component unmounting...')
        
        // Remove global error handler
        window.removeEventListener('error', handleChartError)
        
        if (chart.value) {
          chart.value.destroy()
          debugLog('Chart destroyed')
        }
        isChartReady.value = false
        window.removeEventListener('resize', handleResize)
        debugLog('Component unmounted successfully')
      } catch (error) {
        console.error('Component unmount error:', error)
        debugLog('Component unmount failed', error)
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

/* Chart container with strict height constraints */
.chart-container {
  position: relative;
  height: 400px !important;
  max-height: 400px !important;
  min-height: 400px !important;
  overflow: hidden;
}

/* Chart canvas with enforced dimensions */
.chart-canvas {
  width: 100% !important;
  height: 100% !important;
  max-height: 400px !important;
  min-height: 400px !important;
}

/* Ensure chart doesn't expand beyond container */
.chart-container canvas {
  max-height: 400px !important;
  height: 400px !important;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .chart-container {
    height: 300px !important;
    max-height: 300px !important;
    min-height: 300px !important;
  }
  
  .chart-canvas {
    height: 300px !important;
    max-height: 300px !important;
    min-height: 300px !important;
  }
}

@media (max-width: 480px) {
  .chart-container {
    height: 250px !important;
    max-height: 250px !important;
    min-height: 250px !important;
  }
  
  .chart-canvas {
    height: 250px !important;
    max-height: 250px !important;
    min-height: 250px !important;
  }
}
</style>
