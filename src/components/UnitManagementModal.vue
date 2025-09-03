<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-900 rounded-lg shadow-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700">
        <h2 class="text-xl font-semibold text-white">
          {{ editingUnit ? 'Edit Unit' : 'Add New Unit' }}
        </h2>
        <button 
          @click="$emit('cancel')"
          class="text-gray-400 hover:text-white transition-colors"
        >
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Error Message -->
        <div v-if="error" class="bg-red-900 text-red-300 border border-red-700 rounded-md p-3">
          {{ error }}
        </div>

        <!-- UIC Code -->
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">
            UIC Code <span class="text-red-400">*</span>
          </label>
          <input
            v-model="form.uic"
            type="text"
            required
            maxlength="20"
            class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., N00001"
            :disabled="editingUnit"
          />
          <p class="text-xs text-gray-400 mt-1">Unique identifier for the unit (cannot be changed after creation)</p>
        </div>

        <!-- Unit Name -->
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">
            Unit Name <span class="text-red-400">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., USS Ronald Reagan (CVN-76)"
          />
        </div>

        <!-- Parent Unit -->
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">
            Parent Unit
          </label>
          <select
            v-model="form.parent_uic"
            class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No Parent Unit</option>
            <option v-for="unit in availableParentUnits" :key="unit.uic" :value="unit.uic">
              {{ unit.uic }} - {{ unit.name }}
            </option>
          </select>
          <p class="text-xs text-gray-400 mt-1">Select a parent unit to create a hierarchy</p>
        </div>

        <!-- Unit Hierarchy Preview -->
        <div v-if="form.parent_uic" class="bg-gray-800 rounded-md p-4">
          <h4 class="text-sm font-medium text-gray-300 mb-2">Unit Hierarchy Preview:</h4>
          <div class="text-sm text-gray-400">
            <div v-for="(unit, index) in hierarchyPreview" :key="unit.uic" class="flex items-center">
              <span v-for="i in index" :key="i" class="w-4 h-px bg-gray-600 mx-1"></span>
              <i class="fas fa-building text-blue-400 mr-2"></i>
              <span class="text-white">{{ unit.uic }} - {{ unit.name }}</span>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <button
            type="button"
            @click="$emit('cancel')"
            class="px-4 py-2 text-gray-400 border border-gray-600 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-2"></i>
            {{ isSubmitting ? 'Saving...' : (editingUnit ? 'Update Unit' : 'Create Unit') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  editingUnit: Object,
  units: Array
})

const emit = defineEmits(['saved', 'cancel', 'error'])

const isSubmitting = ref(false)
const error = ref('')

const form = ref({
  uic: '',
  name: '',
  parent_uic: ''
})

// Available parent units (exclude current unit and its children)
const availableParentUnits = computed(() => {
  if (!props.units) return []
  
  // If editing, exclude current unit and its children
  if (props.editingUnit) {
    return props.units.filter(unit => 
      unit.id !== props.editingUnit.id && 
      !isChildUnit(unit, props.editingUnit)
    )
  }
  
  return props.units
})

// Check if a unit is a child of another unit
const isChildUnit = (unit, parentUnit) => {
  if (unit.parent_uic === parentUnit.uic) return true
  
  // Check if unit is a grandchild, great-grandchild, etc.
  const parent = props.units.find(u => u.uic === unit.parent_uic)
  if (parent && parent.id !== parentUnit.id) {
    return isChildUnit(parent, parentUnit)
  }
  
  return false
}

// Hierarchy preview
const hierarchyPreview = computed(() => {
  if (!form.value.parent_uic) return []
  
  const hierarchy = []
  let currentUic = form.value.parent_uic
  
  while (currentUic) {
    const unit = props.units.find(u => u.uic === currentUic)
    if (unit) {
      hierarchy.unshift(unit)
      currentUic = unit.parent_uic
    } else {
      break
    }
  }
  
  // Add the new unit being created
  if (form.value.uic && form.value.name) {
    hierarchy.push({
      uic: form.value.uic,
      name: form.value.name
    })
  }
  
  return hierarchy
})

const resetForm = () => {
  form.value = {
    uic: '',
    name: '',
    parent_uic: ''
  }
  error.value = ''
}

// Watch for editing unit changes
watch(() => props.editingUnit, (newUnit) => {
  if (newUnit) {
    form.value = {
      uic: newUnit.uic,
      name: newUnit.name,
      parent_uic: newUnit.parent_uic || ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Watch for modal show/hide
watch(() => props.show, (show) => {
  if (show && !props.editingUnit) {
    resetForm()
  }
})

const handleSubmit = async () => {
  isSubmitting.value = true
  error.value = ''
  
  try {
    const url = props.editingUnit 
      ? `/api/radiation/units/${props.editingUnit.id}`
      : '/api/radiation/units'
    
    const method = props.editingUnit ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uic: form.value.uic,
        name: form.value.name,
        parent_uic: form.value.parent_uic || null
      })
    })
    
    if (response.ok) {
      emit('saved')
    } else {
      const errorData = await response.json()
      error.value = errorData.error || 'Failed to save unit'
    }
  } catch (err) {
    error.value = 'Network error while saving unit'
    console.error('Error saving unit:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>
