<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
    <div class="max-w-md w-full">
      <!-- Logo and title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-4">
          <span class="text-white font-bold text-2xl">O3</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
        <p class="text-gray-600">O3 TT Gifts Admin Panel</p>
      </div>

      <!-- Login card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Error message -->
        <div
          v-if="errorMessage"
          class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
        >
          <svg class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div>
            <h3 class="text-sm font-semibold text-red-800">Access Denied</h3>
            <p class="text-sm text-red-700 mt-1">{{ errorMessage }}</p>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="admin@o3-ttgifts.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <!-- Login button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign in to Admin Panel</span>
          </button>
        </form>

        <!-- Info notice -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-sm text-blue-800 font-medium">Admin Access Only</p>
              <p class="text-sm text-blue-700 mt-1">
                This area is restricted to authorized administrators. Regular user accounts will not have access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminAuthStore } from '../stores/adminAuth';

const router = useRouter();
const authStore = useAdminAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    await authStore.signIn(email.value, password.value);
    router.push('/');
  } catch (error: any) {
    console.error('Login error:', error);

    // Parse Firebase auth errors
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      errorMessage.value = 'Invalid email or password. Please try again.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage.value = 'No account found with this email address.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage.value = 'Too many failed attempts. Please try again later.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage.value = 'Network error. Please check your connection.';
    } else {
      errorMessage.value = error.message || 'Login failed. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>
