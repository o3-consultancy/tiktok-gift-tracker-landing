<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <router-link to="/">
          <img class="mx-auto h-16 w-auto" src="@/assets/o3-tt-gifts-logo.svg" alt="O3 TT Gifts" />
        </router-link>
        <h1 class="mt-6 text-3xl font-bold text-gray-900">Complete Your Subscription</h1>
        <p class="mt-2 text-gray-600">
          Secure checkout powered by Stripe
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-sm p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading checkout...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex items-center">
          <svg class="h-6 w-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="text-lg font-medium text-red-800">Checkout Error</h3>
            <p class="mt-1 text-red-700">{{ errorMessage }}</p>
          </div>
        </div>
        <div class="mt-4">
          <button @click="router.push('/')" class="btn-outline">
            Return to Home
          </button>
        </div>
      </div>

      <!-- Checkout Form -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Order Summary -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

          <!-- Selected Plan -->
          <div v-if="selectedPlan" class="border-b border-gray-200 pb-6 mb-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ selectedPlan.name }} Plan</h3>
                <p class="text-sm text-gray-600 mt-1">Monthly subscription</p>
              </div>
              <p class="text-lg font-bold text-gray-900">${{ (selectedPlan.monthlyPrice / 100).toFixed(2) }}/mo</p>
            </div>

            <!-- Features -->
            <div class="space-y-2">
              <div class="flex items-center text-sm text-gray-700">
                <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ selectedPlan.accounts }} TikTok Account{{ selectedPlan.accounts > 1 ? 's' : '' }}
              </div>
              <div class="flex items-center text-sm text-gray-700">
                <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ selectedPlan.giftGroups }} Gift Groups
              </div>
              <div v-for="feature in selectedPlan.features" :key="feature" class="flex items-center text-sm text-gray-700">
                <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ feature }}
              </div>
            </div>
          </div>

          <!-- One-time Deployment Fee -->
          <div class="border-b border-gray-200 pb-6 mb-6">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">One-Time Setup Fee</h3>
                <p class="text-sm text-gray-600 mt-1">Deployment and configuration</p>
              </div>
              <p class="text-lg font-bold text-gray-900">$500.00</p>
            </div>
          </div>

          <!-- Total Today -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-700">Setup Fee</span>
              <span class="text-gray-900 font-medium">$500.00</span>
            </div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-700">First Month</span>
              <span class="text-gray-900 font-medium">${{ selectedPlan ? (selectedPlan.monthlyPrice / 100).toFixed(2) : '0.00' }}</span>
            </div>
            <div class="border-t border-gray-300 mt-2 pt-2 flex justify-between items-center">
              <span class="text-lg font-bold text-gray-900">Total Due Today</span>
              <span class="text-2xl font-bold text-primary-600">
                ${{ totalDueToday.toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Billing Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div class="text-sm text-blue-800">
                <p class="font-medium mb-1">Billing Information</p>
                <ul class="list-disc list-inside space-y-1">
                  <li>You will be charged ${{ totalDueToday.toFixed(2) }} today</li>
                  <li>Recurring monthly charge of ${{ selectedPlan ? (selectedPlan.monthlyPrice / 100).toFixed(2) : '0.00' }} starts next month</li>
                  <li>Cancel anytime with no additional fees</li>
                  <li>30-day money-back guarantee</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Checkout Actions -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Secure Checkout</h3>

            <button
              @click="proceedToStripe"
              :disabled="processingPayment"
              class="w-full btn-primary mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ processingPayment ? 'Processing...' : 'Proceed to Payment' }}
            </button>

            <div class="text-center mb-4">
              <p class="text-xs text-gray-500">
                Powered by
                <span class="font-semibold">Stripe</span>
              </p>
            </div>

            <!-- Security Badges -->
            <div class="border-t border-gray-200 pt-4">
              <div class="flex items-center justify-center space-x-4 text-gray-400">
                <svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                <div class="text-xs text-center">
                  <p class="font-medium text-gray-700">SSL Encrypted</p>
                  <p class="text-gray-500">Secure Payment</p>
                </div>
              </div>
            </div>

            <div class="mt-4 text-xs text-gray-500 text-center">
              <p>
                By completing your purchase you agree to our
                <router-link to="/terms-of-service" class="text-primary-600 hover:underline">Terms of Service</router-link>
                and
                <router-link to="/privacy-policy" class="text-primary-600 hover:underline">Privacy Policy</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/services/api';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(true);
const processingPayment = ref(false);
const errorMessage = ref('');
const selectedPlan = ref<any>(null);

const PLANS = {
  STARTER: {
    name: 'Starter',
    monthlyPrice: 3000,
    accounts: 1,
    giftGroups: 5,
    features: ['Real-time Analytics', 'Basic Overlay Styles', 'Email Support', '7-day Data Retention']
  },
  PROFESSIONAL: {
    name: 'Professional',
    monthlyPrice: 8000,
    accounts: 3,
    giftGroups: 15,
    features: ['Advanced Analytics', 'All Overlay Styles', 'Chat Monitoring', 'Priority Support', '30-day Data Retention', 'Custom Reports']
  },
  ENTERPRISE: {
    name: 'Enterprise',
    monthlyPrice: 23000,
    accounts: 20,
    giftGroups: 50,
    features: ['AI-Powered Analytics', 'Custom Overlay Designs', 'Team Collaboration', '24/7 Phone Support', 'Unlimited Data Retention', 'API Access', 'White-label Options']
  }
};

const totalDueToday = computed(() => {
  if (!selectedPlan.value) return 0;
  return 500 + (selectedPlan.value.monthlyPrice / 100);
});

onMounted(async () => {
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    });
    return;
  }

  // Get plan from query params
  const planParam = route.query.plan as string;
  if (!planParam || !(planParam in PLANS)) {
    errorMessage.value = 'Invalid plan selected. Please choose a plan from the pricing page.';
    loading.value = false;
    return;
  }

  selectedPlan.value = PLANS[planParam as keyof typeof PLANS];
  loading.value = false;
});

const proceedToStripe = async () => {
  try {
    processingPayment.value = true;
    errorMessage.value = '';

    const planParam = route.query.plan as string;

    // Create checkout session
    const response = await apiService.payments.createCheckoutSession({
      plan: planParam,
      accountCount: selectedPlan.value.accounts
    });

    // Redirect to Stripe Checkout
    if (response.data.data.url) {
      window.location.href = response.data.data.url;
    } else {
      throw new Error('No checkout URL returned');
    }
  } catch (error: any) {
    console.error('Checkout error:', error);
    errorMessage.value = error.response?.data?.message || 'Failed to create checkout session. Please try again.';
    processingPayment.value = false;
  }
};
</script>
