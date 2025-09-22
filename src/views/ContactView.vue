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
              <router-link to="/" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</router-link>
              <a href="/#features" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
              <a href="/#pricing" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</a>
              <router-link to="/contact" class="text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Contact</router-link>
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
          <router-link to="/" class="text-gray-600 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">Home</router-link>
          <a href="/#features" class="text-gray-600 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">Features</a>
          <a href="/#pricing" class="text-gray-600 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">Pricing</a>
          <router-link to="/contact" class="text-primary-600 block px-3 py-2 rounded-md text-base font-medium">Contact</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
        <p class="text-xl text-primary-100 max-w-3xl mx-auto">
          Ready to transform your TikTok live streams? Our team is here to help you get started with professional analytics and tracking.
        </p>
      </div>
    </section>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Contact Form -->
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
          
          <form @submit.prevent="submitForm" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  v-model="form.firstName"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="John"
                />
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  v-model="form.lastName"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                id="email"
                v-model="form.email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="john@company.com"
              />
            </div>

            <div>
              <label for="company" class="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                id="company"
                v-model="form.company"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Your Company Name"
              />
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                id="phone"
                v-model="form.phone"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <select
                id="subject"
                v-model="form.subject"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="sales">Sales & Pricing</option>
                <option value="support">Technical Support</option>
                <option value="demo">Request a Demo</option>
                <option value="partnership">Partnership</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label for="message" class="block text-sm font-medium text-gray-700 mb-2">Message *</label>
              <textarea
                id="message"
                v-model="form.message"
                required
                rows="5"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                placeholder="Tell us about your needs and how we can help..."
              ></textarea>
            </div>

            <div class="flex items-start">
              <input
                type="checkbox"
                id="consent"
                v-model="form.consent"
                required
                class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="consent" class="ml-3 text-sm text-gray-600">
                I agree to the <router-link to="/privacy-policy" class="text-primary-600 hover:underline">Privacy Policy</router-link> and consent to being contacted by O3 TT Gifts regarding my inquiry.
              </label>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Message...
              </span>
              <span v-else>Send Message</span>
            </button>
          </form>

          <!-- Success Message -->
          <div v-if="showSuccess" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex">
              <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">Message sent successfully!</h3>
                <p class="mt-1 text-sm text-green-700">We'll get back to you within 24 hours.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="space-y-8">
          <!-- Contact Details -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            
            <div class="space-y-6">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-gray-900">Email</h3>
                  <p class="text-gray-600">support@o3-ttgifts.com</p>
                  <a href="mailto:support@o3-ttgifts.com" class="text-primary-600 hover:underline text-sm">Send us an email</a>
                </div>
              </div>

              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-gray-900">Phone</h3>
                  <p class="text-gray-600">+971 4 258 2613</p>
                  <a href="tel:+97142582613" class="text-primary-600 hover:underline text-sm">Call us now</a>
                </div>
              </div>

              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-gray-900">Business Hours</h3>
                  <div class="text-gray-600 space-y-1">
                    <p>Monday - Friday: 9:00 AM - 5:00 PM GMT +4</p>
                    <p>Saturday: 9:00 AM - 12:00 PM GMT +4</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>

              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-gray-900">Website</h3>
                  <p class="text-gray-600">o3-ttgifts.com</p>
                  <a href="https://o3-ttgifts.com" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline text-sm">Visit our website</a>
                </div>
              </div>
            </div>
          </div>

          <!-- Support Tiers -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Support Tiers</h2>
            
            <div class="space-y-4">
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-semibold text-gray-900">Enterprise</h3>
                  <span class="text-sm text-green-600 font-medium">24/7 Support</span>
                </div>
                <p class="text-sm text-gray-600">Phone, email, and priority support for Enterprise customers</p>
              </div>

              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-semibold text-gray-900">Professional</h3>
                  <span class="text-sm text-blue-600 font-medium">Priority Support</span>
                </div>
                <p class="text-sm text-gray-600">Email and priority support for Professional plan customers</p>
              </div>

              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-semibold text-gray-900">Starter</h3>
                  <span class="text-sm text-gray-600 font-medium">Email Support</span>
                </div>
                <p class="text-sm text-gray-600">Email support for all Starter plan customers</p>
              </div>
            </div>
          </div>

          <!-- FAQ Quick Links -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Quick Help</h2>
            
            <div class="space-y-3">
              <a href="#" class="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h3 class="font-medium text-gray-900">How do I get started?</h3>
                <p class="text-sm text-gray-600">Learn how to set up your first TikTok account</p>
              </a>
              
              <a href="#" class="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h3 class="font-medium text-gray-900">Pricing & Plans</h3>
                <p class="text-sm text-gray-600">Compare our subscription plans and features</p>
              </a>
              
              <a href="#" class="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h3 class="font-medium text-gray-900">API Documentation</h3>
                <p class="text-sm text-gray-600">Access our comprehensive API documentation</p>
              </a>
              
              <a href="#" class="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h3 class="font-medium text-gray-900">System Status</h3>
                <p class="text-sm text-gray-600">Check the current status of our services</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <FooterSection />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import FooterSection from '@/components/FooterSection.vue'

const mobileMenuOpen = ref(false)
const isSubmitting = ref(false)
const showSuccess = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  phone: '',
  subject: '',
  message: '',
  consent: false
})

const submitForm = async () => {
  isSubmitting.value = true
  
  try {
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Reset form
    Object.keys(form).forEach(key => {
      if (key === 'consent') {
        form[key] = false
      } else {
        form[key] = ''
      }
    })
    
    showSuccess.value = true
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      showSuccess.value = false
    }, 5000)
    
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
