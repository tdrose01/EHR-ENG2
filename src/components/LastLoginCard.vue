<template>
  <div class="bg-gray-800 rounded p-3 shadow text-gray-300 text-sm flex items-center w-fit">
    <span class="font-semibold text-blue-300 mr-2">Last login:</span>
    <span>{{ display }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const lastLoginAt = localStorage.getItem('lastLoginAt') || ''
const display = computed(() => {
  if (!lastLoginAt) return 'First login'
  const date = new Date(lastLoginAt)
  if (isNaN(date.getTime())) return 'First login'
  return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
})
</script> 