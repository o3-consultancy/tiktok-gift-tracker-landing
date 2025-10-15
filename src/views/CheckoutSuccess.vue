<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <!-- Success Icon -->
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg class="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>

        <p class="text-gray-600 mb-8">
          Thank you for subscribing to O3 TT Gifts. Your subscription is now active and your account is being set up.
        </p>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 class="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ul class="text-sm text-blue-800 space-y-2">
            <li class="flex items-start">
              <svg class="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>Check your email for a confirmation receipt</span>
            </li>
            <li class="flex items-start">
              <svg class="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>Access your dashboard to set up your TikTok accounts</span>
            </li>
            <li class="flex items-start">
              <svg class="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>Our team will complete your deployment within 24 hours</span>
            </li>
          </ul>
        </div>

        <div class="space-y-3">
          <router-link to="/app/dashboard" class="block w-full btn-primary">
            Go to Dashboard
          </router-link>
          <router-link to="/" class="block w-full btn-outline">
            Return to Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Checkout success page
</script>
