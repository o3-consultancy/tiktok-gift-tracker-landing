import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { apiService } from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => !!user.value);
  const currentUser = computed(() => user.value);

  // Initialize auth state listener
  const initAuth = () => {
    return new Promise<void>((resolve) => {
      onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser;
        loading.value = false;
        resolve();
      });
    });
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      error.value = null;
      loading.value = true;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      user.value = userCredential.user;
      return userCredential;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      error.value = null;
      loading.value = true;

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
      return userCredential;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      error.value = null;
      loading.value = true;

      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      user.value = userCredential.user;
      return userCredential;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      error.value = null;
      await signOut(auth);
      user.value = null;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      error.value = null;
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  };

  // Update user profile
  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    try {
      error.value = null;
      loading.value = true;

      if (user.value) {
        await updateProfile(user.value, data);
        // Also update on backend
        await apiService.auth.updateProfile(data);
        // Refresh user
        user.value = auth.currentUser;
      }
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Clear error
  const clearError = () => {
    error.value = null;
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    currentUser,
    initAuth,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    clearError
  };
});
