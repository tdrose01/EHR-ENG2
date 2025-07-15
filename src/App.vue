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
        <LastLoginCard :last-login-at="lastLoginAt" />
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
import { ref, onMounted, watch } from 'vue'
import LastLoginCard from './components/LastLoginCard.vue'

const router = useRouter()
const route = useRoute()

function goBack() {
  router.back()
}

const userEmail = ref('')
const lastLoginAt = ref('')

async function fetchProfile() {
  const id = localStorage.getItem('userId')
  if (!id) return
  try {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) return
    const data = await res.json()
    if (data.lastLogin) {
      lastLoginAt.value = data.lastLogin
      localStorage.setItem('lastLoginAt', data.lastLogin)
    }
  } catch (e) {
    console.error('Profile fetch failed:', e)
  }
}

function refreshUserInfo() {
  userEmail.value = localStorage.getItem('userEmail') || ''
  lastLoginAt.value = localStorage.getItem('lastLoginAt') || ''
}

onMounted(() => {
  refreshUserInfo()
  fetchProfile()
})

watch(route, () => {
  refreshUserInfo()
  fetchProfile()
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
