import { createRouter, createWebHistory } from 'vue-router';
import { useAdminAuthStore } from '../stores/adminAuth';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import UsersView from '../views/UsersView.vue';
import AccountsView from '../views/AccountsView.vue';
import AnalyticsView from '../views/AnalyticsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requiresAuth: true }
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: AccountsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: AnalyticsView,
      meta: { requiresAuth: true }
    }
  ]
});

// Navigation guard
router.beforeEach(async (to, _from, next) => {
  const authStore = useAdminAuthStore();

  // Wait for auth to initialize on first load
  if (authStore.loading) {
    await authStore.initAuth();
  }

  const requiresAuth = to.meta.requiresAuth;
  const isAuthenticated = authStore.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if route requires auth and user is not authenticated
    next({ name: 'login' });
  } else if (!requiresAuth && isAuthenticated && to.name === 'login') {
    // Redirect to dashboard if already logged in and trying to access login
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
