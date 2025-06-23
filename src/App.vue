<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <header class="p-4 flex justify-between items-center">
      <button
        @click="goBack"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Back
      </button>
      <div class="flex flex-col items-end">
        <span v-if="userEmail" class="text-base font-medium text-gray-800 dark:text-gray-100">{{ userEmail }}</span>
        <span v-if="lastLoginDisplay" class="text-xs text-gray-600 dark:text-gray-300 mt-1">{{ lastLoginDisplay }}</span>
      </div>
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
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'

const router = useRouter()
const route = useRoute()

function goBack() {
  router.back()
}

const userEmail = ref('')
const lastLoginAt = ref('')

const lastLoginDisplay = computed(() => {
  if (!lastLoginAt.value) return 'First login'
  const date = new Date(lastLoginAt.value)
  if (isNaN(date.getTime())) return 'First login'
  return `Last login: ${date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`
})

function refreshUserInfo() {
  userEmail.value = localStorage.getItem('userEmail') || ''
  lastLoginAt.value = localStorage.getItem('lastLoginAt') || ''
}

onMounted(() => {
  refreshUserInfo()
})

watch(route, () => {
  refreshUserInfo()
})
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
