<template>
  <div class="min-h-screen bg-gray-100">
    <Sidebar :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen" />

    <div class="lg:pl-64">
      <Header title="TikTok Accounts Management" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="p-6">
        <!-- Filter bar -->
        <div class="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-gray-700">Filter by status:</label>
            <select
              v-model="statusFilter"
              @change="loadAccounts()"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-600">Loading accounts...</p>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
          <div class="flex items-start space-x-3">
            <svg class="w-6 h-6 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div>
              <h3 class="text-lg font-semibold text-red-900">Error Loading Accounts</h3>
              <p class="text-red-700 mt-1">{{ error }}</p>
              <button @click="loadAccounts()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Retry
              </button>
            </div>
          </div>
        </div>

        <!-- Accounts table -->
        <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">TikTok Accounts</h2>
            <div class="text-sm text-gray-600">
              Total: {{ pagination?.total || 0 }}
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Live URL</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="account in accounts" :key="account._id" class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ account.accountName }}</p>
                      <p class="text-xs text-gray-500">{{ account.accountHandle || 'N/A' }}</p>
                      <p class="text-xs text-gray-400">ID: {{ account.accountId }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ account.userId.displayName || 'N/A' }}</p>
                      <p class="text-xs text-gray-500">{{ account.userId.email }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      account.status === 'active' ? 'bg-green-100 text-green-800' :
                      account.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    ]">
                      {{ account.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div v-if="editingAccount === account._id">
                      <input
                        v-model="editUrl"
                        type="url"
                        placeholder="https://..."
                        class="w-64 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        @keyup.enter="saveUrl(account._id)"
                        @keyup.esc="cancelEdit"
                      />
                    </div>
                    <div v-else>
                      <p v-if="account.accessUrl" class="text-sm text-blue-600 truncate max-w-xs">
                        <a :href="account.accessUrl" target="_blank" class="hover:underline">{{ account.accessUrl }}</a>
                      </p>
                      <p v-else class="text-sm text-gray-400">Not assigned</p>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ formatDate(account.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div v-if="editingAccount === account._id" class="flex justify-end space-x-2">
                      <button
                        @click="saveUrl(account._id)"
                        :disabled="updating"
                        class="text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        @click="cancelEdit"
                        :disabled="updating"
                        class="text-gray-600 hover:text-gray-700 font-medium disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                    <div v-else class="flex justify-end space-x-2">
                      <button
                        @click="startEdit(account)"
                        class="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {{ account.accessUrl ? 'Edit URL' : 'Assign URL' }}
                      </button>
                      <button
                        v-if="account.status === 'pending'"
                        @click="updateStatus(account._id, 'active')"
                        class="text-green-600 hover:text-green-700 font-medium"
                      >
                        Activate
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!accounts.length">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">No accounts found</td>
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
import { adminApiService, type TikTokAccountWithUser, type PaginationMeta } from '../services/adminApi';

const sidebarOpen = ref(false);
const accounts = ref<TikTokAccountWithUser[]>([]);
const pagination = ref<PaginationMeta | null>(null);
const loading = ref(true);
const error = ref('');
const currentPage = ref(1);
const statusFilter = ref('');

const editingAccount = ref<string | null>(null);
const editUrl = ref('');
const updating = ref(false);

const loadAccounts = async (page: number = 1) => {
  loading.value = true;
  error.value = '';

  try {
    const response = await adminApiService.accounts.getAll(page, 50, statusFilter.value || undefined);
    accounts.value = response.data.data.accounts;
    pagination.value = response.data.data.pagination;
    currentPage.value = page;
  } catch (err: any) {
    console.error('Error loading accounts:', err);
    error.value = err.response?.data?.message || 'Failed to load accounts';
  } finally {
    loading.value = false;
  }
};

const changePage = (page: number) => {
  void loadAccounts(page);
};

const startEdit = (account: TikTokAccountWithUser) => {
  editingAccount.value = account._id;
  editUrl.value = account.accessUrl || '';
};

const cancelEdit = () => {
  editingAccount.value = null;
  editUrl.value = '';
};

const saveUrl = async (accountId: string) => {
  updating.value = true;

  try {
    await adminApiService.accounts.update(accountId, {
      accessUrl: editUrl.value
    });

    // Refresh the list
    await loadAccounts(currentPage.value);
    cancelEdit();
  } catch (err: any) {
    console.error('Error updating URL:', err);
    alert(err.response?.data?.message || 'Failed to update URL');
  } finally {
    updating.value = false;
  }
};

const updateStatus = async (accountId: string, status: string) => {
  try {
    await adminApiService.accounts.update(accountId, { status });
    await loadAccounts(currentPage.value);
  } catch (err: any) {
    console.error('Error updating status:', err);
    alert(err.response?.data?.message || 'Failed to update status');
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  loadAccounts();
});
</script>
