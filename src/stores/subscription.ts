import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiService } from '@/services/api';

export const useSubscriptionStore = defineStore('subscription', () => {
  // State
  const subscription = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const hasActiveSubscription = computed(() => {
    return subscription.value?.status === 'active' || subscription.value?.status === 'trialing';
  });

  const hasPastDueSubscription = computed(() => {
    return subscription.value?.status === 'past_due';
  });

  const subscriptionStatus = computed(() => subscription.value?.status || 'none');

  const canAccessDashboard = computed(() => {
    // Allow access if subscription is active or trialing
    return hasActiveSubscription.value;
  });

  const needsPaymentUpdate = computed(() => {
    // Needs payment update if past_due, unpaid, or incomplete
    return ['past_due', 'unpaid', 'incomplete'].includes(subscription.value?.status);
  });

  // Actions
  const fetchSubscription = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiService.subscriptions.getCurrent();
      subscription.value = response.data.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No subscription found
        subscription.value = null;
      } else {
        error.value = err.response?.data?.message || 'Failed to fetch subscription';
        throw err;
      }
    } finally {
      loading.value = false;
    }
  };

  const upgradePlan = async (newPlan: string) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiService.subscriptions.changePlan(newPlan);
      await fetchSubscription(); // Refresh subscription data
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to upgrade plan';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const cancelSubscription = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiService.subscriptions.cancel();
      await fetchSubscription(); // Refresh subscription data
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to cancel subscription';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const reactivateSubscription = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiService.subscriptions.reactivate();
      await fetchSubscription(); // Refresh subscription data
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to reactivate subscription';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    subscription,
    loading,
    error,
    hasActiveSubscription,
    hasPastDueSubscription,
    subscriptionStatus,
    canAccessDashboard,
    needsPaymentUpdate,
    fetchSubscription,
    upgradePlan,
    cancelSubscription,
    reactivateSubscription,
    clearError
  };
});
