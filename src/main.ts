import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'
import '@/styles/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

async function initializeApp() {
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()
  await authStore.initializeAuth()
  app.mount('#app')
}

initializeApp()

