import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  // Environnement et version transmis à Sentry : Netlify fournit le contexte du build
  // (production, deploy-preview, branch-deploy) et le hash du commit.
  define: {
    'import.meta.env.VITE_SENTRY_ENVIRONMENT': JSON.stringify(process.env.CONTEXT ?? 'development'),
    'import.meta.env.VITE_SENTRY_RELEASE': JSON.stringify(process.env.COMMIT_REF ?? ''),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
