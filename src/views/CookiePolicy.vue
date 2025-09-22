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
              <router-link to="/contact" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact</router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="bg-white rounded-lg shadow-lg p-8 md:p-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
        
        <div class="prose prose-lg max-w-none">
          <p class="text-gray-600 mb-6">
            <strong>Last updated:</strong> January 1, 2025
          </p>

          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
            <p class="text-gray-700 mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
            </p>
            <p class="text-gray-700 mb-4">
              Cookies can be "persistent" (remaining on your device until deleted or expired) or "session" cookies (deleted when you close your browser).
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
            <p class="text-gray-700 mb-4">
              O3 TT Gifts uses cookies and similar technologies to:
            </p>
            <ul class="list-disc pl-6 text-gray-700 mb-4">
              <li>Remember your preferences and settings</li>
              <li>Keep you signed in to your account</li>
              <li>Analyze how you use our website and services</li>
              <li>Improve our website performance and user experience</li>
              <li>Provide personalized content and features</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
            
            <h3 class="text-xl font-semibold text-gray-900 mb-3">3.1 Essential Cookies</h3>
            <p class="text-gray-700 mb-4">
              These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and remembering your login status. The website cannot function properly without these cookies.
            </p>
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
              <p class="text-sm text-gray-600"><strong>Examples:</strong> Authentication cookies, security cookies, load balancing cookies</p>
            </div>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">3.2 Performance Cookies</h3>
            <p class="text-gray-700 mb-4">
              These cookies collect information about how visitors use our website, such as which pages are visited most often and if users get error messages. This helps us improve how our website works.
            </p>
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
              <p class="text-sm text-gray-600"><strong>Examples:</strong> Google Analytics cookies, performance monitoring cookies</p>
            </div>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">3.3 Functionality Cookies</h3>
            <p class="text-gray-700 mb-4">
              These cookies allow the website to remember choices you make (such as your username, language, or region) and provide enhanced, more personal features.
            </p>
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
              <p class="text-sm text-gray-600"><strong>Examples:</strong> Language preference cookies, theme selection cookies, user preference cookies</p>
            </div>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">3.4 Marketing Cookies</h3>
            <p class="text-gray-700 mb-4">
              These cookies are used to track visitors across websites to display relevant and engaging advertisements. They may also be used to limit the number of times you see an advertisement.
            </p>
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
              <p class="text-sm text-gray-600"><strong>Examples:</strong> Advertising network cookies, social media cookies, remarketing cookies</p>
            </div>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">4. Third-Party Cookies</h2>
            <p class="text-gray-700 mb-4">
              We may also use third-party services that set cookies on our website. These include:
            </p>
            <ul class="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Google Analytics:</strong> To analyze website usage and performance</li>
              <li><strong>Google Fonts:</strong> To display fonts consistently across devices</li>
              <li><strong>Social Media Platforms:</strong> For social sharing and integration features</li>
              <li><strong>Payment Processors:</strong> To process secure payments</li>
              <li><strong>Customer Support Tools:</strong> To provide live chat and support services</li>
            </ul>
            <p class="text-gray-700 mb-4">
              These third-party services have their own cookie policies, which we encourage you to review.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">5. Cookie Duration</h2>
            <p class="text-gray-700 mb-4">
              Different cookies have different lifespans:
            </p>
            <ul class="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain on your device for a set period (typically 30 days to 2 years)</li>
              <li><strong>Authentication Cookies:</strong> May last for the duration of your session or longer for convenience</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">6. Managing Your Cookie Preferences</h2>
            
            <h3 class="text-xl font-semibold text-gray-900 mb-3">6.1 Browser Settings</h3>
            <p class="text-gray-700 mb-4">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul class="list-disc pl-6 text-gray-700 mb-4">
              <li>Block all cookies</li>
              <li>Block third-party cookies only</li>
              <li>Delete existing cookies</li>
              <li>Set preferences for specific websites</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">6.2 Browser-Specific Instructions</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-2">Chrome</h4>
                <p class="text-sm text-gray-600">Settings → Privacy and Security → Cookies and other site data</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-2">Firefox</h4>
                <p class="text-sm text-gray-600">Options → Privacy & Security → Cookies and Site Data</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-2">Safari</h4>
                <p class="text-sm text-gray-600">Preferences → Privacy → Manage Website Data</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-2">Edge</h4>
                <p class="text-sm text-gray-600">Settings → Cookies and site permissions → Cookies and site data</p>
              </div>
            </div>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">6.3 Cookie Consent</h3>
            <p class="text-gray-700 mb-4">
              When you first visit our website, you may see a cookie consent banner. You can choose to accept or decline non-essential cookies. You can change your preferences at any time by clicking the cookie settings link in our website footer.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">7. Impact of Disabling Cookies</h2>
            <p class="text-gray-700 mb-4">
              If you choose to disable cookies, some features of our website may not function properly:
            </p>
            <ul class="list-disc pl-6 text-gray-700 mb-4">
              <li>You may need to log in repeatedly</li>
              <li>Your preferences and settings may not be saved</li>
              <li>Some personalized features may not work</li>
              <li>Website performance may be affected</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">8. Updates to This Cookie Policy</h2>
            <p class="text-gray-700 mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
            <p class="text-gray-700 mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div class="bg-gray-50 p-6 rounded-lg">
              <p class="text-gray-700 mb-2"><strong>Email:</strong> <a href="mailto:support@o3-ttgifts.com" class="text-primary-600 hover:underline">support@o3-ttgifts.com</a></p>
              <p class="text-gray-700 mb-2"><strong>Phone:</strong> <a href="tel:+97142582613" class="text-primary-600 hover:underline">+971 4 258 2613</a></p>
              <p class="text-gray-700 mb-2"><strong>Website:</strong> <a href="https://o3-ttgifts.com" class="text-primary-600 hover:underline">o3-ttgifts.com</a></p>
              <p class="text-gray-700"><strong>Business Hours:</strong> Monday - Friday (9 - 5 GMT +4), Saturday (9 - 12 GMT +4), Sunday (Closed)</p>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <FooterSection />
  </div>
</template>

<script setup lang="ts">
import FooterSection from '@/components/FooterSection.vue'
</script>
