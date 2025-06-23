<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-gray-100">
    <div class="max-w-md w-full mx-4">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Login</h1>
      <div class="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              id="password"
              v-model="password"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
          
          <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      error: ''
    }
  },
  methods: {
    async handleLogin() {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        })

        const data = await response.json()

        if (data.success) {
          // Store authentication state
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('userRole', data.role)
          localStorage.setItem('userEmail', this.email)
          if (data.lastLoginAt) {
            localStorage.setItem('lastLoginAt', data.lastLoginAt)
          }
          if (data.role === 'admin') {
            localStorage.setItem('adminPassword', this.password)
          }
          
          // Clear any existing error
          this.error = ''
          
          // Redirect to module selection
          this.$router.push('/select-module')
        } else {
          this.error = data.message || 'Invalid credentials'
        }
      } catch (error) {
        console.error('Login error:', error)
        this.error = 'An error occurred during login'
      }
    }
  }
}
</script> 