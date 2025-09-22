<template>
  <div v-if="showBanner" class="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 shadow-lg">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex-1">
        <p class="text-sm">
          We use cookies to enhance your experience and analyze our traffic. By continuing to use our website, you consent to our use of cookies. 
          <router-link to="/cookie-policy" class="text-primary-400 hover:underline ml-1">Learn more</router-link>
        </p>
      </div>
      <div class="flex gap-3">
        <button 
          @click="acceptAll"
          class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Accept All
        </button>
        <button 
          @click="acceptEssential"
          class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Essential Only
        </button>
        <button 
          @click="dismiss"
          class="text-gray-400 hover:text-white p-2"
          aria-label="Close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showBanner = ref(false)

onMounted(() => {
  // Check if user has already made a choice
  const consent = localStorage.getItem('cookie-consent')
  if (!consent) {
    showBanner.value = true
  }
})

const acceptAll = () => {
  localStorage.setItem('cookie-consent', 'all')
  showBanner.value = false
  // Here you would typically enable all cookies/analytics
}

const acceptEssential = () => {
  localStorage.setItem('cookie-consent', 'essential')
  showBanner.value = false
  // Here you would typically enable only essential cookies
}

const dismiss = () => {
  localStorage.setItem('cookie-consent', 'dismissed')
  showBanner.value = false
}
</script>
