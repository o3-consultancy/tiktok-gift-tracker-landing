import axios, { type AxiosInstance } from 'axios';
import { auth } from '../config/firebase';

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
  (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

/**
 * Admin API Service
 * All endpoints require admin authentication
 */

export interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalAccounts: number;
  totalRevenue: number;
  recentUsers: Array<{
    _id: string;
    email: string;
    displayName?: string;
    createdAt: string;
  }>;
}

export interface UserWithSubscription {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  subscription?: {
    plan: string;
    status: string;
    currentPeriodEnd: string;
  } | null;
}

export interface TikTokAccountWithUser {
  _id: string;
  userId: {
    _id: string;
    email: string;
    displayName?: string;
  };
  accountId: string;
  accountName: string;
  accountHandle?: string;
  status: 'pending' | 'active' | 'inactive';
  accessUrl?: string;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UserDetail {
  user: UserWithSubscription;
  subscription: any;
  accounts: any[];
  payments: any[];
}

export interface AnalyticsData {
  newUsersLast30Days: number;
  revenueLast30Days: number;
  subscriptionBreakdown: Array<{
    _id: string;
    count: number;
  }>;
}

export const adminApiService = {
  /**
   * Dashboard endpoints
   */
  dashboard: {
    getStats: () =>
      api.get<{ success: boolean; data: DashboardStats }>('/admin/dashboard')
  },

  /**
   * User management endpoints
   */
  users: {
    getAll: (page: number = 1, limit: number = 20) =>
      api.get<{
        success: boolean;
        data: {
          users: UserWithSubscription[];
          pagination: PaginationMeta;
        };
      }>(`/admin/users?page=${page}&limit=${limit}`),

    getOne: (userId: string) =>
      api.get<{
        success: boolean;
        data: UserDetail;
      }>(`/admin/users/${userId}`),

    makeAdmin: (userId: string) =>
      api.post<{
        success: boolean;
        message: string;
      }>(`/admin/users/${userId}/make-admin`)
  },

  /**
   * TikTok account management endpoints
   */
  accounts: {
    getAll: (page: number = 1, limit: number = 50, status?: string) => {
      const statusParam = status ? `&status=${status}` : '';
      return api.get<{
        success: boolean;
        data: {
          accounts: TikTokAccountWithUser[];
          pagination: PaginationMeta;
        };
      }>(`/admin/accounts?page=${page}&limit=${limit}${statusParam}`);
    },

    update: (accountId: string, data: { status?: string; accessUrl?: string }) =>
      api.patch<{
        success: boolean;
        data: TikTokAccountWithUser;
        message: string;
      }>(`/admin/accounts/${accountId}`, data)
  },

  /**
   * Analytics endpoints
   */
  analytics: {
    getData: () =>
      api.get<{
        success: boolean;
        data: AnalyticsData;
      }>('/admin/analytics')
  },

  /**
   * Coupon management endpoints
   */
  coupons: {
    getAll: () =>
      api.get<{
        success: boolean;
        data: {
          coupons: any[];
        };
      }>('/coupons'),

    getOne: (couponId: string) =>
      api.get<{
        success: boolean;
        data: any;
      }>(`/coupons/${couponId}`),

    create: (data: {
      code: string;
      description?: string;
      usageLimit: number;
      expiresAt?: string;
      isActive: boolean;
    }) =>
      api.post<{
        success: boolean;
        data: any;
        message: string;
      }>('/coupons', data),

    update: (couponId: string, data: {
      description?: string;
      usageLimit?: number;
      expiresAt?: string;
      isActive?: boolean;
    }) =>
      api.patch<{
        success: boolean;
        data: any;
        message: string;
      }>(`/coupons/${couponId}`, data),

    delete: (couponId: string) =>
      api.delete<{
        success: boolean;
        message: string;
      }>(`/coupons/${couponId}`),

    getStats: () =>
      api.get<{
        success: boolean;
        data: {
          totalCoupons: number;
          activeCoupons: number;
          totalRedemptions: number;
          totalFeesWaived: number;
        };
      }>('/coupons/stats/summary')
  }
};

export default api;
