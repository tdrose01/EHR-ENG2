<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Agent Workflow Dashboard</h1>
      <div class="mb-4">
        <button @click="startWorkflow" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" :disabled="workflowRunning">
          {{ workflowRunning ? 'Workflow in Progress...' : 'Start Workflow' }}
        </button>
      </div>
      <div class="bg-white dark:bg-gray-900 shadow rounded-lg p-4">
        <h2 class="text-xl font-bold mb-4">Task Status</h2>
        <table class="w-full">
          <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">Agent</th>
              <th class="text-left">Task</th>
              <th class="text-left">Status</th>
              <th class="text-left">Output</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in tasks" :key="task.id" class="border-b border-gray-200 dark:border-gray-700">
              <td class="py-2">{{ task.id }}</td>
              <td class="py-2">{{ task.agent }}</td>
              <td class="py-2">{{ task.task }}</td>
              <td class="py-2">
                <span :class="statusColor(task.status)">{{ task.status }}</span>
              </td>
              <td class="py-2">{{ task.output }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgentDashboard',
  data() {
    return {
      tasks: [],
      workflowRunning: false,
      interval: null,
    };
  },
  methods: {
    async fetchTasks() {
      try {
        const res = await fetch('/api/admin/workflow/status');
        if (res.ok) {
          this.tasks = await res.json();
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    },
    async startWorkflow() {
      this.workflowRunning = true;
      try {
        await fetch('/api/admin/workflow/start', { method: 'POST' });
        this.interval = setInterval(this.fetchTasks, 2000);
      } catch (error) {
        console.error('Error starting workflow:', error);
        this.workflowRunning = false;
      }
    },
    statusColor(status) {
      const colors = {
        'PENDING': 'text-yellow-500',
        'IN_PROGRESS': 'text-blue-500',
        'CODE_GENERATED': 'text-cyan-500',
        'IN_REVIEW': 'text-purple-500',
        'REVIEW_PASSED': 'text-green-500',
        'REVIEW_FAILED': 'text-red-500',
        'COMPLETE': 'text-green-500',
        'FAILED': 'text-red-500',
      };
      return colors[status] || 'text-gray-500';
    },
  },
  beforeUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },
};
</script>
