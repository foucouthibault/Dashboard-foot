import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { API_BASE_URL, apiClient } from './api/client'
import { initSentry } from './monitoring/sentry'
import { trackServerStatus } from './api/serverStatus'
import { useServerStatusStore } from './stores/serverStatus'
import './assets/album.css'

const app = createApp(App)

// Désactivé sans VITE_SENTRY_DSN (développement, CI, tests)
initSentry(app, router, apiClient, {
  dsn: import.meta.env.VITE_SENTRY_DSN,
  apiBaseUrl: API_BASE_URL,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  release: import.meta.env.VITE_SENTRY_RELEASE,
})

app.use(createPinia())
app.use(router)

// Réveil du backend et quota atteint : message commun à toute l'application
trackServerStatus(apiClient, useServerStatusStore())

app.mount('#app')
