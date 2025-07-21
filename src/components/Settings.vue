<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-8">
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-bold mb-6">Admin Settings</h1>

      <!-- Tab Navigation -->
      <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button @click="activeTab = 'changePassword'"
                  :class="[
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                    activeTab === 'changePassword'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                  ]">
            Change Password
          </button>
          <button @click="activeTab = 'createUser'"
                  :class="[
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                    activeTab === 'createUser'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                  ]">
            Create User
          </button>
        </nav>
      </div>

      <!-- Change Password Form -->
      <div v-if="activeTab === 'changePassword'">
        <form @submit.prevent="updatePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1" for="user">Select User</label>
            <select id="user" v-model="selectedUser" class="w-full border rounded px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">
              <option disabled value="">Choose user</option>
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.email }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="newPassword">New Password</label>
            <input id="newPassword" type="password" v-model="newPassword" class="w-full border rounded px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="confirmPassword">Confirm New Password</label>
            <input id="confirmPassword" type="password" v-model="confirmPassword" class="w-full border rounded px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="adminPassword">Admin Password</label>
            <input id="adminPassword" type="password" v-model="adminPassword" class="w-full border rounded px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
          </div>
          <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Password</button>
        </form>
      </div>

      <!-- Create User Form -->
      <div v-if="activeTab === 'createUser'">
        <create-user-form @user-created="handleUserCreated" />
      </div>
    </div>
  </div>
</template>

<script>
import CreateUserForm from './CreateUserForm.vue'

export default {
  name: 'Settings',
  components: {
    CreateUserForm
  },
  data() {
    return {
      activeTab: 'changePassword', // Default tab
      users: [],
      selectedUser: '',
      newPassword: '',
      confirmPassword: '',
      adminPassword: '',
      error: ''
    }
  },
  methods: {
    async fetchUsers() {
      const adminEmail = localStorage.getItem('userEmail')
      if (!adminEmail || !this.adminPassword) {
        this.error = 'Admin email or password missing.'
        return
      }
      const res = await fetch(`/api/admin/users/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail, adminPassword: this.adminPassword })
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
      if (!adminEmail || !this.adminPassword) {
        this.error = 'Admin credentials missing'
        return
      }
      const res = await fetch(`/api/admin/users/${this.selectedUser}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail, adminPassword: this.adminPassword, newPassword: this.newPassword })
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
    },
    async handleUserCreated() {
      // When a user is created, refresh the user list for the dropdown
      await this.fetchUsers();
      // Optionally, switch back to the change password tab
      this.activeTab = 'changePassword';
    }
  }
}
</script>

