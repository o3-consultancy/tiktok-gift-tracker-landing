import axios, { AxiosInstance, AxiosError } from 'axios';
import { auth } from '@/config/firebase';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add Firebase token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorMessage = (error.response?.data as any)?.message || error.message;
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

// API Services
export const apiService = {
  // Auth endpoints
  auth: {
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data: { displayName?: string; photoURL?: string }) =>
      api.put('/auth/profile', data),
    deleteAccount: () => api.delete('/auth/account')
  },

  // Payment endpoints
  payments: {
    createCheckoutSession: (data: { plan: string; accountCount?: number; couponCode?: string }) =>
      api.post('/payments/create-checkout-session', data),
    getHistory: () => api.get('/payments/history'),
    getInvoices: () => api.get('/payments/invoices')
  },

  // Coupon endpoints
  coupons: {
    validate: (code: string) =>
      api.post('/coupons/validate', { code })
  },

  // Subscription endpoints
  subscriptions: {
    getCurrent: () => api.get('/subscriptions/current'),
    cancel: () => api.post('/subscriptions/cancel'),
    reactivate: () => api.post('/subscriptions/reactivate'),
    changePlan: (newPlan: string) => api.post('/subscriptions/change-plan', { newPlan }),
    getPlans: () => api.get('/subscriptions/plans'),
    getUsage: () => api.get('/subscriptions/usage')
  },

  // TikTok account endpoints
  accounts: {
    getAll: () => api.get('/accounts'),
    getOne: (id: string) => api.get(`/accounts/${id}`),
    create: (data: {
      accountName: string;
      accountHandle?: string;
      accountId?: string;
    }) => api.post('/accounts', data),
    update: (
      id: string,
      data: {
        accountName?: string;
        accountHandle?: string;
        accountId?: string;
        status?: string;
      }
    ) => api.put(`/accounts/${id}`, data),
    delete: (id: string) => api.delete(`/accounts/${id}`),
    sync: (id: string) => api.post(`/accounts/${id}/sync`),
    getInstanceCredentials: (id: string) => api.get(`/accounts/${id}/instance-credentials`),
    requestDisconnection: (id: string) => api.post(`/accounts/${id}/request-disconnection`)
  }
};

export default api;
