<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <router-link to="/" class="flex items-center">
                <img src="@/assets/o3-tt-gifts-logo.svg" alt="O3 TT Gifts" class="h-10 w-auto" />
              </router-link>
            </div>
          </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <a href="#features" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
              <a href="#pricing" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</a>
              <a href="#contact" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact</a>
            </div>
          </div>
          <div class="md:hidden">
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-gray-600 hover:text-primary-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile menu -->
      <div v-show="mobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
          <a href="#features" class="text-gray-600 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">Features</a>
          <a href="#pricing" class="text-gray-600 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">Pricing</a>
          <a href="#contact" class="text-gray-600 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">Contact</a>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <HeroSection />

    <!-- Features Section -->
    <FeaturesSection />

    <!-- Pricing Section -->
    <PricingSection />

    <!-- CTA Section -->
    <CTASection />

    <!-- Footer -->
    <FooterSection />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HeroSection from '@/components/HeroSection.vue'
import FeaturesSection from '@/components/FeaturesSection.vue'
import PricingSection from '@/components/PricingSection.vue'
import CTASection from '@/components/CTASection.vue'
import FooterSection from '@/components/FooterSection.vue'

const mobileMenuOpen = ref(false)
</script>
