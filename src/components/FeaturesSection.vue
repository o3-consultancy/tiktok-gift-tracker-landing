<template>
  <section id="features" class="section-padding bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Everything You Need for Professional TikTok Live Management
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          From real-time gift tracking to advanced analytics, our platform provides media agencies with the tools they need to optimize live stream performance and maximize brand engagement.
        </p>
      </div>

      <!-- Core Features -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div v-for="feature in coreFeatures" :key="feature.title" class="feature-card">
          <div class="text-primary-600 mb-4">
            <component :is="feature.icon" class="h-8 w-8" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ feature.title }}</h3>
          <p class="text-gray-600">{{ feature.description }}</p>
        </div>
      </div>

      <!-- Advanced Features -->
      <div class="bg-gray-50 rounded-2xl p-8 md:p-12 mb-16">
        <div class="text-center mb-12">
          <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Advanced Analytics & Insights
          </h3>
          <p class="text-lg text-gray-600">
            Deep dive into performance metrics and audience behavior
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div v-for="feature in advancedFeatures" :key="feature.title" class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <component :is="feature.icon" class="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div>
              <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ feature.title }}</h4>
              <p class="text-gray-600">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Overlay Types -->
      <div class="mb-16">
        <div class="text-center mb-12">
          <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Professional Overlay Styles
          </h3>
          <p class="text-lg text-gray-600">
            Choose from multiple overlay designs to match your brand
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="overlay in overlayTypes" :key="overlay.name" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div class="text-center">
              <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <component :is="overlay.icon" class="h-8 w-8 text-white" />
              </div>
              <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ overlay.name }}</h4>
              <p class="text-gray-600 text-sm">{{ overlay.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Future Features -->
      <div class="bg-primary-50 rounded-2xl p-8 md:p-12">
        <div class="text-center mb-12">
          <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Coming Soon - Advanced Features
          </h3>
          <p class="text-lg text-gray-600">
            We're constantly innovating to bring you the latest in live stream analytics
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="feature in futureFeatures" :key="feature.title" class="bg-white rounded-xl p-6 border border-primary-200">
            <div class="flex items-center mb-3">
              <component :is="feature.icon" class="h-6 w-6 text-primary-600 mr-3" />
              <h4 class="text-lg font-semibold text-gray-900">{{ feature.title }}</h4>
            </div>
            <p class="text-gray-600 text-sm">{{ feature.description }}</p>
            <div class="mt-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { 
  ChartBarIcon, 
  EyeIcon, 
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ClockIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ChartPieIcon,
  DocumentTextIcon,
  CloudIcon,
  CogIcon,
  BellIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/vue/24/outline'

const coreFeatures = [
  {
    icon: ChartBarIcon,
    title: 'Real-time Gift Tracking',
    description: 'Monitor live gift donations with instant updates and comprehensive analytics for optimal stream performance.'
  },
  {
    icon: EyeIcon,
    title: 'Live Stream Analytics',
    description: 'Track viewer engagement, peak activity times, and audience retention with detailed performance metrics.'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Chat Monitoring',
    description: 'Monitor live chat interactions, track engagement patterns, and identify top contributors in real-time.'
  },
  {
    icon: UserGroupIcon,
    title: 'Multi-Account Management',
    description: 'Manage multiple TikTok accounts simultaneously with role-based access control for team collaboration.'
  },
  {
    icon: ClockIcon,
    title: 'Historical Data',
    description: 'Access comprehensive historical data and trends to optimize future live stream strategies and content.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprise Security',
    description: 'Bank-level security with data encryption, secure authentication, and compliance with industry standards.'
  }
]

const advancedFeatures = [
  {
    icon: CpuChipIcon,
    title: 'AI-Powered Analytics',
    description: 'Smart insights and predictions based on machine learning algorithms to optimize your live stream performance.'
  },
  {
    icon: ChartPieIcon,
    title: 'Revenue Tracking',
    description: 'Convert diamonds to actual revenue estimates and track ROI for brand partnerships and campaigns.'
  },
  {
    icon: DocumentTextIcon,
    title: 'Custom Reports',
    description: 'Generate detailed reports and export data in multiple formats for client presentations and analysis.'
  },
  {
    icon: CloudIcon,
    title: 'Cloud Backup',
    description: 'Automatic cloud backup of all configurations, historical data, and analytics for data security.'
  },
  {
    icon: CogIcon,
    title: 'API Access',
    description: 'Full REST API access for custom integrations with your existing tools and workflows.'
  },
  {
    icon: BellIcon,
    title: 'Smart Notifications',
    description: 'Get notified of milestones, anomalies, and important events with customizable alert systems.'
  }
]

const overlayTypes = [
  {
    name: 'Progress Bar',
    icon: ChartBarIcon,
    description: 'Classic progress bar with customizable colors and animations'
  },
  {
    name: 'Circular Progress',
    icon: CpuChipIcon,
    description: 'Modern circular progress indicator with smooth animations'
  },
  {
    name: 'Goal Thermometer',
    icon: ChartPieIcon,
    description: 'Visual thermometer-style progress display'
  },
  {
    name: 'Leaderboard',
    icon: UserGroupIcon,
    description: 'Professional leaderboard showing top gifters'
  },
  {
    name: 'Minimal Text',
    icon: DocumentTextIcon,
    description: 'Clean, minimal text overlay for subtle branding'
  },
  {
    name: 'Live Chat Feed',
    icon: ChatBubbleLeftRightIcon,
    description: 'Dedicated chat overlay for stream integration'
  }
]

const futureFeatures = [
  {
    icon: GlobeAltIcon,
    title: 'Multi-Platform Support',
    description: 'Track live streams across TikTok, Instagram, YouTube, and Twitch from a single dashboard.'
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Mobile App',
    description: 'Companion mobile app for remote management and real-time notifications on the go.'
  },
  {
    icon: SparklesIcon,
    title: 'AI Content Suggestions',
    description: 'Get AI-powered recommendations for optimal streaming times and content strategies.'
  },
  {
    icon: RocketLaunchIcon,
    title: 'OBS Integration',
    description: 'Direct OBS plugin for seamless overlay integration and stream management.'
  },
  {
    icon: UserGroupIcon,
    title: 'Team Collaboration',
    description: 'Advanced team features with role-based permissions and collaborative analytics.'
  },
  {
    icon: ChartBarIcon,
    title: 'Predictive Analytics',
    description: 'Forecast gift trends and viewer engagement using advanced machine learning models.'
  }
]
</script>
