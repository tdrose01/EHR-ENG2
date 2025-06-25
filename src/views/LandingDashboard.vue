<template>
  <div class="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
    <!-- Top bar with avatars and search -->
    <div class="w-full max-w-5xl flex items-center justify-between mb-10">
      <div class="flex items-center space-x-2">
        <img v-for="n in 4" :key="n" :src="`https://randomuser.me/api/portraits/men/${n+10}.jpg`" class="w-12 h-12 rounded-full border-2 border-blue-500 shadow-lg" />
        <button class="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl text-blue-400 border-2 border-gray-700 ml-2">+</button>
      </div>
      <input type="text" placeholder="Search" class="bg-gray-900 rounded-full px-6 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-72" />
    </div>

    <!-- Profile and Health Overview -->
    <div class="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
      <div class="col-span-1 flex flex-col items-center bg-gray-900 rounded-3xl shadow-xl p-8">
        <img src="https://randomuser.me/api/portraits/men/15.jpg" class="w-24 h-24 rounded-full border-4 border-blue-500 mb-4 shadow-lg" />
        <div class="text-2xl font-bold">Kristian Loup</div>
        <div class="text-gray-400 mb-4">30 years old</div>
        <div class="flex space-x-4 mt-2">
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold shadow">Profile</button>
          <button class="bg-gray-800 hover:bg-gray-700 text-blue-400 px-4 py-2 rounded-full font-semibold shadow">Settings</button>
        </div>
      </div>
      <div class="col-span-2 flex flex-col space-y-8">
        <div class="flex space-x-8">
          <div class="bg-white text-black rounded-3xl shadow-xl p-8 flex-1 flex flex-col justify-between min-h-[180px]">
            <div class="text-lg font-semibold mb-2">Health Overview</div>
            <div class="text-3xl font-bold mb-2">Blood Circulatory</div>
            <div class="flex space-x-2 mt-4">
              <button class="bg-blue-500 text-white rounded-full px-4 py-2 shadow">+</button>
              <button class="bg-blue-100 text-blue-700 rounded-full px-4 py-2 shadow">Docs</button>
            </div>
          </div>
          <div class="bg-blue-600 text-white rounded-3xl shadow-xl p-8 flex-1 flex flex-col justify-between min-h-[180px]">
            <div class="flex items-center justify-between mb-2">
              <span class="bg-blue-400 text-xs px-3 py-1 rounded-full">Recession</span>
              <button class="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-xl">→</button>
            </div>
            <div class="text-xl font-bold mb-1">Coronary Artery Disease</div>
            <div class="text-sm">19 markers</div>
            <button class="bg-white text-blue-600 rounded-full px-4 py-2 mt-4 shadow">+</button>
          </div>
        </div>
        <div class="flex space-x-8">
          <div class="bg-gray-900 rounded-3xl shadow-xl p-8 flex-1">
            <div class="text-lg font-semibold mb-2">Vital Signs</div>
            <div class="flex items-center space-x-4">
              <div class="flex flex-col items-center">
                <span class="text-xs text-gray-400">Erythrocytes</span>
                <span class="text-blue-400 font-bold text-lg">8.20 Bil/L</span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-xs text-gray-400">Oxygen</span>
                <span class="text-blue-400 font-bold text-lg">90%</span>
              </div>
            </div>
            <!-- Placeholder for chart -->
            <div class="mt-4 h-16 bg-gradient-to-r from-blue-900 to-blue-400 rounded-xl opacity-60"></div>
          </div>
          <div class="bg-gray-900 rounded-3xl shadow-xl p-8 flex-1 flex flex-col justify-between">
            <div class="text-lg font-semibold mb-2">Allergies</div>
            <div class="text-blue-400 font-bold mb-1">Penicillin, IV contrast Dye</div>
            <button class="bg-blue-600 text-white rounded-full px-4 py-2 mt-4 shadow">+</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// This is a static mockup. Replace with real data and navigation as needed.
</script> 