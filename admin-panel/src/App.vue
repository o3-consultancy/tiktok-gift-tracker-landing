<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAdminAuthStore } from './stores/adminAuth';

const authStore = useAdminAuthStore();

onMounted(async () => {
  await authStore.initAuth();
});
</script>
