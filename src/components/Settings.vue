<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-8">
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-bold mb-6">Admin Settings</h1>
      <form @submit.prevent="updatePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1" for="user">Select User</label>
          <select id="user" v-model="selectedUser" class="w-full border rounded px-3 py-2">
            <option disabled value="">Choose user</option>
            <option v-for="user in users" :key="user.id" :value="user.id">{{ user.email }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" for="newPassword">New Password</label>
          <input id="newPassword" type="password" v-model="newPassword" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" for="confirmPassword">Confirm New Password</label>
          <input id="confirmPassword" type="password" v-model="confirmPassword" class="w-full border rounded px-3 py-2" />
        </div>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Password</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      users: [],
      selectedUser: '',
      newPassword: '',
      confirmPassword: '',
      error: ''
    }
  },
  async created() {
    await this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      const adminEmail = localStorage.getItem('userEmail')
      const adminPassword = prompt('Please enter your admin password:');
      if (!adminEmail || !adminPassword) return
      const res = await fetch(`/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail, adminPassword })
      })
      if (res.ok) {
        this.users = await res.json()
      } else {
        this.error = 'Failed to fetch users. Please check your admin password.'
      }
    },
    async updatePassword() {
      this.error = ''
      if (!this.newPassword || !this.confirmPassword) {
        this.error = 'Password fields cannot be empty'
        return
      }
      if (this.newPassword !== this.confirmPassword) {
        this.error = 'Passwords do not match'
        return
      }
      const adminEmail = localStorage.getItem('userEmail')
      const adminPassword = prompt('Please enter your admin password to confirm:')
      if (!adminEmail || !adminPassword) {
        this.error = 'Admin credentials missing'
        return
      }
      const res = await fetch(`/api/admin/users/${this.selectedUser}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail, adminPassword, newPassword: this.newPassword })
      })
      if (res.ok) {
        this.newPassword = ''
        this.confirmPassword = ''
        this.error = ''
        alert('Password updated')
      } else {
        const data = await res.json()
        this.error = data.error || 'Failed to update password'
      }
    }
  }
}
</script>

