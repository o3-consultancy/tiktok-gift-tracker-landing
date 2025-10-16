<template>
  <div class="px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header with Create Button -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Coupon Management</h1>
        <p class="mt-2 text-sm text-gray-700">
          Create and manage coupon codes that waive the deployment fee
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Coupon
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Coupons</dt>
                <dd class="text-lg font-semibold text-gray-900">{{ stats.totalCoupons }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Active Coupons</dt>
                <dd class="text-lg font-semibold text-gray-900">{{ stats.activeCoupons }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Redemptions</dt>
                <dd class="text-lg font-semibold text-gray-900">{{ stats.totalRedemptions }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Fees Waived</dt>
                <dd class="text-lg font-semibold text-gray-900">${{ stats.totalFeesWaived.toLocaleString() }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="mt-8 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="mt-8 bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
        </div>
      </div>
    </div>

    <!-- Coupons Table -->
    <div v-else-if="!loading" class="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usage
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expires
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="coupon in coupons" :key="coupon._id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm font-medium text-gray-900 font-mono">
                  {{ coupon.code }}
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ coupon.description || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-if="coupon.isActive && !isExpired(coupon)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Active
              </span>
              <span v-else-if="isExpired(coupon)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                Expired
              </span>
              <span v-else class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                Inactive
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">
                {{ coupon.usageCount }} / {{ coupon.usageLimit }}
                <div class="w-32 bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    class="bg-blue-600 h-2 rounded-full"
                    :style="{ width: `${Math.min((coupon.usageCount / coupon.usageLimit) * 100, 100)}%` }"
                  ></div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Never' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="viewCoupon(coupon)"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                View
              </button>
              <button
                @click="editCoupon(coupon)"
                class="text-yellow-600 hover:text-yellow-900 mr-4"
              >
                Edit
              </button>
              <button
                v-if="coupon.usageCount === 0"
                @click="deleteCoupon(coupon)"
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
          <tr v-if="coupons.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
              No coupons found. Create your first coupon to get started.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Coupon Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModals"></div>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div class="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ showCreateModal ? 'Create New Coupon' : 'Edit Coupon' }}
              </h3>
              <div class="mt-4 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Coupon Code</label>
                  <input
                    v-model="formData.code"
                    type="text"
                    :disabled="showEditModal"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono uppercase"
                    placeholder="WELCOME2024"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    v-model="formData.description"
                    rows="2"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Optional description"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Usage Limit</label>
                  <input
                    v-model.number="formData.usageLimit"
                    type="number"
                    min="1"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Expiration Date (Optional)</label>
                  <input
                    v-model="formData.expiresAt"
                    type="date"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div class="flex items-center">
                  <input
                    v-model="formData.isActive"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              @click="saveCoupon"
              :disabled="saving"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : (showCreateModal ? 'Create' : 'Save') }}
            </button>
            <button
              @click="closeModals"
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Coupon Details Modal -->
    <div v-if="showViewModal && selectedCoupon" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showViewModal = false"></div>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Coupon Details - {{ selectedCoupon.code }}
            </h3>

            <div class="space-y-3 mb-6">
              <div>
                <span class="text-sm font-medium text-gray-500">Description:</span>
                <span class="ml-2 text-sm text-gray-900">{{ selectedCoupon.description || 'N/A' }}</span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Status:</span>
                <span class="ml-2">
                  <span v-if="selectedCoupon.isActive && !isExpired(selectedCoupon)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                  <span v-else-if="isExpired(selectedCoupon)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Expired
                  </span>
                  <span v-else class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                </span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Usage:</span>
                <span class="ml-2 text-sm text-gray-900">{{ selectedCoupon.usageCount }} / {{ selectedCoupon.usageLimit }}</span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Created:</span>
                <span class="ml-2 text-sm text-gray-900">{{ formatDate(selectedCoupon.createdAt) }}</span>
              </div>
            </div>

            <h4 class="text-md font-medium text-gray-900 mb-2">Usage History</h4>
            <div v-if="selectedCoupon.usageHistory && selectedCoupon.usageHistory.length > 0" class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">User</th>
                    <th class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Used At</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="(usage, idx) in selectedCoupon.usageHistory" :key="idx">
                    <td class="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-gray-900">
                      {{ usage.userId?.email || usage.userId }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                      {{ formatDate(usage.usedAt) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
              No usage history yet
            </div>
          </div>
          <div class="mt-5 sm:mt-4">
            <button
              @click="showViewModal = false"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApiService } from '../services/adminApi';

interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'waive_deployment_fee';
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  usageHistory?: Array<{
    userId: any;
    usedAt: string;
  }>;
}

interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalRedemptions: number;
  totalFeesWaived: number;
}

const coupons = ref<Coupon[]>([]);
const stats = ref<CouponStats>({
  totalCoupons: 0,
  activeCoupons: 0,
  totalRedemptions: 0,
  totalFeesWaived: 0
});
const loading = ref(true);
const error = ref<string | null>(null);

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showViewModal = ref(false);
const selectedCoupon = ref<Coupon | null>(null);
const saving = ref(false);

const formData = ref({
  code: '',
  description: '',
  usageLimit: 10,
  expiresAt: '',
  isActive: true
});

const fetchCoupons = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await adminApiService.coupons.getAll();
    coupons.value = response.data.data.coupons;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load coupons';
    console.error('Error fetching coupons:', err);
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const response = await adminApiService.coupons.getStats();
    stats.value = response.data.data;
  } catch (err: any) {
    console.error('Error fetching coupon stats:', err);
  }
};

const saveCoupon = async () => {
  try {
    saving.value = true;
    error.value = null;

    const data = {
      ...formData.value,
      code: formData.value.code.trim().toUpperCase(),
      expiresAt: formData.value.expiresAt || undefined
    };

    if (showCreateModal.value) {
      await adminApiService.coupons.create(data);
    } else if (showEditModal.value && selectedCoupon.value) {
      await adminApiService.coupons.update(selectedCoupon.value._id, data);
    }

    closeModals();
    await fetchCoupons();
    await fetchStats();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save coupon';
    console.error('Error saving coupon:', err);
  } finally {
    saving.value = false;
  }
};

const viewCoupon = async (coupon: Coupon) => {
  try {
    const response = await adminApiService.coupons.getOne(coupon._id);
    selectedCoupon.value = response.data.data;
    showViewModal.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load coupon details';
    console.error('Error fetching coupon details:', err);
  }
};

const editCoupon = (coupon: Coupon) => {
  selectedCoupon.value = coupon;
  formData.value = {
    code: coupon.code,
    description: coupon.description || '',
    usageLimit: coupon.usageLimit,
    expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
    isActive: coupon.isActive
  };
  showEditModal.value = true;
};

const deleteCoupon = async (coupon: Coupon) => {
  if (!confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
    return;
  }

  try {
    error.value = null;
    await adminApiService.coupons.delete(coupon._id);
    await fetchCoupons();
    await fetchStats();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to delete coupon';
    console.error('Error deleting coupon:', err);
  }
};

const closeModals = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  selectedCoupon.value = null;
  formData.value = {
    code: '',
    description: '',
    usageLimit: 10,
    expiresAt: '',
    isActive: true
  };
};

const isExpired = (coupon: Coupon): boolean => {
  if (!coupon.expiresAt) return false;
  return new Date(coupon.expiresAt) < new Date();
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  fetchCoupons();
  fetchStats();
});
</script>
