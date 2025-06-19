<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <header class="p-4">
      <button
        @click="goBack"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Back
      </button>
    </header>

    <div class="text-gray-900 dark:text-gray-100">
      <div class="p-4 text-right">
        <ThemeSwitcher />
      </div>

      <router-view></router-view>
    </div>
  </div>
</template>


<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<script>
import ThemeSwitcher from './components/ThemeSwitcher.vue'

export default {
  name: 'App',
  components: { ThemeSwitcher }
}
</script>

<style scoped>
</style>
