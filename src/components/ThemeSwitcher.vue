<template>
  <button @click="toggleTheme" class="p-2 rounded focus:outline-none">
    <span v-if="theme === 'dark'">☀️</span>
    <span v-else>🌙</span>
  </button>
</template>

<script setup>
import { useTheme } from '../composables/useTheme'

const { theme, toggleTheme } = useTheme()
</script>

<style scoped>
button {
  background-color: transparent;
}
</style>
