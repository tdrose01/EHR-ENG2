<template>
  <div class="unit-node">
    <div class="flex items-center p-3 bg-gray-800 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors">
      <div class="flex items-center flex-1">
        <i class="fas fa-building text-blue-400 mr-3"></i>
        <div>
          <div class="text-white font-medium">{{ unit.uic }} - {{ unit.name }}</div>
          <div class="text-sm text-gray-400">
            {{ personnelCount }} personnel
            <span v-if="childUnits.length > 0" class="ml-2">
              • {{ childUnits.length }} sub-unit{{ childUnits.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="$emit('edit', unit)"
          class="text-blue-400 hover:text-blue-300 transition-colors p-1"
          title="Edit unit"
        >
          <i class="fas fa-edit"></i>
        </button>
        <button
          @click="$emit('view-personnel', unit)"
          class="text-green-400 hover:text-green-300 transition-colors p-1"
          title="View personnel"
        >
          <i class="fas fa-users"></i>
        </button>
      </div>
    </div>
    
    <!-- Child Units -->
    <div v-if="childUnits.length > 0" class="ml-6 mt-2 space-y-2">
      <UnitHierarchyNode
        v-for="childUnit in childUnits"
        :key="childUnit.id"
        :unit="childUnit"
        :units="units"
        :personnel="personnel"
        @edit="$emit('edit', $event)"
        @view-personnel="$emit('view-personnel', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  unit: Object,
  units: Array,
  personnel: Array
})

const emit = defineEmits(['edit', 'view-personnel'])

const childUnits = computed(() => {
  return props.units.filter(u => u.parent_uic === props.unit.uic)
})

const personnelCount = computed(() => {
  return props.personnel.filter(p => p.unit_id === props.unit.id).length
})
</script>

<style scoped>
.unit-node {
  position: relative;
}

.unit-node::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, #4b5563, transparent);
}

.unit-node:not(:last-child)::after {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 1.5rem;
  width: 1rem;
  height: 1px;
  background: #4b5563;
}
</style>
