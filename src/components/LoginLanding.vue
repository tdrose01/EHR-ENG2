<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <form
      class="bg-white p-6 rounded shadow w-full max-w-sm"
      @submit.prevent="handleSubmit"
    >
      <h1 class="text-2xl font-bold mb-4 text-center">Login</h1>
      <div class="mb-4">
        <label class="block text-gray-700 mb-2" for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
        />
      </div>
      <div class="mb-6">
        <label class="block text-gray-700 mb-2" for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
        />
      </div>
      <button
        type="submit"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
      >
        Log In
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login'])

const email = ref('')
const password = ref('')

function handleSubmit() {
  const payload = { email: email.value, password: password.value }
  emit('login', payload)
}
</script>

<style scoped>
</style>
