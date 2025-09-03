<template>
  <div class="min-h-screen flex items-center justify-center bg-black text-white">
    <form
      class="bg-gray-900 p-6 rounded shadow w-full max-w-sm border border-gray-700"
      @submit.prevent="handleSubmit"
    >
      <h1 class="text-2xl font-bold mb-4 text-center text-blue-400">Navy EHR System</h1>
      <div class="mb-4">
        <label class="block text-gray-300 mb-2" for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="w-full px-3 py-2 bg-gray-800 border-gray-600 text-white placeholder-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your email"
        />
      </div>
      <div class="mb-6">
        <label class="block text-gray-300 mb-2" for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="w-full px-3 py-2 bg-gray-800 border-gray-600 text-white placeholder-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your password"
        />
      </div>
      <button
        type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded transition-colors"
      >
        Log In
      </button>
      <p v-if="errorMessage" class="mt-4 text-red-400 text-center bg-red-900/20 border border-red-800 rounded-md p-3">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login'])

const email = ref('')
const password = ref('')
const errorMessage = ref('')

async function handleSubmit() {
  const payload = { email: email.value, password: password.value }
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.success) {
      const message = data?.message || `Login failed with status ${res.status}`
      throw new Error(message)
    }
    emit('login', payload)
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error.message
  }
}
</script>

<style scoped>
</style>
