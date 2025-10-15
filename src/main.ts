import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Import auth store for initialization
import { useAuthStore } from './stores/auth'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize authentication before mounting
const authStore = useAuthStore()
authStore.initAuth().then(() => {
  app.mount('#app')
})
