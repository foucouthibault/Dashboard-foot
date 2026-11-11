import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// Délai au-delà duquel un appel est jugé lent : le backend gratuit sort sans doute de veille.
export const SLOW_REQUEST_DELAY_MS = 4000
// Retry-After absent ou illisible (en-tête non exposé en CORS, 429 relayé de football-data.org) :
// le quota du backend est une fenêtre glissante d'une minute.
export const DEFAULT_RETRY_AFTER_SECONDS = 60

/**
 * État de la liaison avec le backend, commun à toute l'application : appels anormalement
 * lents (réveil après mise en veille) et quota atteint (429). Alimenté par les intercepteurs
 * d'`apiClient` (`@/api/serverStatus`), lu par `ServerStatusBanner`.
 */
export const useServerStatusStore = defineStore('serverStatus', () => {
  const slowRequests = ref(0)
  const retryAfterSeconds = ref<number | null>(null)
  let countdown: ReturnType<typeof setInterval> | undefined

  const isWakingUp = computed(() => slowRequests.value > 0)
  const isRateLimited = computed(() => retryAfterSeconds.value !== null)

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

  return { isWakingUp, isRateLimited, retryAfterSeconds, requestStarted, rateLimited }
})
