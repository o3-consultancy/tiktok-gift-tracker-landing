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
              <option value="disconnection">Disconnection Requests</option>
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
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracker Instance</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deployment Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <template v-for="account in accounts" :key="account.id || account._id">
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ account.accountName }}</p>
                      <p class="text-xs text-gray-500">{{ account.accountHandle || 'N/A' }}</p>
                      <p class="text-xs text-gray-400">ID: {{ account.accountId }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ account.user?.displayName || account.userId?.displayName || 'N/A' }}</p>
                      <p class="text-xs text-gray-500">{{ account.user?.email || account.userId?.email || 'N/A' }}</p>
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
                  <td class="px-6 py-4 whitespace-nowrap">
                    <button
                      @click="toggleInstancePanel(getAccountId(account))"
                      class="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                    >
                      <span>{{ expandedInstance === getAccountId(account) ? 'Hide' : 'Manage' }}</span>
                      <svg
                        :class="['w-4 h-4 transition-transform', expandedInstance === getAccountId(account) ? 'rotate-180' : '']"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ formatDate(account.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <!-- Show disconnect button if disconnection requested -->
                    <div v-if="account.disconnectionRequested" class="flex items-center space-x-2">
                      <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Disconnection Requested
                      </span>
                      <button
                        @click="handleDisconnect(getAccountId(account))"
                        class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Disconnect & Delete
                      </button>
                    </div>
                    <!-- Show normal deployment status -->
                    <span v-else :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      getDeploymentStatus(getAccountId(account)).class
                    ]">
                      {{ getDeploymentStatus(getAccountId(account)).label }}
                    </span>
                  </td>
                </tr>
                <!-- Expanded Instance Management Panel -->
                <tr v-if="expandedInstance === getAccountId(account)" class="bg-gray-50">
                  <td colspan="6" class="px-6 py-6">
                    <div class="bg-white rounded-lg border border-gray-200 p-6 max-w-4xl">
                      <h3 class="text-lg font-semibold text-gray-900 mb-4">Tracker Instance Configuration</h3>

                      <!-- Loading State -->
                      <div v-if="instanceLoading" class="flex items-center justify-center py-8">
                        <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>

                      <!-- Instance Details -->
                      <div v-else class="space-y-4">
                        <!-- Account ID -->
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <label class="block text-sm font-medium text-gray-700 mb-2">Account ID</label>
                          <div class="flex items-center space-x-2">
                            <code class="flex-1 bg-white px-3 py-2 text-sm font-mono border border-gray-300 rounded">{{ getAccountId(account) }}</code>
                            <button
                              @click="copyToClipboard(getAccountId(account), 'Account ID')"
                              class="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                        </div>

                        <!-- API Key Section -->
                        <div class="border border-gray-200 rounded-lg p-4">
                          <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>

                          <!-- No API Key Yet -->
                          <div v-if="!instanceData[getAccountId(account)]?.apiKey" class="text-center py-6">
                            <p class="text-gray-500 mb-4">No API key generated yet</p>
                            <button
                              @click="generateApiKey(getAccountId(account))"
                              :disabled="instanceLoading"
                              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              Generate API Key
                            </button>
                          </div>

                          <!-- API Key Exists -->
                          <div v-else>
                            <div class="flex items-center space-x-2 mb-3">
                              <code class="flex-1 bg-gray-50 px-3 py-2 text-sm font-mono border border-gray-300 rounded">{{ instanceData[getAccountId(account)].apiKey }}</code>
                              <button
                                @click="copyToClipboard(instanceData[getAccountId(account)].apiKey, 'API Key')"
                                class="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                Copy
                              </button>
                            </div>

                            <!-- Regenerate with Confirmation -->
                            <div class="flex items-center space-x-2">
                              <button
                                v-if="!confirmRegenerate[getAccountId(account)]"
                                @click="confirmRegenerate[getAccountId(account)] = true"
                                class="text-sm text-red-600 hover:text-red-700 font-medium"
                              >
                                Regenerate API Key
                              </button>
                              <div v-else class="flex items-center space-x-2">
                                <span class="text-sm text-gray-700">This will invalidate the old key. Continue?</span>
                                <button
                                  @click="regenerateApiKey(getAccountId(account))"
                                  :disabled="instanceLoading"
                                  class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                  Yes, Regenerate
                                </button>
                                <button
                                  @click="confirmRegenerate[getAccountId(account)] = false"
                                  class="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Instance URL Section -->
                        <div class="border border-gray-200 rounded-lg p-4">
                          <label class="block text-sm font-medium text-gray-700 mb-2">Instance URL</label>
                          <div v-if="editingInstanceUrl === getAccountId(account)">
                            <input
                              v-model="instanceUrlEdit"
                              type="url"
                              placeholder="https://your-instance.com"
                              class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                              @keyup.enter="saveInstanceUrl(getAccountId(account))"
                              @keyup.esc="cancelInstanceUrlEdit"
                            />
                            <div class="flex space-x-2">
                              <button
                                @click="saveInstanceUrl(getAccountId(account))"
                                :disabled="instanceLoading"
                                class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                @click="cancelInstanceUrlEdit"
                                class="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                          <div v-else>
                            <div class="flex items-center space-x-2">
                              <p class="flex-1 text-sm text-gray-600">{{ instanceData[getAccountId(account)]?.instanceUrl || 'Not set' }}</p>
                              <button
                                @click="startEditInstanceUrl(getAccountId(account))"
                                class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                {{ instanceData[getAccountId(account)]?.instanceUrl ? 'Edit' : 'Set URL' }}
                              </button>
                            </div>
                          </div>
                        </div>

                        <!-- Last Accessed -->
                        <div v-if="instanceData[getAccountId(account)]?.lastAccessedAt" class="text-xs text-gray-500">
                          Last accessed: {{ formatDate(instanceData[getAccountId(account)].lastAccessedAt) }}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                </template>
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

