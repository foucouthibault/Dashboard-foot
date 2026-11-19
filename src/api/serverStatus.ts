import { AxiosHeaders, isAxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { STALE_DATA_TTL_MS } from '@/stores/serverStatus'
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
 * Lit `Age` (RFC 9111, secondes) : présent seulement quand le backend sert sa copie de
 * secours. `null` si absent, illisible ou nul (une copie de moins d'une seconde est fraîche).
 */
export function parseAge(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const seconds = Number(value)
  return Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : null
}

/** Identifie une requête (chemin et paramètres) pour suivre l'âge de sa donnée. */
export function requestKey(config: InternalAxiosRequestConfig): string {
  return `${config.url ?? ''}?${JSON.stringify(config.params ?? {})}`
}

// Données reçues de la copie de secours : les stores ne les gardent que peu de temps.
const staleData = new WeakSet<object>()

export function markStaleData(data: unknown): void {
  if (typeof data === 'object' && data !== null) staleData.add(data)
}

export function isStaleData(data: unknown): boolean {
  return typeof data === 'object' && data !== null && staleData.has(data)
}

/** Durée de cache d'une donnée dans un store : courte si elle vient de la copie de secours. */
export function cacheTtlFor(data: unknown, normalTtlMs: number): number {
  return isStaleData(data) ? Math.min(STALE_DATA_TTL_MS, normalTtlMs) : normalTtlMs
}

// get() d'AxiosHeaders ignore la casse du nom d'en-tête
function header(response: AxiosResponse, name: string): unknown {
  const { headers } = response
  return headers instanceof AxiosHeaders ? headers.get(name) : headers[name.toLowerCase()]
}

/**
 * Branche le suivi des appels lents, des `429` et des données anciennes (en-tête `Age`) sur un
 * client axios. Les intercepteurs ne relancent aucun appel : ils ne font qu'alimenter l'état
 * affiché à l'utilisateur et marquer les données anciennes pour le cache des stores.
 */
export function trackServerStatus(client: AxiosInstance, store: ServerStatusStore): void {
  client.interceptors.request.use((config) => {
    config.serverStatusDone = store.requestStarted()
    return config
  })

  client.interceptors.response.use(
    (response) => {
      response.config.serverStatusDone?.()
      const age = parseAge(header(response, 'Age'))
      if (age === null) {
        store.freshResponse(requestKey(response.config))
      } else {
        store.staleResponse(requestKey(response.config), age)
        markStaleData(response.data)
      }
      return response
    },
    (error: unknown) => {
      if (isAxiosError(error)) {
        error.config?.serverStatusDone?.()
        if (error.response?.status === 429) {
          store.rateLimited(parseRetryAfter(header(error.response, 'Retry-After')))
        }
      }
      return Promise.reject(error)
    },
  )
}
