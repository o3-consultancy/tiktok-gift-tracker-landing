<template>
  <div id="app">
    <router-view />
    <CookieConsent />
  </div>
</template>

<script setup lang="ts">
import CookieConsent from '@/components/CookieConsent.vue'
</script>
