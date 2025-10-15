<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/app/dashboard" class="flex items-center">
              <svg class="h-5 w-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span class="text-sm text-gray-600">Back to Dashboard</span>
            </router-link>
          </div>
          <div class="flex items-center">
            <button @click="handleLogout" class="btn-outline text-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <!-- Subscription Management Section -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Current Subscription</h2>

        <div v-if="subscriptionStore.subscription" class="space-y-6">
          <!-- Current Plan Info -->
          <div class="border-b border-gray-200 pb-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ subscriptionStore.subscription.plan }} Plan
                </h3>
                <p class="text-gray-600 mt-1">
                  ${{ subscriptionStore.subscription.planDetails.monthlyPrice.toFixed(2) }}/month
                </p>
                <div class="mt-2 space-y-1">
                  <p class="text-sm text-gray-600">
                    <strong>Accounts:</strong> {{ subscriptionStore.subscription.planDetails.accounts }}
                  </p>
                  <p class="text-sm text-gray-600">
                    <strong>Gift Groups:</strong> {{ subscriptionStore.subscription.planDetails.giftGroups }}
                  </p>
                  <p class="text-sm text-gray-600">
                    <strong>Status:</strong>
                    <span :class="subscriptionStore.hasActiveSubscription ? 'text-green-600' : 'text-red-600'">
                      {{ subscriptionStore.subscriptionStatus }}
                    </span>
                  </p>
                </div>
              </div>

              <div class="text-right">
                <p class="text-sm text-gray-600">Next billing date</p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ formatDate(subscriptionStore.subscription.currentPeriodEnd) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Upgrade Options -->
          <div v-if="availableUpgrades.length > 0">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Upgrade Your Plan</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="upgrade in availableUpgrades"
                :key="upgrade.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors"
              >
                <h4 class="font-semibold text-gray-900">{{ upgrade.name }} Plan</h4>
                <p class="text-2xl font-bold text-primary-600 mt-2">
                  ${{ (upgrade.monthlyPrice / 100).toFixed(2) }}/month
                </p>
                <ul class="mt-3 space-y-1">
                  <li class="text-sm text-gray-600">
                    {{ upgrade.accounts }} TikTok Accounts
                  </li>
                  <li class="text-sm text-gray-600">
                    {{ upgrade.giftGroups }} Gift Groups
                  </li>
                </ul>
                <button
                  @click="confirmUpgrade(upgrade)"
                  :disabled="upgradingPlan"
                  class="mt-4 w-full btn-primary text-sm disabled:opacity-50"
                >
                  {{ upgradingPlan ? 'Processing...' : 'Upgrade Now' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Cancel Subscription -->
          <div class="border-t border-gray-200 pt-4">
            <div v-if="subscriptionStore.subscription.cancelAtPeriodEnd" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-yellow-800">
                Your subscription is scheduled to cancel on {{ formatDate(subscriptionStore.subscription.currentPeriodEnd) }}
              </p>
              <button
                @click="handleReactivate"
                :disabled="processing"
                class="mt-3 btn-primary disabled:opacity-50"
              >
                {{ processing ? 'Processing...' : 'Reactivate Subscription' }}
              </button>
            </div>
            <div v-else>
              <button
                @click="confirmCancel"
                :disabled="processing"
                class="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
              >
                {{ processing ? 'Processing...' : 'Cancel Subscription' }}
              </button>
              <p class="text-xs text-gray-500 mt-1">
                Your subscription will remain active until the end of your billing period
              </p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <p class="text-gray-600">No active subscription found</p>
          <router-link to="/" class="mt-4 inline-block btn-primary">
            View Plans
          </router-link>
        </div>
      </div>

      <!-- Account Information -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <p class="mt-1 text-gray-900">{{ authStore.user?.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Display Name</label>
            <p class="mt-1 text-gray-900">{{ authStore.user?.displayName || 'Not set' }}</p>
          </div>
        </div>
      </div>

      <!-- Billing History -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Billing History</h2>
        <button @click="fetchInvoices" :disabled="loadingInvoices" class="btn-outline text-sm mb-4">
          {{ loadingInvoices ? 'Loading...' : 'Load Invoices' }}
        </button>

        <div v-if="invoices.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="invoice in invoices" :key="invoice.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(invoice.created) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${{ (invoice.amount / 100).toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getInvoiceStatusClass(invoice.status)">
                    {{ invoice.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <a v-if="invoice.invoicePdf" :href="invoice.invoicePdf" target="_blank" class="text-primary-600 hover:text-primary-700">
                    Download PDF
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else-if="!loadingInvoices" class="text-gray-600 text-sm">No invoices found</p>
      </div>
    </div>

    <!-- Upgrade Confirmation Dialog -->
    <ConfirmDialog
      :show="showUpgradeDialog"
      title="Upgrade Plan"
      :message="dialogMessage"
      confirm-text="Upgrade Now"
      cancel-text="Cancel"
      variant="info"
      @confirm="handleUpgradeConfirm"
      @cancel="showUpgradeDialog = false"
    />

    <!-- Cancel Confirmation Dialog -->
    <ConfirmDialog
      :show="showCancelDialog"
      title="Cancel Subscription"
      message="Are you sure you want to cancel your subscription? It will remain active until the end of your billing period."
      confirm-text="Yes, Cancel"
      cancel-text="Keep Subscription"
      variant="danger"
      @confirm="handleCancelConfirm"
      @cancel="showCancelDialog = false"
    />

    <!-- Success Dialog -->
    <ConfirmDialog
      v-if="showSuccessDialog"
      :show="showSuccessDialog"
      title="Success"
      :message="successMessage"
      confirm-text="OK"
      :cancel-text="''"
      variant="info"
      @confirm="showSuccessDialog = false"
      @cancel="showSuccessDialog = false"
    />

    <!-- Error Dialog -->
    <ConfirmDialog
      v-if="showErrorDialog"
      :show="showErrorDialog"
      title="Error"
      :message="errorMessage"
      confirm-text="OK"
      :cancel-text="''"
      variant="danger"
      @confirm="showErrorDialog = false"
      @cancel="showErrorDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSubscriptionStore } from '@/stores/subscription';
import { apiService } from '@/services/api';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const router = useRouter();
const authStore = useAuthStore();
const subscriptionStore = useSubscriptionStore();

const processing = ref(false);
const upgradingPlan = ref(false);
const loadingInvoices = ref(false);
const invoices = ref<any[]>([]);

// Dialog state
const showUpgradeDialog = ref(false);
const showCancelDialog = ref(false);
const selectedUpgradePlan = ref<any>(null);
const dialogMessage = ref('');
const showSuccessDialog = ref(false);
const successMessage = ref('');
const showErrorDialog = ref(false);
const errorMessage = ref('');

const PLANS = {
  STARTER: { id: 'STARTER', name: 'Starter', monthlyPrice: 3000, accounts: 1, giftGroups: 5 },
  PROFESSIONAL: { id: 'PROFESSIONAL', name: 'Professional', monthlyPrice: 8000, accounts: 3, giftGroups: 15 },
  ENTERPRISE: { id: 'ENTERPRISE', name: 'Enterprise', monthlyPrice: 23000, accounts: 20, giftGroups: 50 }
};

const availableUpgrades = computed(() => {
  if (!subscriptionStore.subscription) return [];

  const currentPlan = subscriptionStore.subscription.plan;
  const upgrades = [];

  if (currentPlan === 'STARTER') {
    upgrades.push(PLANS.PROFESSIONAL, PLANS.ENTERPRISE);
  } else if (currentPlan === 'PROFESSIONAL') {
    upgrades.push(PLANS.ENTERPRISE);
  }

  return upgrades;
});

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  await subscriptionStore.fetchSubscription();
});

const confirmUpgrade = (upgrade: any) => {
  selectedUpgradePlan.value = upgrade;
  dialogMessage.value = `Are you sure you want to upgrade to the ${upgrade.name} plan? You will be charged $${(upgrade.monthlyPrice / 100).toFixed(2)}/month. The prorated difference will be charged immediately.`;
  showUpgradeDialog.value = true;
};

const handleUpgradeConfirm = async () => {
  if (!selectedUpgradePlan.value) return;

  try {
    upgradingPlan.value = true;
    showUpgradeDialog.value = false;

    await subscriptionStore.upgradePlan(selectedUpgradePlan.value.id);

    successMessage.value = `Successfully upgraded to ${selectedUpgradePlan.value.name} plan!`;
    showSuccessDialog.value = true;
    selectedUpgradePlan.value = null;
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to upgrade plan. Please try again.';
    showErrorDialog.value = true;
  } finally {
    upgradingPlan.value = false;
  }
};

const confirmCancel = () => {
  showCancelDialog.value = true;
};

const handleCancelConfirm = async () => {
  try {
    processing.value = true;
    showCancelDialog.value = false;

    await subscriptionStore.cancelSubscription();

    successMessage.value = 'Your subscription has been cancelled and will remain active until the end of your billing period.';
    showSuccessDialog.value = true;
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to cancel subscription. Please try again.';
    showErrorDialog.value = true;
  } finally {
    processing.value = false;
  }
};

const handleReactivate = async () => {
  try {
    processing.value = true;
    await subscriptionStore.reactivateSubscription();

    successMessage.value = 'Your subscription has been reactivated successfully!';
    showSuccessDialog.value = true;
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to reactivate subscription. Please try again.';
    showErrorDialog.value = true;
  } finally {
    processing.value = false;
  }
};

const fetchInvoices = async () => {
  try {
    loadingInvoices.value = true;
    const response = await apiService.payments.getInvoices();
    invoices.value = response.data.data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    errorMessage.value = 'Failed to load invoices. Please try again.';
    showErrorDialog.value = true;
  } finally {
    loadingInvoices.value = false;
  }
};

const formatDate = (date: string | Date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getInvoiceStatusClass = (status: string) => {
  const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
  if (status === 'paid') {
    return `${baseClasses} bg-green-100 text-green-800`;
  } else if (status === 'open') {
    return `${baseClasses} bg-yellow-100 text-yellow-800`;
  } else {
    return `${baseClasses} bg-red-100 text-red-800`;
  }
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};
</script>
