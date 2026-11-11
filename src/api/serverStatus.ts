import { AxiosHeaders, isAxiosError } from 'axios'
import type { AxiosInstance } from 'axios'
import type { useServerStatusStore } from '@/stores/serverStatus'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    // Fin de suivi de l'appel par useServerStatusStore
    serverStatusDone?: () => void
  }
}

type ServerStatusStore = ReturnType<typeof useServerStatusStore>

/** Lit `Retry-After` exprimé en secondes ; `null` si absent ou illisible. */
export function parseRetryAfter(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const seconds = Number(value)
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null
}

/**
 * Branche le suivi des appels lents et des `429` sur un client axios. Les intercepteurs
 * ne relancent aucun appel : ils ne font qu'alimenter l'état affiché à l'utilisateur.
 */
export function trackServerStatus(client: AxiosInstance, store: ServerStatusStore): void {
  client.interceptors.request.use((config) => {
    config.serverStatusDone = store.requestStarted()
    return config
  })

  client.interceptors.response.use(
    (response) => {
      response.config.serverStatusDone?.()
      return response
    },
    (error: unknown) => {
      if (isAxiosError(error)) {
        error.config?.serverStatusDone?.()
        if (error.response?.status === 429) {
          // get() d'AxiosHeaders ignore la casse du nom d'en-tête
          const { headers } = error.response
          const retryAfter =
            headers instanceof AxiosHeaders ? headers.get('Retry-After') : headers['retry-after']
          store.rateLimited(parseRetryAfter(retryAfter))
        }
      }
      return Promise.reject(error)
    },
  )
}
