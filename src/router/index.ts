import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ContactView from '../views/ContactView.vue'
import PrivacyPolicy from '../views/PrivacyPolicy.vue'
import TermsOfService from '../views/TermsOfService.vue'
import CookiePolicy from '../views/CookiePolicy.vue'
import SystemStatus from '../views/SystemStatus.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import CheckoutSuccess from '../views/CheckoutSuccess.vue'
import CheckoutCancel from '../views/CheckoutCancel.vue'
import DashboardView from '../views/DashboardView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, _savedPosition) {
    // Always scroll to top when navigating to a new route
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView
    },
    {
      path: '/checkout/success',
      name: 'checkout-success',
      component: CheckoutSuccess
    },
    {
      path: '/checkout/cancel',
      name: 'checkout-cancel',
      component: CheckoutCancel
    },
    {
      path: '/app/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/app/settings',
      name: 'settings',
      component: SettingsView
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: PrivacyPolicy
    },
    {
      path: '/terms-of-service',
      name: 'terms-of-service',
      component: TermsOfService
    },
    {
      path: '/cookie-policy',
      name: 'cookie-policy',
      component: CookiePolicy
    },
    {
      path: '/system-status',
      name: 'system-status',
      component: SystemStatus
    }
  ]
})

export default router
