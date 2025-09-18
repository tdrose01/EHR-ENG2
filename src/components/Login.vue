<template>
  <div class="min-h-screen bg-black flex items-center justify-center text-white">
    <div class="max-w-md w-full mx-4">
      <h1 class="text-3xl font-bold text-center mb-8 text-blue-400">Navy EHR System</h1>
      <div class="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              class="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:bg-gray-700"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                required
                class="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:bg-gray-700 pr-10"
                placeholder="Enter your password"
              />
              <button type="button" @click="showPassword = !showPassword" tabindex="-1" class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none">
                <span v-if="showPassword">🙈</span>
                <span v-else>👁️</span>
              </button>
            </div>
          </div>

          <div v-if="error" class="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">{{ error }}</div>
          
          <button
            type="submit"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
      error: '',
      showPassword: false
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

        let data
        try {
          data = await response.json()
        } catch (e) {
          this.error = 'Unexpected server response. Please try again later.'
          return
        }

        if (data.success) {
          // Store authentication state
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('authToken', data.token)
          localStorage.setItem('userRole', data.user.role)
          localStorage.setItem('userEmail', data.user.email)
          localStorage.setItem('userId', data.user.id)
          
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