// Tracker Instance Management State
const expandedInstance = ref<string | null>(null);
const instanceData = ref<Record<string, any>>({});
const instanceLoading = ref(false);
const confirmRegenerate = ref<Record<string, boolean>>({});
const editingInstanceUrl = ref<string | null>(null);
const instanceUrlEdit = ref('');

const loadAccounts = async (page: number = 1) => {
  loading.value = true;
  error.value = '';

  try {
    const response = await adminApiService.accounts.getAll(page, 50, statusFilter.value || undefined);
    accounts.value = response.data.data.accounts;
    pagination.value = response.data.data.pagination;
    currentPage.value = page;

    // Load instance data for all accounts to show deployment status
    for (const account of accounts.value) {
      const accountId = getAccountId(account);
      loadInstanceDataForStatus(accountId);
    }
  } catch (err: any) {
    console.error('Error loading accounts:', err);
    error.value = err.response?.data?.message || 'Failed to load accounts';
  } finally {
    loading.value = false;
  }
};

const loadInstanceDataForStatus = async (accountId: string) => {
  try {
    const response = await adminApiService.instances.get(accountId);
    const data = response.data.data;

    if (data.hasInstance) {
      instanceData.value[accountId] = {
        apiKey: data.apiKey,
        instanceUrl: data.instanceUrl,
        status: data.status,
        lastAccessedAt: data.lastAccessedAt
      };
    }
  } catch (err: any) {
    console.error('Error loading instance data for status:', err);
  }
};

const changePage = (page: number) => {
  void loadAccounts(page);
};

// Helper to get account ID (supports both old _id and new id format)
const getAccountId = (account: TikTokAccountWithUser): string => {
  return account.id || account._id || '';
};

