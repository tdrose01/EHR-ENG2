<template>
  <div class="min-h-screen bg-black text-white py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-blue-300 mb-2">User Management</h1>
        <p class="text-gray-400 mt-2">Manage system users and their roles</p>
      </div>

      <!-- Create User Section -->
      <div class="bg-gray-900 rounded-2xl shadow-md p-6 mb-8 border border-gray-700">
        <h2 class="text-xl font-semibold text-blue-200 mb-4">Create New User</h2>
        <form @submit.prevent="createUser" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input 
              v-model="newUser.email" 
              type="email" 
              required
              class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input 
              v-model="newUser.password" 
              type="password" 
              required
              class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Role</label>
            <select 
              v-model="newUser.role" 
              required
              class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div class="flex items-end">
            <button 
              type="submit" 
              :disabled="isCreating"
              class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isCreating ? 'Creating...' : 'Create User' }}
            </button>
          </div>
        </form>
        
        <!-- Success/Error Messages -->
        <div v-if="message" class="mt-4 p-3 rounded-md" :class="messageType === 'success' ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-red-900 text-red-300 border border-red-700'">
          {{ message }}
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-gray-900 rounded-2xl shadow-md overflow-hidden border border-gray-700">
        <div class="px-6 py-4 border-b border-gray-700">
          <h2 class="text-xl font-semibold text-blue-200">System Users</h2>
        </div>
        
        <div v-if="isLoading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-2 text-gray-400">Loading users...</p>
        </div>
        
        <div v-else-if="error" class="p-8 text-center">
          <p class="text-red-400">{{ error }}</p>
          <button @click="fetchUsers" class="mt-2 text-blue-400 hover:text-blue-300 hover:underline">Retry</button>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-700">
            <thead class="bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">User</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Created</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Last Login</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-gray-900 divide-y divide-gray-700">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-800 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-white">{{ user.email }}</div>
                  <div class="text-sm text-gray-400">ID: {{ user.id }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getRoleBadgeClass(user.role)"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {{ user.created_at ? formatDate(user.created_at) : 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {{ user.last_login_at ? formatDate(user.last_login_at) : 'Never' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button 
                      @click="editUser(user)"
                      class="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      @click="deleteUser(user.id)"
                      class="text-red-400 hover:text-red-300 transition-colors"
                      :disabled="user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-900 border-gray-600">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-blue-200 mb-4">Edit User</h3>
          <form @submit.prevent="updateUser">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input 
                v-model="editingUser.email" 
                type="email" 
                disabled
                class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-400"
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-300 mb-1">Role</label>
              <select 
                v-model="editingUser.role" 
                required
                class="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div class="flex justify-end space-x-3">
              <button 
                type="button" 
                @click="showEditModal = false"
                class="px-4 py-2 text-gray-400 border border-gray-600 rounded-md hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="isUpdating"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {{ isUpdating ? 'Updating...' : 'Update' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])
const isLoading = ref(false)
const error = ref(null)
const message = ref('')
const messageType = ref('success')
const isCreating = ref(false)
const isUpdating = ref(false)
const showEditModal = ref(false)
const editingUser = ref({})

const newUser = ref({
  email: '',
  password: '',
  role: 'user'
})

const getRoleBadgeClass = (role) => {
  const classes = {
    admin: 'bg-red-900 text-red-300 border border-red-700',
    manager: 'bg-yellow-900 text-yellow-300 border border-yellow-700',
    user: 'bg-blue-900 text-blue-300 border border-blue-700',
    viewer: 'bg-gray-700 text-gray-300 border border-gray-600'
  }
  return classes[role] || classes.user
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

const fetchUsers = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const adminEmail = localStorage.getItem('userEmail')
    const adminPassword = localStorage.getItem('adminPassword') || prompt('Enter admin password:')
    
    if (!adminPassword) return
    
    const response = await fetch('/api/admin/users/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail, adminPassword })
    })
    
    if (response.ok) {
      users.value = await response.json()
      localStorage.setItem('adminPassword', adminPassword)
    } else {
      const data = await response.json()
      error.value = data.error || 'Failed to fetch users'
    }
  } catch (err) {
    error.value = 'Network error while fetching users'
    console.error('Error fetching users:', err)
  } finally {
    isLoading.value = false
  }
}

const createUser = async () => {
  isCreating.value = true
  
  try {
    const adminEmail = localStorage.getItem('userEmail')
    const adminPassword = localStorage.getItem('adminPassword')
    
    if (!adminPassword) {
      showMessage('Admin password required', 'error')
      return
    }
    
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminEmail,
        adminPassword,
        email: newUser.value.email,
        password: newUser.value.password,
        role: newUser.value.role
      })
    })
    
    if (response.ok) {
      showMessage('User created successfully')
      newUser.value = { email: '', password: '', role: 'user' }
      await fetchUsers()
    } else {
      const data = await response.json()
      showMessage(data.error || 'Failed to create user', 'error')
    }
  } catch (err) {
    showMessage('Network error while creating user', 'error')
    console.error('Error creating user:', err)
  } finally {
    isCreating.value = false
  }
}

const editUser = (user) => {
  editingUser.value = { ...user }
  showEditModal.value = true
}

const updateUser = async () => {
  isUpdating.value = true
  
  try {
    const adminEmail = localStorage.getItem('userEmail')
    const adminPassword = localStorage.getItem('adminPassword')
    
    const response = await fetch(`/api/admin/users/${editingUser.value.id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminEmail,
        adminPassword,
        newRole: editingUser.value.role
      })
    })
    
    if (response.ok) {
      showMessage('User updated successfully')
      showEditModal.value = false
      await fetchUsers()
    } else {
      const data = await response.json()
      showMessage(data.error || 'Failed to update user', 'error')
    }
  } catch (err) {
    showMessage('Network error while updating user', 'error')
    console.error('Error updating user:', err)
  } finally {
    isUpdating.value = false
  }
}

const deleteUser = async (userId) => {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    return
  }
  
  try {
    const adminEmail = localStorage.getItem('userEmail')
    const adminPassword = localStorage.getItem('adminPassword')
    
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail, adminPassword })
    })
    
    if (response.ok) {
      showMessage('User deleted successfully')
      await fetchUsers()
    } else {
      const data = await response.json()
      showMessage(data.error || 'Failed to delete user', 'error')
    }
  } catch (err) {
    showMessage('Network error while deleting user', 'error')
    console.error('Error deleting user:', err)
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
