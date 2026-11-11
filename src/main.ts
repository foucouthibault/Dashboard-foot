import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { apiClient } from './api/client'
import { trackServerStatus } from './api/serverStatus'
import { useServerStatusStore } from './stores/serverStatus'
import './assets/album.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Réveil du backend et quota atteint : message commun à toute l'application
trackServerStatus(apiClient, useServerStatusStore())

app.mount('#app')
