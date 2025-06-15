<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <div class="p-4 text-right">
      <ThemeSwitcher />
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import ThemeSwitcher from './components/ThemeSwitcher.vue'

export default {
  name: 'App',
  components: { ThemeSwitcher }
}
</script>

<style scoped>
</style>
