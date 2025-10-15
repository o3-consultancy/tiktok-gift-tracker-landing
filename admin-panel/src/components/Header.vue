<template>
  <div class="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
    <div class="flex items-center justify-between h-16 px-6">
      <button
        @click="$emit('toggle-sidebar')"
        class="lg:hidden text-gray-500 hover:text-gray-700"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>

      <div class="flex items-center space-x-4">
        <span class="text-sm text-gray-600">
          {{ currentDate }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineProps<{
  title: string;
}>();

defineEmits<{
  'toggle-sidebar': []
}>();

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});
</script>
