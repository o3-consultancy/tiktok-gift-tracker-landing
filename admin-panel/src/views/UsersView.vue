<template>
  <div class="min-h-screen bg-gray-100">
    <Sidebar :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen" />

    <div class="lg:pl-64">
      <Header title="Users Management" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="p-6">
        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-600">Loading users...</p>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
          <div class="flex items-start space-x-3">
            <svg class="w-6 h-6 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div>
              <h3 class="text-lg font-semibold text-red-900">Error Loading Users</h3>
              <p class="text-red-700 mt-1">{{ error }}</p>
              <button @click="loadUsers()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Retry
              </button>
            </div>
          </div>
        </div>

        <!-- Users table -->
        <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">All Users</h2>
            <div class="text-sm text-gray-600">
              Total: {{ pagination?.total || 0 }}
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="user in users" :key="user._id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span class="text-blue-700 font-semibold text-sm">{{ getUserInitials(user) }}</span>
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
                    <span :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    ]">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div v-if="user.subscription">
                      <p class="text-sm font-medium text-gray-900">{{ user.subscription.plan }}</p>
                      <p class="text-xs text-gray-500">{{ user.subscription.status }}</p>
                    </div>
                    <span v-else class="text-sm text-gray-400">No subscription</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ formatDate(user.createdAt) }}
                  </td>
                </tr>
                <tr v-if="!users.length">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">No users found</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="pagination && pagination.pages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div class="text-sm text-gray-600">
              Page {{ pagination.page }} of {{ pagination.pages }}
            </div>
            <div class="flex space-x-2">
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page === 1"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page === pagination.pages"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import Header from '../components/Header.vue';
import { adminApiService, type UserWithSubscription, type PaginationMeta } from '../services/adminApi';

const sidebarOpen = ref(false);
const users = ref<UserWithSubscription[]>([]);
const pagination = ref<PaginationMeta | null>(null);
const loading = ref(true);
const error = ref('');
const currentPage = ref(1);

const loadUsers = async (page: number = 1) => {
  loading.value = true;
  error.value = '';

  try {
    const response = await adminApiService.users.getAll(page, 20);
    users.value = response.data.data.users;
    pagination.value = response.data.data.pagination;
    currentPage.value = page;
  } catch (err: any) {
    console.error('Error loading users:', err);
    error.value = err.response?.data?.message || 'Failed to load users';
  } finally {
    loading.value = false;
  }
};

const changePage = (page: number) => {
  void loadUsers(page);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getUserInitials = (user: UserWithSubscription) => {
  const name = user.displayName || user.email || 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

onMounted(() => {
  loadUsers();
});
</script>
