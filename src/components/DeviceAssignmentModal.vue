<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
            {{ isEditMode ? 'Edit Device Assignment' : 'Assign Device to Personnel' }}
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
          <!-- Personnel Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Personnel *
            </label>
            <select 
              v-model="form.personnel_id" 
              required
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              :disabled="isEditMode"
            >
              <option value="">Select Personnel</option>
              <option 
                v-for="person in availablePersonnel" 
                :key="person.id" 
                :value="person.id"
              >
                {{ person.rank_rate }} {{ person.lname }}, {{ person.fname }} ({{ person.edipi }})
              </option>
            </select>
          </div>

          <!-- Device Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Device *
            </label>
            <select 
              v-model="form.device_id" 
              required
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              :disabled="isEditMode"
            >
              <option value="">Select Device</option>
              <option 
                v-for="device in availableDevices" 
                :key="device.id" 
                :value="device.id"
              >
                {{ device.serial }} - {{ device.vendor }} {{ device.model }}
              </option>
            </select>
          </div>

          <!-- Assignment Start Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assignment Start Date *
            </label>
            <input 
              v-model="form.start_ts" 
              type="datetime-local" 
              required
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <!-- Assignment End Date (Optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assignment End Date (Optional)
            </label>
            <input 
              v-model="form.end_ts" 
              type="datetime-local" 
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Leave blank for indefinite assignment
            </p>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea 
              v-model="form.notes" 
              rows="3"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Optional notes about this assignment..."
            ></textarea>
          </div>

          <!-- Current Assignment Info (if editing) -->
          <div v-if="isEditMode && currentAssignment" class="bg-gray-700 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-300 mb-2">Current Assignment Details</h4>
            <div class="text-sm text-gray-400 space-y-1">
              <div><strong>Personnel:</strong> {{ currentAssignment.rank_rate }} {{ currentAssignment.lname }}, {{ currentAssignment.fname }}</div>
              <div><strong>Device:</strong> {{ currentAssignment.device_serial }}</div>
              <div><strong>Started:</strong> {{ formatDateTime(currentAssignment.start_ts) }}</div>
              <div v-if="currentAssignment.end_ts"><strong>Ends:</strong> {{ formatDateTime(currentAssignment.end_ts) }}</div>
            </div>
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
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ isEditMode ? 'Update Assignment' : 'Create Assignment' }}
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
  name: 'DeviceAssignmentModal',
  props: {
    assignment: {
      type: Object,
      default: null
    },
    personnel: {
      type: Array,
      required: true
    },
    devices: {
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
      personnel_id: '',
      device_id: '',
      start_ts: '',
      end_ts: '',
      notes: ''
    })

    // Computed properties
    const isEditMode = computed(() => !!props.assignment)
    const currentAssignment = computed(() => props.assignment)

    const availablePersonnel = computed(() => {
      return props.personnel.filter(person => person.active)
    })

    const availableDevices = computed(() => {
      return props.devices.filter(device => !device.retired_at)
    })

    // Methods
    const resetForm = () => {
      form.value = {
        personnel_id: '',
        device_id: '',
        start_ts: '',
        end_ts: '',
        notes: ''
      }
    }

    const populateFormForEdit = () => {
      if (props.assignment) {
        form.value = {
          personnel_id: props.assignment.personnel_id,
          device_id: props.assignment.device_id,
          start_ts: formatDateTimeForInput(props.assignment.start_ts),
          end_ts: props.assignment.end_ts ? formatDateTimeForInput(props.assignment.end_ts) : '',
          notes: props.assignment.notes || ''
        }
      }
    }

    const formatDateTimeForInput = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toISOString().slice(0, 16)
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString()
    }

    const handleSubmit = async () => {
      loading.value = true
      try {
        const payload = {
          personnel_id: parseInt(form.value.personnel_id),
          device_id: parseInt(form.value.device_id),
          start_ts: new Date(form.value.start_ts).toISOString(),
          end_ts: form.value.end_ts ? new Date(form.value.end_ts).toISOString() : null,
          notes: form.value.notes
        }

        const url = isEditMode.value 
          ? `/api/radiation/assignments/${props.assignment.id}`
          : '/api/radiation/assignments'
        
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
          emit('error', errorData.error || 'Failed to save assignment')
        }
      } catch (error) {
        console.error('Assignment save error:', error)
        emit('error', 'Network error while saving assignment')
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
      return form.value.personnel_id || form.value.device_id || form.value.start_ts || form.value.end_ts || form.value.notes
    }

    // Watchers
    watch(() => props.assignment, populateFormForEdit, { immediate: true })
    watch(() => props.visible, (newVal) => {
      if (!newVal) {
        resetForm()
      }
    })

    // Lifecycle
    onMounted(() => {
      if (props.assignment) {
        populateFormForEdit()
      }
    })

    return {
      loading,
      form,
      isEditMode,
      currentAssignment,
      availablePersonnel,
      availableDevices,
      handleSubmit,
      handleClose,
      formatDateTime,
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
