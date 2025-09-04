<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Header -->
    <div class="bg-gray-900 border-b border-gray-700 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-blue-400">Navy Radiation Health Module</h1>
          <p class="text-gray-300 mt-2">Personal Dosimeter Monitoring & Dose Reconciliation</p>
        </div>
        <div class="flex items-center space-x-4">
          <div class="text-right">
            <div class="text-sm text-gray-400">Last Updated</div>
            <div class="text-white">{{ lastUpdated }}</div>
          </div>
          <button 
            @click="refreshData"
            :disabled="loading"
            class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
          >
            <i class="fas fa-sync-alt" :class="{ 'animate-spin': loading }"></i>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 px-6">
      <!-- Personnel Monitored Card -->
      <div 
        @click="drillDownToTab('personnel')"
        class="bg-gray-900 rounded-lg p-6 border border-gray-700 cursor-pointer transform transition-all hover:scale-105 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 group"
      >
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-600 bg-opacity-20 group-hover:bg-blue-500 group-hover:bg-opacity-30 transition-colors">
            <i class="fas fa-users text-blue-400 text-xl group-hover:text-blue-300"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-gray-400 text-sm group-hover:text-blue-300 transition-colors">Personnel Monitored</h3>
            <p class="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">
              <span v-if="loading" class="animate-pulse">...</span>
              <span v-else-if="overviewError" class="text-red-400 text-lg">Error</span>
              <span v-else>{{ overview.personnelMonitored || '0' }}</span>
            </p>
            <p v-if="overviewError" class="text-xs text-red-400 mt-1">{{ overviewError }}</p>
            <p class="text-xs text-blue-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <i class="fas fa-arrow-right mr-1"></i>Click to view details
            </p>
          </div>
        </div>
      </div>

      <!-- Active Devices Card -->
      <div 
        @click="drillDownToTab('devices')"
        class="bg-gray-900 rounded-lg p-6 border border-gray-700 cursor-pointer transform transition-all hover:scale-105 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 group"
      >
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-600 bg-opacity-20 group-hover:bg-green-500 group-hover:bg-opacity-30 transition-colors">
            <i class="fas fa-microchip text-green-400 text-xl group-hover:text-green-300"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-gray-400 text-sm group-hover:text-green-300 transition-colors">Active Devices</h3>
            <p class="text-2xl font-bold text-white group-hover:text-green-200 transition-colors">
              <span v-if="loading" class="animate-pulse">...</span>
              <span v-else-if="overviewError" class="text-red-400 text-lg">Error</span>
              <span v-else>{{ overview.activeDevices || '0' }}</span>
            </p>
            <p v-if="overviewError" class="text-xs text-red-400 mt-1">{{ overviewError }}</p>
            <p class="text-xs text-green-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <i class="fas fa-arrow-right mr-1"></i>Click to view details
            </p>
          </div>
        </div>
      </div>

      <!-- Pending Alerts Card -->
      <div 
        @click="drillDownToTab('alerts')"
        class="bg-gray-900 rounded-lg p-6 border border-gray-700 cursor-pointer transform transition-all hover:scale-105 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20 group"
      >
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-red-600 bg-opacity-20 group-hover:bg-red-500 group-hover:bg-opacity-30 transition-colors">
            <i class="fas fa-exclamation-triangle text-red-400 text-xl group-hover:text-red-300"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-gray-400 text-sm group-hover:text-red-300 transition-colors">Pending Alerts</h3>
            <p class="text-2xl font-bold text-white group-hover:text-red-200 transition-colors">
              <span v-if="loading" class="animate-pulse">...</span>
              <span v-else-if="overviewError" class="text-red-400 text-lg">Error</span>
              <span v-else>{{ overview.pendingAlerts || '0' }}</span>
            </p>
            <p v-if="overviewError" class="text-xs text-red-400 mt-1">{{ overviewError }}</p>
            <p class="text-xs text-red-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <i class="fas fa-arrow-right mr-1"></i>Click to view details
            </p>
          </div>
        </div>
      </div>

      <!-- Readings (24h) Card -->
      <div 
        @click="drillDownToTab('readings')"
        class="bg-gray-900 rounded-lg p-6 border border-gray-700 cursor-pointer transform transition-all hover:scale-105 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 group"
      >
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-600 bg-opacity-20 group-hover:bg-purple-500 group-hover:bg-opacity-30 transition-colors">
            <i class="fas fa-chart-line text-purple-400 text-xl group-hover:text-purple-300"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-gray-400 text-sm group-hover:text-purple-300 transition-colors">Readings (24h)</h3>
            <p class="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors">
              <span v-if="loading" class="animate-pulse">...</span>
              <span v-else-if="overviewError" class="text-red-400 text-lg">Error</span>
              <span v-else>{{ overview.readingsLast24h || '0' }}</span>
            </p>
            <p v-if="overviewError" class="text-xs text-red-400 mt-1">{{ overviewError }}</p>
            <p class="text-xs text-purple-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <i class="fas fa-arrow-right mr-1"></i>Click to view details
            </p>
          </div>
        </div>
      </div>

      <!-- Database Backup & Restore Card (Admin Only) -->
      <div 
        v-if="isAdmin"
        @click="navigateToBackup"
        class="bg-gray-900 rounded-lg p-6 border border-gray-700 cursor-pointer transform transition-all hover:scale-105 hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20 group"
      >
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-600 bg-opacity-20 group-hover:bg-yellow-500 group-hover:bg-opacity-30 transition-colors">
            <i class="fas fa-database text-yellow-400 text-xl group-hover:text-yellow-300"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-gray-400 text-sm group-hover:text-yellow-300 transition-colors">Database Backup & Restore</h3>
            <p class="text-lg font-bold text-white group-hover:text-yellow-200 transition-colors">
              <i class="fas fa-shield-alt mr-2"></i>Secure
            </p>
            <p class="text-xs text-yellow-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <i class="fas fa-arrow-right mr-1"></i>Click to access backup system
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-6">
      <!-- Tab Navigation -->
      <div class="bg-gray-900 rounded-lg border border-gray-700">
        <div class="border-b border-gray-700">
          <nav class="flex space-x-0">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :data-tab="tab.id"
              @click="switchTab(tab.id)"
              :class="[
                'px-6 py-4 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              ]"
            >
              <i :class="tab.icon" class="mr-2"></i>
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6 bg-gray-900">
          <!-- Personnel Tab -->
          <div v-if="activeTab === 'personnel'" class="space-y-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold">Personnel Management</h3>
              <div class="flex space-x-2">
                <input
                  v-model="personnelSearch"
                  type="text"
                  placeholder="Search personnel..."
                  class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                >
                <button @click="openAddPersonnelModal" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors">
                  <i class="fas fa-plus mr-2"></i>Add Personnel
                </button>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full bg-gray-700 rounded-lg">
                <thead>
                  <tr class="bg-gray-600">
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Personnel</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Unit</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Device</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Reading</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody v-if="personnel.length > 0" class="divide-y divide-gray-600">
                  <tr v-for="person in filteredPersonnel" :key="person.id" :data-personnel-id="person.id" class="hover:bg-gray-600 transition-colors">
                    <td class="px-4 py-3">
                      <div>
                        <div class="font-medium text-white">{{ person.rank_rate }} {{ person.lname }}, {{ person.fname }}</div>
                        <div class="text-sm text-gray-400">EDIPI: {{ person.edipi }}</div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-300">{{ person.unit_name || 'N/A' }}</td>
                    <td class="px-4 py-3 text-gray-300">{{ person.device_serial || 'No Device' }}</td>
                    <td class="px-4 py-3 text-gray-300">{{ formatDate(person.last_reading) }}</td>
                    <td class="px-4 py-3">
                      <span :class="getStatusClass(person.active)" class="px-2 py-1 text-xs font-medium rounded-full">
                        {{ person.active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex space-x-2">
                        <button 
                          @click="editPersonnel(person)"
                          class="text-blue-400 hover:text-blue-300 text-sm transition-colors px-2 py-1 rounded border border-blue-400 hover:border-blue-300"
                          :title="`Edit ${person.fname} ${person.lname}`"
                        >
                          <i class="fas fa-edit mr-1"></i>Edit
                        </button>
                        <button 
                          @click="viewPersonnelReadings(person)"
                          class="text-green-400 hover:text-green-300 text-sm transition-colors px-2 py-1 rounded border border-green-400 hover:border-green-300"
                          :title="`View readings for ${person.fname} ${person.lname}`"
                        >
                          <i class="fas fa-chart-line mr-1"></i>Readings
                        </button>
                        <button 
                          @click="openAssignmentModal(null, person)"
                          class="text-purple-400 hover:text-purple-300 text-sm transition-colors px-2 py-1 rounded border border-purple-400 hover:border-purple-300"
                          :title="`Assign device to ${person.fname} ${person.lname}`"
                        >
                          <i class="fas fa-link mr-1"></i>Assign
                        </button>
                        <button 
                          @click="deletePersonnel(person)"
                          class="text-red-400 hover:text-red-300 text-sm transition-colors px-2 py-1 rounded border border-red-400 hover:border-red-300"
                          :title="`Delete ${person.fname} ${person.lname}`"
                        >
                          <i class="fas fa-trash mr-1"></i>Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-gray-400">
                      <i class="fas fa-users text-4xl mb-4"></i>
                      <div>No personnel data available</div>
                      <div class="text-sm">{{ personnelError || 'Loading...' }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Devices Tab -->
          <div v-if="activeTab === 'devices'" class="space-y-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold">Device Inventory</h3>
              <div class="flex space-x-2">
                <select v-model="deviceFilter" class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                  <option value="">All Devices</option>
                  <option value="active">Active Only</option>
                  <option value="maintenance">Maintenance Required</option>
                </select>
                <button class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors">
                  <i class="fas fa-plus mr-2"></i>Add Device
                </button>
                <button @click="openAssignmentModal()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                  <i class="fas fa-link mr-2"></i>Assign Device
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="device in devices" :key="device.id" class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <h4 class="font-medium text-white">{{ device.serial }}</h4>
                    <p class="text-sm text-gray-400">{{ device.vendor }} {{ device.model }}</p>
                  </div>
                  <span :class="getDeviceStatusClass(device)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ device.retired_at ? 'Retired' : 'Active' }}
                  </span>
                </div>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-400">Firmware:</span>
                    <span class="text-white">{{ device.firmware || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Calibration Due:</span>
                    <span class="text-white">{{ formatDate(device.calib_due) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">RF Policy:</span>
                    <span class="text-white">{{ device.rf_policy }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Readings:</span>
                    <span class="text-white">{{ device.reading_count || 0 }}</span>
                  </div>
                </div>
                <div class="flex space-x-2 mt-4">
                  <button 
                    @click="openDeviceEditModal(device)"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm transition-colors"
                    :title="`Edit device ${device.serial}`"
                  >
                    <i class="fas fa-edit mr-1"></i>Edit
                  </button>
                  <button 
                    @click="openDeviceReadingsModal(device)"
                    class="flex-1 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm transition-colors"
                    :title="`View readings for device ${device.serial}`"
                  >
                    <i class="fas fa-chart-line mr-1"></i>Readings
                  </button>
                  <button 
                    @click="deleteDevice(device)"
                    class="flex-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm transition-colors"
                    :title="`Delete device ${device.serial}`"
                  >
                    <i class="fas fa-trash mr-1"></i>Delete
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="devices.length === 0" class="text-center text-gray-400 py-8">
              <i class="fas fa-microchip text-4xl mb-4"></i>
              <div>No devices found</div>
              <div class="text-sm">{{ devicesError || 'Loading...' }}</div>
            </div>
          </div>

          <!-- Units Tab -->
          <div v-if="activeTab === 'units'" class="space-y-4">
            <!-- Units Header -->
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-xl font-semibold text-white">Unit Management</h3>
                <p class="text-gray-400 text-sm">Manage organizational units and hierarchy</p>
              </div>
              <button
                @click="openAddUnitModal"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <i class="fas fa-plus mr-2"></i>
                Add Unit
              </button>
            </div>

            <!-- Units Table -->
            <div class="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-600">
                  <thead class="bg-gray-800">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        UIC Code
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Unit Name
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Parent Unit
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Personnel Count
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody v-if="units.length > 0" class="divide-y divide-gray-600">
                    <tr v-for="unit in units" :key="unit.id" class="hover:bg-gray-800 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <i class="fas fa-building text-blue-400 mr-2"></i>
                          <span class="text-sm font-medium text-white">{{ unit.uic }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm text-gray-300">{{ unit.name }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-300">
                          <span v-if="unit.parent_uic" class="flex items-center">
                            <i class="fas fa-level-up-alt text-gray-500 mr-1 transform rotate-90"></i>
                            {{ unit.parent_uic }}
                          </span>
                          <span v-else class="text-gray-500">Root Unit</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                          {{ getPersonnelCountForUnit(unit.id) }} personnel
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {{ formatDate(unit.created_at) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-2">
                          <button
                            @click="editUnit(unit)"
                            class="text-blue-400 hover:text-blue-300 transition-colors"
                            :title="`Edit ${unit.name}`"
                          >
                            <i class="fas fa-edit"></i>
                          </button>
                          <button
                            @click="viewUnitPersonnel(unit)"
                            class="text-green-400 hover:text-green-300 transition-colors"
                            :title="`View personnel in ${unit.name}`"
                          >
                            <i class="fas fa-users"></i>
                          </button>
                          <button
                            @click="deleteUnit(unit)"
                            class="text-red-400 hover:text-red-300 transition-colors"
                            :title="`Delete ${unit.name}`"
                          >
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <tbody v-else>
                    <tr>
                      <td colspan="6" class="px-6 py-12 text-center">
                        <div class="text-gray-400">
                          <i class="fas fa-building text-4xl mb-4"></i>
                          <p class="text-lg">No units found</p>
                          <p class="text-sm">Create your first unit to get started</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Unit Hierarchy Visualization -->
            <div v-if="units.length > 0" class="mt-8">
              <h3 class="text-lg font-semibold text-white mb-4">Unit Hierarchy</h3>
              <div class="bg-gray-900 rounded-lg border border-gray-700 p-6">
                <div class="space-y-2">
                  <div v-for="rootUnit in rootUnits" :key="rootUnit.id" class="unit-hierarchy-item">
                    <UnitHierarchyNode 
                      :unit="rootUnit" 
                      :units="units" 
                      :personnel="personnel"
                      @edit="editUnit"
                      @view-personnel="viewUnitPersonnel"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Assignments Tab -->
          <div v-if="activeTab === 'assignments'" class="space-y-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold">
                Device Assignments
                <span v-if="assignmentsPersonnelFilter" class="text-sm text-blue-400 ml-2">
                  (Filtered by Personnel)
                </span>
              </h3>
              <div class="flex space-x-2">
                <button @click="openAssignmentModal()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors">
                  <i class="fas fa-plus mr-2"></i>New Assignment
                </button>
                <button 
                  v-if="assignmentsPersonnelFilter"
                  @click="clearAssignmentsFilter"
                  class="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg transition-colors text-sm"
                  title="Clear Personnel Filter"
                >
                  <i class="fas fa-times mr-1"></i>Clear Filter
                </button>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full bg-gray-700 rounded-lg">
                <thead>
                  <tr class="bg-gray-600">
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Personnel</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Device</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Unit</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Start Date</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">End Date</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody v-if="assignments.length > 0" class="divide-y divide-gray-600">
                  <tr v-for="assignment in filteredAssignments" :key="assignment.id" class="hover:bg-gray-600 transition-colors">
                    <td class="px-4 py-3">
                      <div>
                        <div class="font-medium text-white">{{ assignment.rank_rate }} {{ assignment.lname }}, {{ assignment.fname }}</div>
                        <div class="text-sm text-gray-400">EDIPI: {{ assignment.edipi }}</div>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <div>
                        <div class="font-medium text-white">{{ assignment.device_serial }}</div>
                        <div class="text-sm text-gray-400">{{ assignment.vendor }} {{ assignment.model }}</div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-300">{{ assignment.unit_name || 'N/A' }}</td>
                    <td class="px-4 py-3 text-gray-300">{{ formatDateTime(assignment.start_ts) }}</td>
                    <td class="px-4 py-3 text-gray-300">{{ assignment.end_ts ? formatDateTime(assignment.end_ts) : 'Indefinite' }}</td>
                    <td class="px-4 py-3">
                      <span :class="getAssignmentStatusClass(assignment)" class="px-2 py-1 text-xs font-medium rounded-full">
                        {{ getAssignmentStatus(assignment) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex space-x-2">
                        <button 
                          @click="openAssignmentModal(assignment)"
                          class="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                          title="Edit Assignment"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          @click="endAssignment(assignment.id)"
                          class="text-red-400 hover:text-red-300 text-sm transition-colors"
                          title="End Assignment"
                        >
                          <i class="fas fa-stop-circle"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-gray-400">
                      <i class="fas fa-link text-4xl mb-4"></i>
                      <div>No device assignments found</div>
                      <div class="text-sm">{{ assignmentsError || 'Loading...' }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Readings Tab -->
          <div v-if="activeTab === 'readings'" class="space-y-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold">
                Dose Readings
                <span v-if="readingsPersonnelFilter" class="text-sm text-blue-400 ml-2">
                  (Filtered by Personnel)
                </span>
              </h3>
              <div class="flex space-x-2">
                <input
                  v-model="readingsDateFilter"
                  type="date"
                  class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                <select v-model="readingsPersonnelFilter" class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                  <option value="">All Personnel</option>
                  <option v-for="person in personnel" :key="person.id" :value="person.id">
                    {{ person.rank_rate }} {{ person.lname }}
                  </option>
                </select>
                <button 
                  v-if="readingsPersonnelFilter"
                  @click="clearReadingsFilter"
                  class="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg transition-colors text-sm"
                  title="Clear Personnel Filter"
                >
                  <i class="fas fa-times mr-1"></i>Clear Filter
                </button>
                <button 
                  @click="openManualDoseReadingModal"
                  class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                  title="Add Manual Dose Reading"
                >
                  <i class="fas fa-plus mr-2"></i>Manual Entry
                </button>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full bg-gray-700 rounded-lg">
                <thead>
                  <tr class="bg-gray-600">
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Personnel</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Device</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">HP(10) mSv</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">HP(0.07) mSv</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rate µSv/h</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Battery</th>
                  </tr>
                </thead>
                <tbody v-if="filteredReadings.length > 0" class="divide-y divide-gray-600">
                  <tr v-for="reading in filteredReadings" :key="reading.id" class="hover:bg-gray-600 transition-colors">
                    <td class="px-4 py-3 text-gray-300">{{ formatDateTime(reading.measured_ts) }}</td>
                    <td class="px-4 py-3 text-gray-300">{{ reading.rank_rate }} {{ reading.lname }}</td>
                    <td class="px-4 py-3 text-gray-300">{{ reading.device_serial }}</td>
                    <td class="px-4 py-3 text-white font-mono">{{ formatDose(reading.hp10_mSv) }}</td>
                    <td class="px-4 py-3 text-white font-mono">{{ formatDose(reading.hp007_mSv) }}</td>
                    <td class="px-4 py-3 text-white font-mono">{{ formatRate(reading.rate_uSv_h) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center">
                        <div class="w-16 bg-gray-600 rounded-full h-2 mr-2">
                          <div 
                            :class="getBatteryClass(reading.battery_pct)"
                            class="h-2 rounded-full transition-all"
                            :style="{ width: `${reading.battery_pct || 0}%` }"
                          ></div>
                        </div>
                        <span class="text-sm text-gray-300">{{ Math.round(reading.battery_pct || 0) }}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-gray-400">
                      <i class="fas fa-chart-line text-4xl mb-4"></i>
                      <div>No readings available</div>
                      <div class="text-sm">{{ readingsError || 'Loading...' }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Alerts Tab -->
          <div v-if="activeTab === 'alerts'" class="space-y-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold">Active Alerts</h3>
              <div class="flex space-x-2">
                <select v-model="alertsSeverityFilter" class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                  <option value="">All Severities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
                <button @click="acknowledgeAllAlerts" class="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition-colors">
                  <i class="fas fa-check-double mr-2"></i>Acknowledge All
                </button>
              </div>
            </div>
            
            <div class="space-y-3">
              <div v-for="alert in alerts" :key="alert.id" 
                   :class="getAlertCardClass(alert.severity)"
                   class="rounded-lg p-4 border">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <i :class="getAlertIcon(alert.type)" class="text-lg"></i>
                      <h4 class="font-medium text-white">{{ alert.type.replace('_', ' ') }}</h4>
                      <span :class="getSeverityBadgeClass(alert.severity)" 
                            class="px-2 py-1 text-xs font-medium rounded-full">
                        {{ alert.severity }}
                      </span>
                    </div>
                    <div class="text-sm text-gray-300 space-y-1">
                      <div><strong>Personnel:</strong> {{ alert.rank_rate }} {{ alert.lname }}, {{ alert.fname }}</div>
                      <div><strong>Device:</strong> {{ alert.device_serial }}</div>
                      <div><strong>Value:</strong> {{ alert.value }} (Threshold: {{ alert.threshold }})</div>
                      <div><strong>Time:</strong> {{ formatDateTime(alert.measured_ts) }}</div>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button @click="acknowledgeAlert(alert.id)" 
                            class="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm transition-colors">
                      <i class="fas fa-check mr-1"></i>Acknowledge
                    </button>
                    <button class="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm transition-colors">
                      <i class="fas fa-info-circle mr-1"></i>Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="alerts.length === 0" class="text-center text-gray-400 py-8">
              <i class="fas fa-shield-alt text-4xl mb-4"></i>
              <div>No active alerts</div>
              <div class="text-sm">All systems operating normally</div>
            </div>
          </div>

          <!-- Reconciliation Tab -->
          <div v-if="activeTab === 'reconciliation'" class="space-y-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold">Dose Reconciliation</h3>
              <div class="flex space-x-2">
                <select v-model="reconciliationPeriodFilter" class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                  <option value="">All Periods</option>
                  <option value="2024-Q1">2024 Q1</option>
                  <option value="2024-Q2">2024 Q2</option>
                  <option value="2024-Q3">2024 Q3</option>
                  <option value="2024-Q4">2024 Q4</option>
                </select>
                <button class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
                  <i class="fas fa-file-export mr-2"></i>Export Report
                </button>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full bg-gray-700 rounded-lg">
                <thead>
                  <tr class="bg-gray-600">
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Personnel</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Period</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Operational (mSv)</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">NDC (mSv)</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Variance (mSv)</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody v-if="reconciliations.length > 0" class="divide-y divide-gray-600">
                  <tr v-for="recon in reconciliations" :key="recon.id" class="hover:bg-gray-600 transition-colors">
                    <td class="px-4 py-3 text-gray-300">{{ recon.rank_rate }} {{ recon.lname }}, {{ recon.fname }}</td>
                    <td class="px-4 py-3 text-gray-300">{{ formatDateRange(recon.period_start, recon.period_end) }}</td>
                    <td class="px-4 py-3 text-white font-mono">{{ formatDose(recon.op_hp10_mSv) }}</td>
                    <td class="px-4 py-3 text-white font-mono">{{ formatDose(recon.ndc_hp10_mSv) }}</td>
                    <td class="px-4 py-3 font-mono" :class="getVarianceClass(recon.variance_mSv)">
                      {{ formatVariance(recon.variance_mSv) }}
                    </td>
                    <td class="px-4 py-3">
                      <span :class="getReconciliationStatusClass(recon.variance_mSv)" 
                            class="px-2 py-1 text-xs font-medium rounded-full">
                        {{ getReconciliationStatus(recon.variance_mSv) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex space-x-2">
                        <button class="text-blue-400 hover:text-blue-300 text-sm">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="text-purple-400 hover:text-purple-300 text-sm">
                          <i class="fas fa-download"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-gray-400">
                      <i class="fas fa-balance-scale text-4xl mb-4"></i>
                      <div>No reconciliation data available</div>
                      <div class="text-sm">{{ reconciliationsError || 'Loading...' }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

         <!-- Add/Edit Personnel Modal -->
     <div v-if="showPersonnelModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
       <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
         <div class="mt-3">
           <div class="flex justify-between items-center mb-4">
             <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
               {{ editingPersonnel ? 'Edit Personnel' : 'Add New Personnel' }}
             </h3>
             <button 
               @click="closePersonnelModal" 
               class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
             >
               <i class="fas fa-times text-xl"></i>
             </button>
           </div>
           
           <AddRadiationPersonnelForm
             :personnel="editingPersonnel"
             :units="units"
             @saved="onPersonnelSaved"
             @cancel="closePersonnelModal"
             @error="onPersonnelError"
           />
         </div>
       </div>
     </div>

     <!-- Device Assignment Modal -->
     <DeviceAssignmentModal
       v-if="showAssignmentModal"
       :assignment="editingAssignment"
       :personnel="personnel"
       :devices="devices"
       :visible="showAssignmentModal"
       @close="closeAssignmentModal"
       @saved="onAssignmentSaved"
       @error="onAssignmentError"
     />

     <!-- Manual Dose Reading Modal -->
     <div v-if="showManualDoseReadingModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
       <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-gray-900">
         <div class="mt-3">
           <ManualDoseReadingForm
             :devices="devices"
             :personnel="personnel"
             :currentUser="currentUser"
             @close="closeManualDoseReadingModal"
             @saved="onManualDoseReadingSaved"
             @error="onManualDoseReadingError"
           />
         </div>
       </div>
     </div>

     <!-- Unit Management Modal -->
         <UnitManagementModal
      :show="showUnitModal"
      :editing-unit="editingUnit"
      :units="units"
      @saved="onUnitSaved"
      @cancel="closeUnitModal"
      @error="onUnitError"
    />

    <!-- Device Edit Modal -->
    <DeviceEditModal
      v-if="showDeviceEditModal"
      :device="editingDevice"
      :device-models="deviceModels"
      :visible="showDeviceEditModal"
      @close="closeDeviceEditModal"
      @saved="onDeviceSaved"
      @error="onDeviceError"
    />

    <!-- Device Readings Modal -->
    <DeviceReadingsModal
      v-if="showDeviceReadingsModal"
      :device="editingDevice"
      :personnel="personnel"
      :visible="showDeviceReadingsModal"
      @close="closeDeviceReadingsModal"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import AddRadiationPersonnelForm from '../components/AddRadiationPersonnelForm.vue'
import DeviceAssignmentModal from '../components/DeviceAssignmentModal.vue'
import DeviceEditModal from '../components/DeviceEditModal.vue'
import DeviceReadingsModal from '../components/DeviceReadingsModal.vue'
import ManualDoseReadingForm from '../components/ManualDoseReadingForm.vue'
import UnitManagementModal from '../components/UnitManagementModal.vue'
import UnitHierarchyNode from '../components/UnitHierarchyNode.vue'
import { useRouter } from 'vue-router'

export default {
  name: 'RadiationDashboard',
  components: {
    AddRadiationPersonnelForm,
    DeviceAssignmentModal,
    DeviceEditModal,
    DeviceReadingsModal,
    ManualDoseReadingForm,
    UnitManagementModal,
    UnitHierarchyNode
  },
  setup() {
    // Get router instance
    const router = useRouter()
    
    // Reactive data
    const loading = ref(false)
    const lastUpdated = ref(new Date().toLocaleString())
    const activeTab = ref('personnel')
    
    // Data stores
    const overview = ref({})
    const overviewError = ref('')
    const personnel = ref([])
    const devices = ref([])
    const readings = ref([])
    const alerts = ref([])
    const reconciliations = ref([])
    const units = ref([])
    const assignments = ref([])
    
    // Modal state
    const showPersonnelModal = ref(false)
    const editingPersonnel = ref(null)
    const showAssignmentModal = ref(false)
    const editingAssignment = ref(null)
    const showManualDoseReadingModal = ref(false)
    const showUnitModal = ref(false)
    const editingUnit = ref(null)
    
    // Device modal state
    const showDeviceEditModal = ref(false)
    const showDeviceReadingsModal = ref(false)
    const editingDevice = ref(null)
    const deviceModels = ref([])
    
    // Current user (for manual entry tracking)
    const currentUser = ref('System User') // TODO: Get from auth context
    
    // Error states
    const personnelError = ref('')
    const devicesError = ref('')
    const readingsError = ref('')
    const alertsError = ref('')
    const reconciliationsError = ref('')
    const assignmentsError = ref('')
    const unitError = ref('')
    
    // Filters
    const personnelSearch = ref('')
    const deviceFilter = ref('')
    const readingsDateFilter = ref('')
    const readingsPersonnelFilter = ref('')
    const alertsSeverityFilter = ref('')
    const reconciliationPeriodFilter = ref('')

    // Computed properties for filtered data
    const filteredReadings = computed(() => {
      if (!readingsPersonnelFilter.value) return readings.value
      return readings.value.filter(reading => reading.personnel_id === readingsPersonnelFilter.value)
    })

    const filteredAssignments = computed(() => {
      if (!assignmentsPersonnelFilter.value) return assignments.value
      return assignments.value.filter(assignment => assignment.personnel_id === assignmentsPersonnelFilter.value)
    })

    // Unit management computed properties
    const rootUnits = computed(() => {
      return units.value.filter(unit => !unit.parent_uic)
    })

    // Add assignmentsPersonnelFilter variable
    const assignmentsPersonnelFilter = ref('')

    // Tab configuration
    const tabs = [
      { id: 'personnel', name: 'Personnel', icon: 'fas fa-users' },
      { id: 'devices', name: 'Devices', icon: 'fas fa-microchip' },
      { id: 'units', name: 'Units', icon: 'fas fa-building' },
      { id: 'assignments', name: 'Assignments', icon: 'fas fa-link' },
      { id: 'readings', name: 'Readings', icon: 'fas fa-chart-line' },
      { id: 'alerts', name: 'Alerts', icon: 'fas fa-exclamation-triangle' },
      { id: 'reconciliation', name: 'Reconciliation', icon: 'fas fa-balance-scale' }
    ]

    // Computed properties
    const filteredPersonnel = computed(() => {
      if (!personnelSearch.value) return personnel.value
      const search = personnelSearch.value.toLowerCase()
      return personnel.value.filter(person => 
        person.lname.toLowerCase().includes(search) ||
        person.fname.toLowerCase().includes(search) ||
        person.edipi.includes(search) ||
        person.rank_rate.toLowerCase().includes(search)
      )
    })

    // Admin check computed property
    const isAdmin = computed(() => {
      return localStorage.getItem('userRole') === 'admin'
    })

    // Navigation method for backup system
    const navigateToBackup = () => {
      router.push('/admin/backup-restore')
    }

    // API methods
    const fetchOverview = async () => {
      try {
        const response = await fetch('/api/radiation/overview')
        if (response.ok) {
          overview.value = await response.json()
        } else {
          const errorData = await response.json()
          overviewError.value = errorData.error || 'Failed to load overview data'
        }
      } catch (error) {
        console.error('Failed to fetch overview:', error)
        overviewError.value = 'Network error loading overview data'
      }
    }

    const fetchPersonnel = async () => {
      try {
        const response = await fetch('/api/radiation/personnel')
        if (response.ok) {
          personnel.value = await response.json()
        } else {
          const errorData = await response.json()
          personnelError.value = errorData.error || 'Failed to load personnel data'
        }
      } catch (error) {
        console.error('Failed to fetch personnel:', error)
        personnelError.value = 'Network error loading personnel data'
      }
    }

    const fetchUnits = async () => {
      try {
        const response = await fetch('/api/radiation/units')
        if (response.ok) {
          units.value = await response.json()
        } else {
          const errorData = await response.json()
          unitError.value = errorData.error || 'Failed to load units data'
        }
      } catch (error) {
        console.error('Failed to fetch units:', error)
        unitError.value = 'Network error loading units data'
      }
    }

    const fetchDevices = async () => {
      try {
        const response = await fetch('/api/radiation/devices')
        if (response.ok) {
          devices.value = await response.json()
        } else {
          const errorData = await response.json()
          devicesError.value = errorData.error || 'Failed to load devices data'
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error)
        devicesError.value = 'Network error loading devices data'
      }
    }

    const fetchReadings = async () => {
      try {
        const response = await fetch('/api/radiation/readings?limit=50')
        if (response.ok) {
          readings.value = await response.json()
        } else {
          const errorData = await response.json()
          readingsError.value = errorData.error || 'Failed to load readings data'
        }
      } catch (error) {
        console.error('Failed to fetch readings:', error)
        readingsError.value = 'Network error loading readings data'
      }
    }

    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/radiation/alerts')
        if (response.ok) {
          alerts.value = await response.json()
        } else {
          const errorData = await response.json()
          alertsError.value = errorData.error || 'Failed to load alerts data'
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
        alertsError.value = 'Network error loading alerts data'
      }
    }

    const fetchReconciliations = async () => {
      try {
        const response = await fetch('/api/radiation/reconciliations')
        if (response.ok) {
          reconciliations.value = await response.json()
        } else {
          const errorData = await response.json()
          reconciliationsError.value = errorData.error || 'Failed to load reconciliation data'
        }
      } catch (error) {
        console.error('Failed to fetch reconciliations:', error)
        reconciliationsError.value = 'Network error loading reconciliation data'
      }
    }

    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/radiation/assignments?active_only=true')
        if (response.ok) {
          assignments.value = await response.json()
        } else {
          const errorData = await response.json()
          assignmentsError.value = errorData.error || 'Failed to load assignments data'
        }
      } catch (error) {
        console.error('Failed to fetch assignments:', error)
        assignmentsError.value = 'Network error loading assignments data'
      }
    }

    const refreshData = async () => {
      loading.value = true
      try {
        await Promise.all([
          fetchOverview(),
          fetchPersonnel(),
          fetchDevices(),
          fetchReadings(),
          fetchAlerts(),
          fetchReconciliations(),
          fetchUnits(),
          fetchAssignments()
        ])
        lastUpdated.value = new Date().toLocaleString()
      } finally {
        loading.value = false
      }
    }

    // Modal control methods
    const openAddPersonnelModal = () => {
      editingPersonnel.value = null
      showPersonnelModal.value = true
    }

    const closePersonnelModal = () => {
      showPersonnelModal.value = false
      editingPersonnel.value = null
    }

    const onPersonnelSaved = () => {
      closePersonnelModal()
      fetchPersonnel() // Refresh the personnel list
      fetchOverview() // Refresh overview counts
    }

    const onPersonnelError = (error) => {
      console.error('Personnel save error:', error)
      // You could add a toast notification here
    }

    // Assignment modal control methods
    const openAssignmentModal = (assignment = null, personnel = null) => {
      if (personnel) {
        // Called from personnel table - set filter and switch to assignments tab
        assignmentsPersonnelFilter.value = personnel.id
        activeTab.value = 'assignments'
      }
      editingAssignment.value = assignment
      showAssignmentModal.value = true
    }

    const closeAssignmentModal = () => {
      showAssignmentModal.value = false
      editingAssignment.value = null
    }

    const onAssignmentSaved = () => {
      closeAssignmentModal()
      fetchAssignments() // Refresh the assignments list
      fetchPersonnel() // Refresh personnel to show updated device info
      fetchDevices() // Refresh devices to show updated assignment info
      fetchOverview() // Refresh overview counts
    }

    const onAssignmentError = (error) => {
      console.error('Assignment save error:', error)
      // You could add a toast notification here
    }

    // Manual dose reading modal control methods
    const openManualDoseReadingModal = () => {
      showManualDoseReadingModal.value = true
    }

    const closeManualDoseReadingModal = () => {
      showManualDoseReadingModal.value = false
    }

    const onManualDoseReadingSaved = (result) => {
      closeManualDoseReadingModal()
      fetchReadings() // Refresh the readings list
      fetchOverview() // Refresh overview counts
      console.log('Manual dose reading saved:', result)
    }

    const onManualDoseReadingError = (error) => {
      console.error('Manual dose reading error:', error)
      // You could add a toast notification here
    }

    // Unit management modal control methods
    const openAddUnitModal = () => {
      editingUnit.value = null
      showUnitModal.value = true
    }

    const closeUnitModal = () => {
      showUnitModal.value = false
      editingUnit.value = null
      unitError.value = ''
    }

    const editUnit = (unit) => {
      editingUnit.value = { ...unit }
      showUnitModal.value = true
    }

    const onUnitSaved = () => {
      closeUnitModal()
      fetchUnits()
      fetchPersonnel() // Refresh personnel to update unit assignments
    }

    const onUnitError = (error) => {
      unitError.value = error
    }

    const deleteUnit = async (unit) => {
      const confirmed = confirm(
        `⚠️ DELETE UNIT\n\n` +
        `Are you sure you want to delete:\n` +
        `• UIC: ${unit.uic}\n` +
        `• Name: ${unit.name}\n\n` +
        `This action will:\n` +
        `• Remove the unit from the system\n` +
        `• Unassign personnel from this unit\n` +
        `• Cannot be undone\n\n` +
        `Click OK to proceed with deletion.`
      )
      
      if (!confirmed) return

      try {
        const response = await fetch(`/api/radiation/units/${unit.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
          await fetchUnits()
          await fetchPersonnel() // Refresh personnel to update unit assignments
          alert(`Unit ${unit.name} has been successfully deleted.`)
        } else {
          const errorData = await response.json()
          alert(`Failed to delete unit: ${errorData.error}`)
        }
      } catch (error) {
        console.error('Failed to delete unit:', error)
        alert('An error occurred while deleting unit. Please try again.')
      }
    }

    const getPersonnelCountForUnit = (unitId) => {
      return personnel.value.filter(p => p.unit_id === unitId).length
    }

    const viewUnitPersonnel = (unit) => {
      // Filter personnel to show only this unit's personnel
      personnelSearch.value = unit.name
      activeTab.value = 'personnel'
    }

    const endAssignment = async (assignmentId) => {
      if (!confirm('Are you sure you want to end this device assignment?')) {
        return
      }

      try {
        const response = await fetch(`/api/radiation/assignments/${assignmentId}/end`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ end_ts: new Date().toISOString() })
        })

        if (response.ok) {
          await fetchAssignments()
          await fetchPersonnel()
          await fetchDevices()
          await fetchOverview()
        } else {
          const errorData = await response.json()
          console.error('Failed to end assignment:', errorData.error)
        }
      } catch (error) {
        console.error('Failed to end assignment:', error)
      }
    }

    // Edit personnel functionality
    const editPersonnel = (personnel) => {
      editingPersonnel.value = { ...personnel }
      showPersonnelModal.value = true
      
      // Add visual feedback
      nextTick(() => {
        const row = document.querySelector(`[data-personnel-id="${personnel.id}"]`)
        if (row) {
          row.classList.add('editing-highlight')
          setTimeout(() => row.classList.remove('editing-highlight'), 2000)
        }
      })
    }

    // Delete personnel functionality
    const deletePersonnel = async (personnel) => {
      // Enhanced confirmation dialog
      const confirmed = confirm(
        `⚠️ DELETE PERSONNEL\n\n` +
        `Are you sure you want to delete:\n` +
        `• ${personnel.rank_rate} ${personnel.lname}, ${personnel.fname}\n` +
        `• EDIPI: ${personnel.edipi}\n` +
        `• Unit: ${personnel.unit_name || 'N/A'}\n\n` +
        `This action will:\n` +
        `• Mark the personnel as inactive\n` +
        `• Preserve all historical data\n` +
        `• Cannot be undone\n\n` +
        `Click OK to proceed with deletion.`
      )
      
      if (!confirmed) {
        return
      }

      try {
        const response = await fetch(`/api/radiation/personnel/${personnel.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
          // Success - refresh data
          await fetchPersonnel()
          await fetchOverview()
          
          // Show success message
          alert(`${personnel.fname} ${personnel.lname} has been successfully deleted.`)
        } else {
          const errorData = await response.json()
          alert(`Failed to delete personnel: ${errorData.error}`)
        }
      } catch (error) {
        console.error('Failed to delete personnel:', error)
        alert('An error occurred while deleting personnel. Please try again.')
      }
    }

    // Delete device functionality
    const deleteDevice = async (device) => {
      // Enhanced confirmation dialog
      const confirmed = confirm(
        `⚠️ DELETE DEVICE\n\n` +
        `Are you sure you want to delete:\n` +
        `• Serial: ${device.serial}\n` +
        `• Model: ${device.vendor} ${device.model}\n` +
        `• Firmware: ${device.firmware || 'N/A'}\n` +
        `• RF Policy: ${device.rf_policy}\n\n` +
        `This action will:\n` +
        `• Mark the device as retired\n` +
        `• Preserve all historical data\n` +
        `• Cannot be undone\n\n` +
        `Click OK to proceed with deletion.`
      )
      
      if (!confirmed) {
        return
      }

      try {
        const response = await fetch(`/api/radiation/devices/${device.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
          // Success - refresh data
          await fetchDevices()
          await fetchOverview()
          
          // Show success message
          alert(`Device ${device.serial} has been successfully deleted.`)
        } else {
          const errorData = await response.json()
          alert(`Failed to delete device: ${errorData.error}`)
        }
      } catch (error) {
        console.error('Failed to delete device:', error)
        alert('An error occurred while deleting device. Please try again.')
      }
    }

    // View personnel readings
    const viewPersonnelReadings = (personnel) => {
      // Filter readings to show only this personnel's data
      readingsPersonnelFilter.value = personnel.id
      assignmentsPersonnelFilter.value = personnel.id
      activeTab.value = 'readings'
    }

    const clearReadingsFilter = () => {
      readingsPersonnelFilter.value = ''
      assignmentsPersonnelFilter.value = ''
      activeTab.value = 'readings'
    }

    const clearAssignmentsFilter = () => {
      assignmentsPersonnelFilter.value = ''
      activeTab.value = 'assignments'
    }

    // Clear all personnel filters
    const clearAllPersonnelFilters = () => {
      readingsPersonnelFilter.value = ''
      assignmentsPersonnelFilter.value = ''
    }

    // Update tab switching to clear filters when switching between tabs
    const switchTab = (tabName) => {
      // Clear personnel filters when switching away from readings or assignments tabs
      if (activeTab.value === 'readings' || activeTab.value === 'assignments') {
        if (tabName !== 'readings' && tabName !== 'assignments') {
          clearAllPersonnelFilters()
        }
      }
      activeTab.value = tabName
    }

    // Drill down functionality for overview cards
    const drillDownToTab = (tabName) => {
      // Clear any existing filters when drilling down
      clearAllPersonnelFilters()
      
      // Switch to the appropriate tab
      activeTab.value = tabName
      
      // Add visual feedback - scroll to the tab content
      nextTick(() => {
        const tabContent = document.querySelector('.bg-gray-900.rounded-lg.border.border-gray-700')
        if (tabContent) {
          tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
      
      // Add a brief highlight effect to the tab button
      const tabButton = document.querySelector(`[data-tab="${tabName}"]`)
      if (tabButton) {
        tabButton.classList.add('drill-down-highlight')
        setTimeout(() => tabButton.classList.remove('drill-down-highlight'), 2000)
      }
    }

    const acknowledgeAlert = async (alertId) => {
      try {
        const response = await fetch(`/api/radiation/alerts/${alertId}/ack`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ack_by: 'current_user' }) // TODO: Get from auth context
        })
        if (response.ok) {
          await fetchAlerts()
          await fetchOverview()
        }
      } catch (error) {
        console.error('Failed to acknowledge alert:', error)
      }
    }

    const acknowledgeAllAlerts = async () => {
      for (const alert of alerts.value) {
        await acknowledgeAlert(alert.id)
      }
    }

    // Utility methods
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString()
    }

    const formatDateRange = (startDate, endDate) => {
      if (!startDate || !endDate) return 'N/A'
      return `${formatDate(startDate)} - ${formatDate(endDate)}`
    }

    const formatDose = (value) => {
      if (value === null || value === undefined) return 'N/A'
      return parseFloat(value).toFixed(6)
    }

    const formatRate = (value) => {
      if (value === null || value === undefined) return 'N/A'
      return parseFloat(value).toFixed(2)
    }

    const formatVariance = (value) => {
      if (value === null || value === undefined) return 'N/A'
      const formatted = parseFloat(value).toFixed(6)
      return value > 0 ? `+${formatted}` : formatted
    }

    // CSS class methods
    const getStatusClass = (active) => {
      return active 
        ? 'bg-green-600 bg-opacity-20 text-green-400 border border-green-600'
        : 'bg-red-600 bg-opacity-20 text-red-400 border border-red-600'
    }

    const getDeviceStatusClass = (device) => {
      return device.retired_at
        ? 'bg-red-600 bg-opacity-20 text-red-400 border border-red-600'
        : 'bg-green-600 bg-opacity-20 text-green-400 border border-green-600'
    }

    const getBatteryClass = (percentage) => {
      if (percentage >= 60) return 'bg-green-500'
      if (percentage >= 30) return 'bg-yellow-500'
      return 'bg-red-500'
    }

    const getAlertCardClass = (severity) => {
      const baseClass = 'bg-gray-700'
      switch (severity) {
        case 'CRITICAL': return `${baseClass} border-red-500`
        case 'HIGH': return `${baseClass} border-orange-500`
        case 'MEDIUM': return `${baseClass} border-yellow-500`
        case 'LOW': return `${baseClass} border-blue-500`
        default: return `${baseClass} border-gray-600`
      }
    }

    const getAlertIcon = (type) => {
      switch (type) {
        case 'DOSE_THRESHOLD': return 'fas fa-radiation text-red-400'
        case 'BATTERY_LOW': return 'fas fa-battery-quarter text-orange-400'
        case 'DEVICE_OFFLINE': return 'fas fa-exclamation-circle text-yellow-400'
        case 'CALIBRATION_DUE': return 'fas fa-wrench text-blue-400'
        default: return 'fas fa-exclamation-triangle text-gray-400'
      }
    }

    const getSeverityBadgeClass = (severity) => {
      switch (severity) {
        case 'CRITICAL': return 'bg-red-600 bg-opacity-20 text-red-400 border border-red-600'
        case 'HIGH': return 'bg-orange-600 bg-opacity-20 text-orange-400 border border-orange-600'
        case 'MEDIUM': return 'bg-yellow-600 bg-opacity-20 text-yellow-400 border border-yellow-600'
        case 'LOW': return 'bg-blue-600 bg-opacity-20 text-blue-400 border border-blue-600'
        default: return 'bg-gray-600 bg-opacity-20 text-gray-400 border border-gray-600'
      }
    }

    const getVarianceClass = (variance) => {
      if (variance === null || variance === undefined) return 'text-gray-400'
      const absVariance = Math.abs(variance)
      if (absVariance <= 0.001) return 'text-green-400'
      if (absVariance <= 0.01) return 'text-yellow-400'
      return 'text-red-400'
    }

    const getReconciliationStatus = (variance) => {
      if (variance === null || variance === undefined) return 'Unknown'
      const absVariance = Math.abs(variance)
      if (absVariance <= 0.001) return 'Acceptable'
      if (absVariance <= 0.01) return 'Review Required'
      return 'Investigation Required'
    }

    const getReconciliationStatusClass = (variance) => {
      if (variance === null || variance === undefined) return 'bg-gray-600 bg-opacity-20 text-gray-400'
      const absVariance = Math.abs(variance)
      if (absVariance <= 0.001) return 'bg-green-600 bg-opacity-20 text-green-400 border border-green-600'
      if (absVariance <= 0.01) return 'bg-yellow-600 bg-opacity-20 text-yellow-400 border border-yellow-600'
      return 'bg-red-600 bg-opacity-20 text-red-400 border border-red-600'
    }

    // Assignment status helper functions
    const getAssignmentStatus = (assignment) => {
      if (!assignment) return 'Unknown'
      if (assignment.end_ts && new Date(assignment.end_ts) < new Date()) {
        return 'Ended'
      }
      return 'Active'
    }

    const getAssignmentStatusClass = (assignment) => {
      if (!assignment) return 'bg-gray-600 bg-opacity-20 text-gray-400'
      if (assignment.end_ts && new Date(assignment.end_ts) < new Date()) {
        return 'bg-red-600 bg-opacity-20 text-red-400 border border-red-600'
      }
      return 'bg-green-600 bg-opacity-20 text-green-400 border border-green-600'
    }

    // Device modal control methods
    const openDeviceEditModal = (device = null) => {
      editingDevice.value = device
      showDeviceEditModal.value = true
    }

    const closeDeviceEditModal = () => {
      showDeviceEditModal.value = false
      editingDevice.value = null
    }

    const openDeviceReadingsModal = (device) => {
      editingDevice.value = device
      showDeviceReadingsModal.value = true
    }

    const closeDeviceReadingsModal = () => {
      showDeviceReadingsModal.value = false
      editingDevice.value = null
    }

    const onDeviceSaved = () => {
      closeDeviceEditModal()
      fetchDevices() // Refresh the devices list
      fetchOverview() // Refresh overview counts
    }

    const onDeviceError = (error) => {
      console.error('Device save error:', error)
      // You could add a toast notification here
    }

    const fetchDeviceModels = async () => {
      try {
        const response = await fetch('/api/radiation/device-models')
        if (response.ok) {
          const data = await response.json()
          deviceModels.value = data
        } else {
          console.error('Failed to fetch device models')
        }
      } catch (error) {
        console.error('Error fetching device models:', error)
      }
    }

    // Lifecycle
    onMounted(() => {
      refreshData()
      fetchDeviceModels() // Add this line
      
      // Auto-refresh every 5 minutes
      const autoRefreshInterval = setInterval(refreshData, 5 * 60 * 1000)
      
      // Cleanup on unmount
      onUnmounted(() => {
        clearInterval(autoRefreshInterval)
      })
    })

    return {
      // Reactive data
      loading,
      lastUpdated,
      activeTab,
      overview,
      personnel,
      devices,
      readings,
      alerts,
      reconciliations,
      units,
      assignments,
      personnelError,
      devicesError,
      readingsError,
      alertsError,
      reconciliationsError,
      assignmentsError,
      overviewError,
      unitError,
      
      // Modal state
      showPersonnelModal,
      editingPersonnel,
      showAssignmentModal,
      editingAssignment,
      showManualDoseReadingModal,
      showUnitModal,
      editingUnit,
      showDeviceEditModal,
      showDeviceReadingsModal,
      editingDevice,
      deviceModels,
      currentUser,
      
      // Filters
      personnelSearch,
      deviceFilter,
      readingsDateFilter,
      readingsPersonnelFilter,
      alertsSeverityFilter,
      reconciliationPeriodFilter,
      assignmentsPersonnelFilter,
      
      // Static data
      tabs,
      
      // Computed
      filteredPersonnel,
      filteredReadings,
      filteredAssignments,
      rootUnits,
      isAdmin, // Add isAdmin to the returned object
      
      // Methods
      refreshData,
      acknowledgeAlert,
      acknowledgeAllAlerts,
      openAddPersonnelModal,
      closePersonnelModal,
      onPersonnelSaved,
      onPersonnelError,
      openAssignmentModal,
      closeAssignmentModal,
      onAssignmentSaved,
      onAssignmentError,
      openManualDoseReadingModal,
      closeManualDoseReadingModal,
      onManualDoseReadingSaved,
      onManualDoseReadingError,
      openAddUnitModal,
      closeUnitModal,
      onUnitSaved,
      onUnitError,
      editUnit,
      deleteUnit,
      getPersonnelCountForUnit,
      viewUnitPersonnel,
      endAssignment,
      editPersonnel,
      deletePersonnel,
      deleteDevice,
      viewPersonnelReadings,
      clearReadingsFilter,
      clearAssignmentsFilter,
      clearAllPersonnelFilters,
      switchTab,
      drillDownToTab,
      formatDate,
      formatDateTime,
      formatDateRange,
      formatDose,
      formatRate,
      formatVariance,
      getStatusClass,
      getDeviceStatusClass,
      getBatteryClass,
      getAlertCardClass,
      getAlertIcon,
      getSeverityBadgeClass,
      getVarianceClass,
      getReconciliationStatus,
      getReconciliationStatusClass,
      getAssignmentStatus,
      getAssignmentStatusClass,
      navigateToBackup, // Add navigateToBackup to the returned object
      openDeviceEditModal,
      closeDeviceEditModal,
      openDeviceReadingsModal,
      closeDeviceReadingsModal,
      onDeviceSaved,
      onDeviceError,
      fetchDeviceModels
    }
  }
}
</script>

<style scoped>
/* Custom styles for better visual hierarchy */
.bg-gray-750 {
  background-color: #1f2937;
}

/* Ensure tables are readable on dark backgrounds */
table {
  border-collapse: separate;
  border-spacing: 0;
}

/* Animation for loading states */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Editing highlight animation */
.editing-highlight {
  animation: highlightRow 2s ease-out;
}

@keyframes highlightRow {
  0% { background: rgba(59, 130, 246, 0.3); }
  100% { background: transparent; }
}

/* Drill down highlight animation */
.drill-down-highlight {
  animation: drillDownHighlight 2s ease-out;
}

@keyframes drillDownHighlight {
  0% { 
    background: rgba(59, 130, 246, 0.3);
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
  100% { 
    background: transparent;
    transform: scale(1);
    box-shadow: none;
  }
}

/* Custom scrollbar for black theme */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #111827;
}

::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>