// Get deployment status for an account
const getDeploymentStatus = (accountId: string) => {
  const instance = instanceData.value[accountId];

  if (!instance) {
    return {
      label: 'Not Configured',
      class: 'bg-gray-100 text-gray-800'
    };
  }

  const hasApiKey = !!instance.apiKey;
  const hasUrl = !!instance.instanceUrl;

  if (hasApiKey && hasUrl) {
    return {
      label: 'Fully Deployed',
      class: 'bg-green-100 text-green-800'
    };
  } else if (hasApiKey && !hasUrl) {
    return {
      label: 'URL Pending',
      class: 'bg-yellow-100 text-yellow-800'
    };
  } else {
    return {
      label: 'Incomplete',
      class: 'bg-orange-100 text-orange-800'
    };
  }
};

const handleDisconnect = async (accountId: string) => {
  if (!confirm('Are you sure you want to disconnect and delete this account? This will:\n\n• Delete the TrackerInstance and all instance data\n• Permanently delete the TikTok account\n\nThis action cannot be undone.')) {
    return;
  }

  try {
    const response = await adminApiService.accounts.disconnect(accountId);
    alert(response.data.message);
    await loadAccounts(currentPage.value);
  } catch (err: any) {
    console.error('Error disconnecting account:', err);
    alert(err.response?.data?.message || 'Failed to disconnect account');
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Tracker Instance Management Functions
const toggleInstancePanel = async (accountId: string) => {
  if (expandedInstance.value === accountId) {
    expandedInstance.value = null;
  } else {
    expandedInstance.value = accountId;
    // Load instance data when panel opens
    await loadInstanceData(accountId);
  }
};

const loadInstanceData = async (accountId: string) => {
  instanceLoading.value = true;
  try {
    const response = await adminApiService.instances.get(accountId);
    const data = response.data.data;

    if (data.hasInstance) {
      instanceData.value[accountId] = {
        apiKey: data.apiKey,
        instanceUrl: data.instanceUrl,
        status: data.status,
        lastAccessedAt: data.lastAccessedAt
      };
    } else {
      instanceData.value[accountId] = null;
    }
  } catch (err: any) {
    console.error('Error loading instance data:', err);
    instanceData.value[accountId] = null;
  } finally {
    instanceLoading.value = false;
  }
};

const generateApiKey = async (accountId: string) => {
  instanceLoading.value = true;
  try {
    const response = await adminApiService.instances.generateKey(accountId);
    instanceData.value[accountId] = response.data.data;
    alert('API key generated successfully!');
  } catch (err: any) {
    console.error('Error generating API key:', err);
    alert(err.response?.data?.message || 'Failed to generate API key');
  } finally {
    instanceLoading.value = false;
  }
};

const regenerateApiKey = async (accountId: string) => {
  instanceLoading.value = true;
  try {
    const response = await adminApiService.instances.regenerateKey(accountId);
    instanceData.value[accountId] = {
      ...instanceData.value[accountId],
      ...response.data.data
    };
    confirmRegenerate.value[accountId] = false;
    alert('API key regenerated successfully! The old key is now invalid.');
  } catch (err: any) {
    console.error('Error regenerating API key:', err);
    alert(err.response?.data?.message || 'Failed to regenerate API key');
  } finally {
    instanceLoading.value = false;
  }
};

const startEditInstanceUrl = (accountId: string) => {
  editingInstanceUrl.value = accountId;
  instanceUrlEdit.value = instanceData.value[accountId]?.instanceUrl || '';
};

const cancelInstanceUrlEdit = () => {
  editingInstanceUrl.value = null;
  instanceUrlEdit.value = '';
};

const saveInstanceUrl = async (accountId: string) => {
  instanceLoading.value = true;
  try {
    await adminApiService.instances.updateUrl(accountId, instanceUrlEdit.value);
    if (!instanceData.value[accountId]) {
      instanceData.value[accountId] = {};
    }
    instanceData.value[accountId].instanceUrl = instanceUrlEdit.value;
    cancelInstanceUrlEdit();
    alert('Instance URL updated successfully!');
  } catch (err: any) {
    console.error('Error updating instance URL:', err);
    alert(err.response?.data?.message || 'Failed to update instance URL');
  } finally {
    instanceLoading.value = false;
  }
};

const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  } catch (err) {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard');
  }
};

onMounted(() => {
  loadAccounts();
});
</script>
