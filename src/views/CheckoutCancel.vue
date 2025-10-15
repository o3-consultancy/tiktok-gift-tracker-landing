<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <!-- Cancel Icon -->
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
          <svg class="h-10 w-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Checkout Cancelled
        </h1>

        <p class="text-gray-600 mb-8">
          Your payment was cancelled. No charges have been made to your account.
        </p>

        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
          <h3 class="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p class="text-sm text-gray-600 mb-3">
            If you experienced any issues during checkout or have questions about our plans, we're here to help!
          </p>
          <div class="text-sm text-gray-700 space-y-1">
            <p><strong>Email:</strong> support@o3-ttgifts.com</p>
            <p><strong>Phone:</strong> +971 4 258 2613</p>
          </div>
        </div>

        <div class="space-y-3">
          <router-link to="/#pricing" class="block w-full btn-primary">
            View Pricing Again
          </router-link>
          <router-link to="/contact" class="block w-full btn-outline">
            Contact Support
          </router-link>
          <router-link to="/" class="block w-full text-gray-600 hover:text-gray-900">
            Return to Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Checkout cancel page
</script>
