<template>
  <div class="min-h-screen bg-gray-100">
    <Sidebar :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen" />

    <div class="lg:pl-64">
      <Header title="Analytics" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="p-6">
        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-600">Loading analytics...</p>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
          <div class="flex items-start space-x-3">
            <svg class="w-6 h-6 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div>
              <h3 class="text-lg font-semibold text-red-900">Error Loading Analytics</h3>
              <p class="text-red-700 mt-1">{{ error }}</p>
              <button @click="loadAnalytics" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Retry
              </button>
            </div>
          </div>
        </div>

        <!-- Analytics content -->
        <div v-else class="space-y-6">
          <!-- 30-day metrics -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- New Users Last 30 Days -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
              <h3 class="text-3xl font-bold text-gray-900">{{ analytics?.newUsersLast30Days || 0 }}</h3>
              <p class="text-sm text-gray-600 mt-1">New Users (Last 30 Days)</p>
            </div>

            <!-- Revenue Last 30 Days -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 class="text-3xl font-bold text-gray-900">${{ formatRevenue(analytics?.revenueLast30Days) }}</h3>
              <p class="text-sm text-gray-600 mt-1">Revenue (Last 30 Days)</p>
            </div>
          </div>

          <!-- Subscription Breakdown -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Active Subscriptions by Plan</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div v-for="plan in analytics?.subscriptionBreakdown" :key="plan._id" class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span class="text-blue-700 font-bold text-lg">{{ plan.count }}</span>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 capitalize">{{ plan._id }}</h3>
                      <p class="text-sm text-gray-600">Active subscriptions</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="w-48 bg-gray-200 rounded-full h-3">
                      <div
                        class="bg-blue-600 h-3 rounded-full"
                        :style="{ width: getPercentage(plan.count) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
                <div v-if="!analytics?.subscriptionBreakdown?.length" class="text-center py-8 text-gray-500">
                  No active subscriptions
                </div>
              </div>
            </div>
          </div>

          <!-- Info cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                <div>
                  <h3 class="text-sm font-semibold text-blue-900">Growth Metrics</h3>
                  <p class="text-sm text-blue-800 mt-2">
                    Track user acquisition and revenue trends over the past 30 days. Use this data to identify growth patterns and opportunities.
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 text-purple-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <div>
                  <h3 class="text-sm font-semibold text-purple-900">Subscription Distribution</h3>
                  <p class="text-sm text-purple-800 mt-2">
                    Monitor which subscription tiers are most popular. This helps optimize pricing and feature distribution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import Header from '../components/Header.vue';
import { adminApiService, type AnalyticsData } from '../services/adminApi';

const sidebarOpen = ref(false);
const analytics = ref<AnalyticsData | null>(null);
const loading = ref(true);
const error = ref('');

const loadAnalytics = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await adminApiService.analytics.getData();
    analytics.value = response.data.data;
  } catch (err: any) {
    console.error('Error loading analytics:', err);
    error.value = err.response?.data?.message || 'Failed to load analytics data';
  } finally {
    loading.value = false;
  }
};

const formatRevenue = (amount: number = 0) => {
  // Convert cents to dollars
  return (amount / 100).toFixed(2);
};

const totalSubscriptions = computed(() => {
  return analytics.value?.subscriptionBreakdown?.reduce((sum, plan) => sum + plan.count, 0) || 1;
});

const getPercentage = (count: number) => {
  return ((count / totalSubscriptions.value) * 100).toFixed(0);
};

onMounted(() => {
  loadAnalytics();
});
</script>
