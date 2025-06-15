<template>
  <LoginLanding @login="onLogin" />
</template>

<script setup>
import LoginLanding from './components/LoginLanding.vue'

function onLogin(payload) {
  console.log('Logged in with', payload)
}
</script>

<style scoped>
</style>
