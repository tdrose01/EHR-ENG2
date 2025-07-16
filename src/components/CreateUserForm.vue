<template>
  <div class="mt-8">
    <h2 class="text-xl font-bold mb-4">Create New User</h2>
    <form @submit.prevent="createUser" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1 dark:text-gray-200" for="email">Email</label>
        <input id="email" type="email" v-model="email" class="w-full border rounded px-3 py-2 text-gray-900 dark:text-gray-100" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1 dark:text-gray-200" for="password">Password</label>
        <input id="password" type="password" v-model="password" class="w-full border rounded px-3 py-2 text-gray-900 dark:text-gray-100" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1 dark:text-gray-200" for="confirmPasswordUser">Confirm Password</label>
        <input id="confirmPasswordUser" type="password" v-model="confirmPassword" class="w-full border rounded px-3 py-2 text-gray-900 dark:text-gray-100" />
      </div>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <p v-if="success" class="text-green-500 text-sm">{{ success }}</p>
      <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create User</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'CreateUserForm',
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      success: ''
    }
  },
  methods: {
    async createUser() {
      this.error = ''
      this.success = ''
      if (!this.email || !this.password || !this.confirmPassword) {
        this.error = 'All fields are required'
        return
      }
      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match'
        return
      }
      const adminEmail = localStorage.getItem('userEmail')
      const adminPassword = prompt('Please enter your admin password to confirm:')
      if (!adminEmail || !adminPassword) {
        this.error = 'Admin credentials missing'
        return
      }
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail,
          adminPassword,
          email: this.email,
          password: this.password
        })
      })
      if (res.ok) {
        this.email = ''
        this.password = ''
        this.confirmPassword = ''
        this.success = 'User created successfully'
        this.$emit('user-created');
      } else {
        const data = await res.json()
        this.error = data.error || 'Failed to create user'
      }
    }
  }
}
</script>
