<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
            {{ isEditMode ? 'Edit Device' : 'Add New Device' }}
          </h3>
          <button 
            @click="handleClose" 
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Device Model Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Device Model *
            </label>
            <select 
              v-model="form.model_id" 
              required
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Device Model</option>
              <option 
                v-for="model in deviceModels" 
                :key="model.id" 
                :value="model.id"
              >
                {{ model.vendor }} {{ model.model }}
              </option>
            </select>
          </div>

          <!-- Serial Number -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Serial Number *
            </label>
            <input 
              v-model="form.serial" 
              type="text" 
              required
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter device serial number"
            />
          </div>

          <!-- BLE MAC Address -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              BLE MAC Address
            </label>
            <input 
              v-model="form.ble_mac" 
              type="text" 
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter BLE MAC address (optional)"
            />
          </div>

          <!-- Firmware Version -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Firmware Version
            </label>
            <input 
              v-model="form.firmware" 
              type="text" 
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter firmware version (optional)"
            />
          </div>

          <!-- Calibration Due Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Calibration Due Date
            </label>
            <input 
              v-model="form.calib_due" 
              type="date" 
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- RF Policy -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              RF Policy *
            </label>
            <select 
              v-model="form.rf_policy" 
              required
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select RF Policy</option>
              <option value="CONTROLLED">Controlled</option>
              <option value="UNCONTROLLED">Uncontrolled</option>
              <option value="RESTRICTED">Restricted</option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              @click="handleClose"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ isEditMode ? 'Update Device' : 'Create Device' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'DeviceEditModal',
  props: {
    device: {
      type: Object,
      default: null
    },
    deviceModels: {
      type: Array,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'saved', 'error'],
  setup(props, { emit }) {
    const loading = ref(false)
    const form = ref({
      model_id: '',
      serial: '',
      ble_mac: '',
      firmware: '',
      calib_due: '',
      rf_policy: ''
    })

    // Computed properties
    const isEditMode = computed(() => !!props.device)

    // Methods
    const resetForm = () => {
      form.value = {
        model_id: '',
        serial: '',
        ble_mac: '',
        firmware: '',
        calib_due: '',
        rf_policy: ''
      }
    }

    const populateFormForEdit = () => {
      if (props.device) {
        form.value = {
          model_id: props.device.model_id || '',
          serial: props.device.serial || '',
          ble_mac: props.device.ble_mac || '',
          firmware: props.device.firmware || '',
          calib_due: props.device.calib_due ? formatDateForInput(props.device.calib_due) : '',
          rf_policy: props.device.rf_policy || ''
        }
      }
    }

    const formatDateForInput = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toISOString().slice(0, 10)
    }

    const handleSubmit = async () => {
      loading.value = true
      try {
        const payload = {
          model_id: parseInt(form.value.model_id),
          serial: form.value.serial,
          ble_mac: form.value.ble_mac || null,
          firmware: form.value.firmware || null,
          calib_due: form.value.calib_due ? new Date(form.value.calib_due).toISOString() : null,
          rf_policy: form.value.rf_policy
        }

        const url = isEditMode.value 
          ? `/api/radiation/devices/${props.device.id}`
          : '/api/radiation/devices'
        
        const method = isEditMode.value ? 'PUT' : 'POST'

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          const result = await response.json()
          emit('saved', result)
          resetForm()
        } else {
          const errorData = await response.json()
          emit('error', errorData.error || 'Failed to save device')
        }
      } catch (error) {
        console.error('Device save error:', error)
        emit('error', 'Network error while saving device')
      } finally {
        loading.value = false
      }
    }

    const handleClose = () => {
      if (hasUnsavedChanges()) {
        if (confirm('You have unsaved changes. Are you sure you want to close?')) {
          resetForm()
          emit('close')
        }
      } else {
        resetForm()
        emit('close')
      }
    }

    const hasUnsavedChanges = () => {
      return form.value.model_id || form.value.serial || form.value.ble_mac || 
             form.value.firmware || form.value.calib_due || form.value.rf_policy
    }

    // Watchers
    watch(() => props.device, populateFormForEdit, { immediate: true })
    watch(() => props.visible, (newVal) => {
      if (!newVal) {
        resetForm()
      }
    })

    // Lifecycle
    onMounted(() => {
      if (props.device) {
        populateFormForEdit()
      }
    })

    return {
      loading,
      form,
      isEditMode,
      handleSubmit,
      handleClose,
      hasUnsavedChanges
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #374151;
}

::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
