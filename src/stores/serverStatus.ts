import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// Délai au-delà duquel un appel est jugé lent : le backend gratuit sort sans doute de veille.
export const SLOW_REQUEST_DELAY_MS = 4000
// Retry-After absent ou illisible (en-tête non exposé en CORS, 429 relayé de football-data.org) :
// le quota du backend est une fenêtre glissante d'une minute.
export const DEFAULT_RETRY_AFTER_SECONDS = 60
// Donnée servie par la copie de secours du backend (en-tête Age) : les stores ne la gardent que
// ce temps-là, pour redemander la donnée fraîche dès que le backend s'est rétabli.
export const STALE_DATA_TTL_MS = 30 * 1000

/** Âge lisible d'une donnée : « moins d'une minute », « 12 min », « 2 h », « 3 jours ». */
export function formatAge(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  if (minutes < 1) return "moins d'une minute"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h`
  const days = Math.floor(hours / 24)
  return `${days} jour${days > 1 ? 's' : ''}`
}

/**
 * État de la liaison avec le backend, commun à toute l'application : appels anormalement
 * lents (réveil après mise en veille), quota atteint (429) et données anciennes servies par la
 * copie de secours du backend (en-tête Age). Alimenté par les intercepteurs d'`apiClient`
 * (`@/api/serverStatus`), lu par `ServerStatusBanner`.
 */
export const useServerStatusStore = defineStore('serverStatus', () => {
  const slowRequests = ref(0)
  const retryAfterSeconds = ref<number | null>(null)
  let countdown: ReturnType<typeof setInterval> | undefined

  const isWakingUp = computed(() => slowRequests.value > 0)
  const isRateLimited = computed(() => retryAfterSeconds.value !== null)

  // Âge (secondes) de chaque donnée servie par la copie de secours, par requête
  const staleAges = ref<Record<string, number>>({})
  const staleAgeSeconds = computed(() => {
    const ages = Object.values(staleAges.value)
    return ages.length > 0 ? Math.max(...ages) : null
  })
  const isServingStaleData = computed(() => staleAgeSeconds.value !== null)

  /** Réponse servie par la copie de secours du backend, vieille de `ageSeconds`. */
  const staleResponse = (requestKey: string, ageSeconds: number) => {
    staleAges.value[requestKey] = ageSeconds
  }

  /** Réponse fraîche : la donnée de cette requête n'est plus ancienne. */
  const freshResponse = (requestKey: string) => {
    if (requestKey in staleAges.value) {
      staleAges.value = Object.fromEntries(
        Object.entries(staleAges.value).filter(([key]) => key !== requestKey),
      )
    }
  }

  /**
   * Signale le départ d'un appel. Renvoie la fonction à appeler à sa fin, réponse ou erreur :
   * l'appel compte comme lent s'il n'est pas terminé après `SLOW_REQUEST_DELAY_MS`.
   */
  const requestStarted = (): (() => void) => {
    let slow = false
    let ended = false
    const timer = setTimeout(() => {
      slow = true
      slowRequests.value++
    }, SLOW_REQUEST_DELAY_MS)

    return () => {
      if (ended) return
      ended = true
      clearTimeout(timer)
      if (slow) slowRequests.value--
    }
  }

  /** Quota atteint : affiche un compte à rebours de `seconds` secondes. */
  const rateLimited = (seconds: number | null) => {
    const delay = seconds !== null && seconds > 0 ? seconds : DEFAULT_RETRY_AFTER_SECONDS
    // Un second 429 ne raccourcit pas une attente déjà annoncée.
    retryAfterSeconds.value = Math.max(retryAfterSeconds.value ?? 0, Math.ceil(delay))
    clearInterval(countdown)
    countdown = setInterval(() => {
      if (retryAfterSeconds.value === null || retryAfterSeconds.value <= 1) {
        retryAfterSeconds.value = null
        clearInterval(countdown)
        return
      }
      retryAfterSeconds.value--
    }, 1000)
  }

  return {
    isWakingUp,
    isRateLimited,
    retryAfterSeconds,
    requestStarted,
    rateLimited,
    isServingStaleData,
    staleAgeSeconds,
    staleResponse,
    freshResponse,
  }
})
