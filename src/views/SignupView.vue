<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <router-link to="/">
          <img class="mx-auto h-16 w-auto" src="@/assets/o3-tt-gifts-logo.svg" alt="O3 TT Gifts" />
        </router-link>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Already have an account?
          <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </router-link>
        </p>
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {{ errorMessage }}
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Full name</label>
            <input
              id="name"
              v-model="displayName"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              minlength="8"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="••••••••"
            />
            <p class="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirm password</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div class="flex items-center">
          <input
            id="terms"
            v-model="acceptedTerms"
            type="checkbox"
            required
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label for="terms" class="ml-2 block text-sm text-gray-900">
            I agree to the
            <router-link to="/terms-of-service" target="_blank" class="text-primary-600 hover:text-primary-500">
              Terms of Service
            </router-link>
            and
            <router-link to="/privacy-policy" target="_blank" class="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </router-link>
          </label>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </div>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            @click="handleGoogleSignUp"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const displayName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const acceptedTerms = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const handleSubmit = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';

    // Validate passwords match
    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Passwords do not match';
      return;
    }

    // Validate terms acceptance
    if (!acceptedTerms.value) {
      errorMessage.value = 'You must accept the terms and conditions';
      return;
    }

    await authStore.signUp(email.value, password.value, displayName.value);

    // Redirect to checkout or dashboard, preserving plan query param
    const redirect = router.currentRoute.value.query.redirect as string || '/checkout';
    const plan = router.currentRoute.value.query.plan as string;

    if (plan && redirect.includes('/checkout')) {
      // Redirect to checkout with plan
      router.push({
        path: redirect,
        query: { plan: plan }
      });
    } else {
      router.push(redirect);
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to create account';
  } finally {
    loading.value = false;
  }
};

const handleGoogleSignUp = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';

    if (!acceptedTerms.value) {
      errorMessage.value = 'You must accept the terms and conditions';
      return;
    }

    await authStore.signInWithGoogle();

    // Redirect to checkout or dashboard, preserving plan query param
    const redirect = router.currentRoute.value.query.redirect as string || '/checkout';
    const plan = router.currentRoute.value.query.plan as string;

    if (plan && redirect.includes('/checkout')) {
      // Redirect to checkout with plan
      router.push({
        path: redirect,
        query: { plan: plan }
      });
    } else {
      router.push(redirect);
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to sign up with Google';
  } finally {
    loading.value = false;
  }
};
</script>
