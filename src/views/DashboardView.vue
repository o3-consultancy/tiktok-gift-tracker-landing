<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <img class="h-8 w-auto" src="@/assets/o3-tt-gifts-logo.svg" alt="O3 TT Gifts" />
            <span class="ml-2 text-xl font-bold text-gray-900">Dashboard</span>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/app/settings" class="text-sm text-gray-700 hover:text-gray-900">
              Settings
            </router-link>
            <span class="text-sm text-gray-700">{{ authStore.user?.email }}</span>
            <button @click="handleLogout" class="btn-outline text-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Loading State -->
    <div v-if="loadingSubscription" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-sm p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Subscription Status Alert -->
      <div v-if="subscriptionStore.needsPaymentUpdate" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div class="flex items-start">
          <svg class="h-6 w-6 text-red-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-red-800">Payment Required</h3>
            <p class="mt-1 text-red-700">Your payment has failed. Please update your payment method to continue using the service.</p>
            <button @click="handleUpdatePayment" class="mt-3 btn-primary">
              Update Payment Method
            </button>
          </div>
        </div>
      </div>

      <!-- Welcome Message -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">
              Welcome back!
            </h1>
            <p class="text-gray-600">
              Manage your TikTok accounts and analytics
            </p>
          </div>
          <div v-if="subscriptionStore.subscription" class="text-right">
            <p class="text-sm text-gray-600">Current Plan</p>
            <p class="text-xl font-bold text-primary-600">
              {{ subscriptionStore.subscription.plan }}
            </p>
            <router-link to="/app/settings" class="text-sm text-primary-600 hover:text-primary-700">
              Manage Subscription
            </router-link>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Subscription Status</p>
              <p :class="[
                'text-2xl font-bold',
                subscriptionStore.hasActiveSubscription ? 'text-green-600' : 'text-red-600'
              ]">
                {{ statusLabel }}
              </p>
            </div>
            <div :class="[
              'h-12 w-12 rounded-full flex items-center justify-center',
              subscriptionStore.hasActiveSubscription ? 'bg-green-100' : 'bg-red-100'
            ]">
              <svg class="h-6 w-6" :class="subscriptionStore.hasActiveSubscription ? 'text-green-600' : 'text-red-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="subscriptionStore.hasActiveSubscription" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">TikTok Accounts</p>
              <p class="text-2xl font-bold text-gray-900">{{ accounts.length }} / {{ accountLimit }}</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Active Accounts</p>
              <p class="text-2xl font-bold text-gray-900">{{ activeAccountsCount }}</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- TikTok Accounts Table -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">TikTok Accounts</h2>
          <button
            @click="showAddAccountModal = true"
            :disabled="accounts.length >= accountLimit"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="h-5 w-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Account
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="accounts.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No accounts</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by adding your first TikTok account.</p>
        </div>

        <!-- Accounts Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TikTok ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Access URL
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="account in accounts" :key="account._id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ account.accountId || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ account.accountName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(account.status)">
                    {{ getStatusLabel(account.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <a v-if="account.metadata?.accessUrl" :href="account.metadata.accessUrl" target="_blank" class="text-primary-600 hover:text-primary-700">
                    Open
                  </a>
                  <span v-else class="text-gray-400">Not deployed</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button @click="deleteAccount(account._id)" class="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Account Limit Info -->
        <div v-if="accounts.length > 0" class="mt-4 text-sm text-gray-600">
          <p>You're using {{ accounts.length }} of {{ accountLimit }} available accounts.</p>
          <router-link v-if="accounts.length >= accountLimit" to="/app/settings" class="text-primary-600 hover:text-primary-700">
            Upgrade your plan to add more accounts
          </router-link>
        </div>
      </div>
    </div>

    <!-- Add Account Modal -->
    <div v-if="showAddAccountModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Add TikTok Account</h3>

        <div v-if="addAccountError" class="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {{ addAccountError }}
        </div>

        <form @submit.prevent="handleAddAccount">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              TikTok Account ID
            </label>
            <input
              v-model="newAccount.accountId"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="@username or ID"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Account Name (Optional)
            </label>
            <input
              v-model="newAccount.accountName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Friendly name for this account"
            />
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showAddAccountModal = false"
              class="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="addingAccount"
              class="btn-primary disabled:opacity-50"
            >
              {{ addingAccount ? 'Adding...' : 'Add Account' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSubscriptionStore } from '@/stores/subscription';
import { apiService } from '@/services/api';

const router = useRouter();
const authStore = useAuthStore();
const subscriptionStore = useSubscriptionStore();

const loadingSubscription = ref(true);
const accounts = ref<any[]>([]);
const showAddAccountModal = ref(false);
const addingAccount = ref(false);
const addAccountError = ref('');
const newAccount = ref({
  accountId: '',
  accountName: ''
});

const accountLimit = computed(() => {
  return subscriptionStore.subscription?.planDetails?.accounts || 1;
});

const activeAccountsCount = computed(() => {
  return accounts.value.filter(acc => acc.status === 'active').length;
});

const statusLabel = computed(() => {
  const status = subscriptionStore.subscriptionStatus;
  if (status === 'active') return 'Active';
  if (status === 'trialing') return 'Trial';
  if (status === 'past_due') return 'Past Due';
  if (status === 'canceled') return 'Canceled';
  return 'Inactive';
});

onMounted(async () => {
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  try {
    // Fetch subscription
    await subscriptionStore.fetchSubscription();

    // Check if user can access dashboard
    if (!subscriptionStore.canAccessDashboard) {
      // Redirect to checkout if no active subscription
      router.push('/checkout');
      return;
    }

    // Fetch accounts
    await fetchAccounts();
  } catch (error) {
    console.error('Error loading dashboard:', error);
  } finally {
    loadingSubscription.value = false;
  }
});

const fetchAccounts = async () => {
  try {
    const response = await apiService.accounts.getAll();
    accounts.value = response.data.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
};

const handleAddAccount = async () => {
  try {
    addingAccount.value = true;
    addAccountError.value = '';

    const accountName = newAccount.value.accountName || newAccount.value.accountId;

    await apiService.accounts.create({
      accountId: newAccount.value.accountId,
      accountName: accountName,
      accountHandle: newAccount.value.accountId
    });

    // Refresh accounts list
    await fetchAccounts();

    // Reset form and close modal
    newAccount.value = { accountId: '', accountName: '' };
    showAddAccountModal.value = false;
  } catch (error: any) {
    addAccountError.value = error.response?.data?.message || 'Failed to add account';
  } finally {
    addingAccount.value = false;
  }
};

const deleteAccount = async (accountId: string) => {
  if (!confirm('Are you sure you want to delete this account?')) {
    return;
  }

  try {
    await apiService.accounts.delete(accountId);
    await fetchAccounts();
  } catch (error) {
    console.error('Error deleting account:', error);
    alert('Failed to delete account');
  }
};

const getStatusBadgeClass = (status: string) => {
  const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';

  if (status === 'active') {
    return `${baseClasses} bg-green-100 text-green-800`;
  } else if (status === 'inactive') {
    return `${baseClasses} bg-gray-100 text-gray-800`;
  } else {
    return `${baseClasses} bg-yellow-100 text-yellow-800`;
  }
};

const getStatusLabel = (status: string) => {
  if (status === 'active') return 'Active';
  if (status === 'inactive') return 'Inactive';
  return 'Awaiting Deployment';
};

const handleUpdatePayment = () => {
  // TODO: Implement payment update flow
  alert('Payment update feature coming soon!');
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};
</script>
