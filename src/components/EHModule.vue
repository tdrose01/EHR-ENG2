<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
    <nav class="bg-white dark:bg-gray-700 shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">Electronic Health Module</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/patients"
                class="border-blue-500 text-gray-900 dark:text-gray-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Patient Management
              </router-link>
            </div>
          </div>
          <div class="flex items-center">
            <button
              @click="logout"
              class="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4">
          <h1 class="text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100">
            Welcome to Electronic Health Module
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="border-4 border-dashed border-gray-200 dark:border-gray-600 rounded-lg h-96 p-4">
              <p class="text-gray-600 dark:text-gray-300">
                This is the main content area for the Electronic Health Module.
                Click on Patient Management to access the patient records.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EHModule',
  methods: {
    logout() {
      localStorage.removeItem('isAuthenticated')
      this.$router.push('/')
    }
  }
}
</script> 