<template>
  <footer id="contact" class="bg-dark-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Company Info -->
        <div class="md:col-span-2">
          <div class="mb-6">
            <h3 class="text-2xl font-bold gradient-text mb-4">O3 TT Gifts</h3>
            <p class="text-gray-300 mb-6 max-w-md">
              The professional platform for media agencies and brand managers to track, analyze, and optimize TikTok live stream performance with real-time overlays and advanced analytics.
            </p>
          </div>
          
          <!-- O3 Consultancy Branding -->
          <div class="border-t border-gray-700 pt-6">
            <p class="text-sm text-gray-400 mb-2">Powered by</p>
            <div class="flex items-center">
              <img src="@/assets/O3-logo.png" alt="O3 Consultancy" class="w-8 h-8 mr-3" />
              <div>
                <a href="https://www.o3consultancy.ae" target="_blank" rel="noopener noreferrer" class="text-lg font-semibold text-white hover:text-primary-400 transition-colors">O3 Consultancy</a>
                <p class="text-sm text-gray-400">Professional Software Solutions</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quick Links -->
        <div>
          <h4 class="text-lg font-semibold mb-4">Product</h4>
          <ul class="space-y-2">
            <li><a href="#features" class="text-gray-300 hover:text-white transition-colors">Features</a></li>
            <li><a href="#pricing" class="text-gray-300 hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#" class="text-gray-300 hover:text-white transition-colors">API Documentation</a></li>
            <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Integrations</a></li>
            <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Changelog</a></li>
          </ul>
        </div>
        
        <!-- Support -->
        <div>
          <h4 class="text-lg font-semibold mb-4">Support</h4>
          <ul class="space-y-2">
            <li><router-link to="/contact" class="text-gray-300 hover:text-white transition-colors">Help Center</router-link></li>
            <li><router-link to="/contact" class="text-gray-300 hover:text-white transition-colors">Contact Support</router-link></li>
            <li><a href="#" class="text-gray-300 hover:text-white transition-colors">System Status</a></li>
            <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Community</a></li>
            <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Training</a></li>
          </ul>
        </div>
      </div>
      
      <!-- Contact Information -->
      <div class="border-t border-gray-700 mt-12 pt-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h5 class="font-semibold mb-3">Contact Information</h5>
            <div class="space-y-2 text-gray-300">
              <p>📧 <a href="mailto:support@o3-ttgifts.com" class="hover:text-white transition-colors">support@o3-ttgifts.com</a></p>
              <p>📞 <a href="tel:+97142582613" class="hover:text-white transition-colors">+971 4 258 2613</a></p>
              <p>🌐 <a href="https://o3-ttgifts.com" class="hover:text-white transition-colors">o3-ttgifts.com</a></p>
            </div>
          </div>
          
          <div>
            <h5 class="font-semibold mb-3">Business Hours</h5>
            <div class="space-y-2 text-gray-300">
              <p>Monday - Friday: 9:00 AM - 5:00 PM GMT +4</p>
              <p>Saturday: 9:00 AM - 12:00 PM GMT +4</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
          
          <div>
            <h5 class="font-semibold mb-3">Emergency Support</h5>
            <div class="space-y-2 text-gray-300">
              <p>24/7 Support for Enterprise customers</p>
              <p>Priority support for Professional plans</p>
              <p>Email support for all plans</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bottom Bar -->
      <div class="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <div class="text-gray-400 text-sm mb-4 md:mb-0">
          © 2025 O3 TT Gifts. All rights reserved. | Powered by <a href="https://www.o3consultancy.ae" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">O3 Consultancy</a>
        </div>
        
        <div class="flex space-x-6">
          <router-link to="/privacy-policy" class="text-gray-400 hover:text-white transition-colors">Privacy Policy</router-link>
          <router-link to="/terms-of-service" class="text-gray-400 hover:text-white transition-colors">Terms of Service</router-link>
          <router-link to="/cookie-policy" class="text-gray-400 hover:text-white transition-colors">Cookie Policy</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Footer section component
</script>
