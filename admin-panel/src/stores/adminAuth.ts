import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { adminApiService } from '../services/adminApi';

export const useAdminAuthStore = defineStore('adminAuth', () => {
  // State
  const user = ref<User | null>(null);
  const isAdmin = ref(false);
  const loading = ref(true);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => !!user.value && isAdmin.value);
  const currentUser = computed(() => user.value);

  /**
   * Initialize auth state listener
   */
  const initAuth = () => {
    return new Promise<void>((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        user.value = firebaseUser;

        if (firebaseUser) {
          // Check if user is admin
          await checkAdminStatus();
        } else {
          isAdmin.value = false;
        }

        loading.value = false;
        resolve();
      });
    });
  };

  /**
   * Check if current user has admin privileges
   */
  const checkAdminStatus = async () => {
    if (!user.value) {
      isAdmin.value = false;
      return false;
    }

    try {
      // Try to fetch admin dashboard - if successful, user is admin
      const response = await adminApiService.dashboard.getStats();

      if (response.data.success) {
        isAdmin.value = true;
        return true;
      }

      isAdmin.value = false;
      return false;
    } catch (err: any) {
      isAdmin.value = false;

      if (err.response?.status === 403) {
        error.value = 'Access denied: Admin privileges required';
      }

      return false;
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      error.value = null;
      loading.value = true;

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;

      // Check admin status
      const adminStatus = await checkAdminStatus();

      if (!adminStatus) {
        // User is not admin, sign them out
        await signOut(auth);
        user.value = null;
        throw new Error('You do not have administrative privileges');
      }

      return userCredential;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Sign out
   */
  const logout = async () => {
    try {
      error.value = null;
      await signOut(auth);
      user.value = null;
      isAdmin.value = false;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  };

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null;
  };

  return {
    user,
    isAdmin,
    loading,
    error,
    isAuthenticated,
    currentUser,
    initAuth,
    checkAdminStatus,
    signIn,
    logout,
    clearError
  };
});
