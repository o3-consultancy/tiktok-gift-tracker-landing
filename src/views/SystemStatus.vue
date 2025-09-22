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

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">System Status</h1>
        <p class="text-xl text-primary-100 max-w-3xl mx-auto">
          Real-time status of O3 TT Gifts services and infrastructure. We're committed to maintaining 99.9% uptime for our platform.
        </p>
      </div>
    </section>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Overall Status -->
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Overall System Status</h2>
          <div class="flex items-center">
            <div class="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span class="text-lg font-semibold text-green-600">All Systems Operational</span>
          </div>
        </div>
        <p class="text-gray-600">
          All services are running normally. Last updated: {{ lastUpdated }}
        </p>
      </div>

      <!-- Service Status Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div v-for="service in services" :key="service.name" class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ service.name }}</h3>
            <div class="flex items-center">
              <div :class="getStatusColor(service.status)" class="w-3 h-3 rounded-full mr-2"></div>
              <span :class="getStatusTextColor(service.status)" class="text-sm font-medium">{{ service.status }}</span>
            </div>
          </div>
          <p class="text-gray-600 text-sm mb-4">{{ service.description }}</p>
          <div class="text-xs text-gray-500">
            Response time: {{ service.responseTime }}
          </div>
        </div>
      </div>

      <!-- Recent Incidents -->
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Recent Incidents</h2>
        <div v-if="incidents.length === 0" class="text-center py-8">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No Recent Incidents</h3>
          <p class="text-gray-600">All systems have been running smoothly with no reported issues.</p>
        </div>
        <div v-else class="space-y-4">
          <div v-for="incident in incidents" :key="incident.id" class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-gray-900">{{ incident.title }}</h3>
              <span :class="getIncidentStatusColor(incident.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ incident.status }}
              </span>
            </div>
            <p class="text-gray-600 text-sm mb-2">{{ incident.description }}</p>
            <div class="text-xs text-gray-500">
              {{ incident.startTime }} - {{ incident.endTime || 'Ongoing' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Performance Metrics</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 mb-2">99.9%</div>
            <div class="text-sm text-gray-600">Uptime (30 days)</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">45ms</div>
            <div class="text-sm text-gray-600">Avg Response Time</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600 mb-2">0</div>
            <div class="text-sm text-gray-600">Active Incidents</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div class="text-sm text-gray-600">Monitoring</div>
          </div>
        </div>
      </div>

      <!-- Maintenance Schedule -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Scheduled Maintenance</h2>
        <div v-if="maintenance.length === 0" class="text-center py-8">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No Scheduled Maintenance</h3>
          <p class="text-gray-600">No maintenance windows are currently scheduled.</p>
        </div>
        <div v-else class="space-y-4">
          <div v-for="item in maintenance" :key="item.id" class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-gray-900">{{ item.title }}</h3>
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Scheduled
              </span>
            </div>
            <p class="text-gray-600 text-sm mb-2">{{ item.description }}</p>
            <div class="text-xs text-gray-500">
              {{ item.scheduledTime }}
            </div>
          </div>
        </div>
      </div>

      <!-- Status Page Info -->
      <div class="mt-12 text-center">
        <p class="text-gray-600 mb-4">
          This status page is updated every 60 seconds. For real-time updates, subscribe to our status notifications.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="mailto:support@o3-ttgifts.com" class="btn-outline">
            Subscribe to Updates
          </a>
          <router-link to="/contact" class="btn-primary">
            Contact Support
          </router-link>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <FooterSection />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FooterSection from '@/components/FooterSection.vue'

const lastUpdated = ref('')

const services = ref([
  {
    name: 'Web Application',
    status: 'Operational',
    description: 'Main web application and dashboard',
    responseTime: '45ms'
  },
  {
    name: 'API Services',
    status: 'Operational',
    description: 'REST API and data processing',
    responseTime: '32ms'
  },
  {
    name: 'TikTok Integration',
    status: 'Operational',
    description: 'TikTok API connections and data sync',
    responseTime: '78ms'
  },
  {
    name: 'Analytics Engine',
    status: 'Operational',
    description: 'Real-time analytics and reporting',
    responseTime: '56ms'
  },
  {
    name: 'Database',
    status: 'Operational',
    description: 'Primary database and data storage',
    responseTime: '12ms'
  },
  {
    name: 'CDN',
    status: 'Operational',
    description: 'Content delivery network',
    responseTime: '23ms'
  }
])

interface Incident {
  id: string
  title: string
  status: string
  description: string
  startTime: string
  endTime?: string
}

interface Maintenance {
  id: string
  title: string
  description: string
  scheduledTime: string
}

const incidents = ref<Incident[]>([
  // No incidents currently
])

const maintenance = ref<Maintenance[]>([
  // No scheduled maintenance
])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Operational':
      return 'bg-green-500'
    case 'Degraded':
      return 'bg-yellow-500'
    case 'Outage':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const getStatusTextColor = (status: string) => {
  switch (status) {
    case 'Operational':
      return 'text-green-600'
    case 'Degraded':
      return 'text-yellow-600'
    case 'Outage':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

const getIncidentStatusColor = (status: string) => {
  switch (status) {
    case 'Resolved':
      return 'bg-green-100 text-green-800'
    case 'Investigating':
      return 'bg-yellow-100 text-yellow-800'
    case 'Monitoring':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const updateTimestamp = () => {
  const now = new Date()
  lastUpdated.value = now.toLocaleString('en-US', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  updateTimestamp()
  // Update timestamp every minute
  setInterval(updateTimestamp, 60000)
})
</script>
