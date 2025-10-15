<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <Sidebar :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen" />

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Header -->
      <Header title="Dashboard" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Page content -->
      <main class="p-6">
        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-600">Loading dashboard...</p>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
          <div class="flex items-start space-x-3">
            <svg class="w-6 h-6 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div>
              <h3 class="text-lg font-semibold text-red-900">Error Loading Dashboard</h3>
              <p class="text-red-700 mt-1">{{ error }}</p>
              <button
                @click="loadDashboard"
                class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>

        <!-- Dashboard content -->
        <div v-else>
          <!-- Stats grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Total Users -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <h3 class="text-2xl font-bold text-gray-900">{{ stats?.totalUsers || 0 }}</h3>
              <p class="text-sm text-gray-600 mt-1">Total Users</p>
            </div>

            <!-- Active Subscriptions -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 class="text-2xl font-bold text-gray-900">{{ stats?.activeSubscriptions || 0 }}</h3>
              <p class="text-sm text-gray-600 mt-1">Active Subscriptions</p>
            </div>

            <!-- Total Accounts -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 class="text-2xl font-bold text-gray-900">{{ stats?.totalAccounts || 0 }}</h3>
              <p class="text-sm text-gray-600 mt-1">TikTok Accounts</p>
            </div>

            <!-- Total Revenue -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 class="text-2xl font-bold text-gray-900">${{ formatRevenue(stats?.totalRevenue) }}</h3>
              <p class="text-sm text-gray-600 mt-1">Total Revenue</p>
            </div>
          </div>

          <!-- Recent Users -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Recent Users</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="user in stats?.recentUsers" :key="user._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span class="text-blue-700 font-semibold text-xs">{{ getUserInitials(user) }}</span>
                        </div>
                        <div class="ml-3">
                          <p class="text-sm font-medium text-gray-900">{{ user.displayName || 'N/A' }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <p class="text-sm text-gray-600">{{ user.email }}</p>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <p class="text-sm text-gray-600">{{ formatDate(user.createdAt) }}</p>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <router-link :to="`/users?id=${user._id}`" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Details
                      </router-link>
                    </td>
                  </tr>
                  <tr v-if="!stats?.recentUsers?.length">
                    <td colspan="4" class="px-6 py-8 text-center text-gray-500">No recent users found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <router-link to="/users" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Manage Users</h3>
                  <p class="text-sm text-gray-600">View and manage all users</p>
                </div>
              </div>
            </router-link>

            <router-link to="/accounts" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">TikTok Accounts</h3>
                  <p class="text-sm text-gray-600">Assign live stream URLs</p>
                </div>
              </div>
            </router-link>

            <router-link to="/analytics" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Analytics</h3>
                  <p class="text-sm text-gray-600">View detailed reports</p>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </main>
    </div>

    <!-- Overlay for mobile -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import Header from '../components/Header.vue';
import { adminApiService, type DashboardStats } from '../services/adminApi';

const sidebarOpen = ref(false);
const stats = ref<DashboardStats | null>(null);
const loading = ref(true);
const error = ref('');

const loadDashboard = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await adminApiService.dashboard.getStats();
    stats.value = response.data.data;
  } catch (err: any) {
    console.error('Error loading dashboard:', err);
    error.value = err.response?.data?.message || 'Failed to load dashboard data';
  } finally {
    loading.value = false;
  }
};

const formatRevenue = (amount: number = 0) => {
  // Convert cents to dollars
  return (amount / 100).toFixed(2);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getUserInitials = (user: any) => {
  const name = user.displayName || user.email || 'U';
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
};

onMounted(() => {
  loadDashboard();
});
</script>
