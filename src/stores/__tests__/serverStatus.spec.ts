import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  formatAge,
  useServerStatusStore,
  SLOW_REQUEST_DELAY_MS,
  DEFAULT_RETRY_AFTER_SECONDS,
} from '@/stores/serverStatus'

describe('useServerStatusStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("ne signale un réveil qu'après le délai, et plus du tout à la fin de l'appel", () => {
    const store = useServerStatusStore()

    const done = store.requestStarted()
    vi.advanceTimersByTime(SLOW_REQUEST_DELAY_MS - 1)
    expect(store.isWakingUp).toBe(false)

    vi.advanceTimersByTime(1)
    expect(store.isWakingUp).toBe(true)

    done()
    expect(store.isWakingUp).toBe(false)
  })

  it('ne signale rien pour un appel terminé avant le délai', () => {
    const store = useServerStatusStore()

    store.requestStarted()()
    vi.advanceTimersByTime(SLOW_REQUEST_DELAY_MS * 2)

    expect(store.isWakingUp).toBe(false)
  })

  it('garde le message tant qu’un appel lent est en cours', () => {
    const store = useServerStatusStore()

    const first = store.requestStarted()
    const second = store.requestStarted()
    vi.advanceTimersByTime(SLOW_REQUEST_DELAY_MS)

    first()
    first() // un double appel ne doit pas fausser le compte
    expect(store.isWakingUp).toBe(true)

    second()
    expect(store.isWakingUp).toBe(false)
  })

  it('décompte le Retry-After puis efface le message', () => {
    const store = useServerStatusStore()

    store.rateLimited(3)
    expect(store.isRateLimited).toBe(true)
    expect(store.retryAfterSeconds).toBe(3)

    vi.advanceTimersByTime(1000)
    expect(store.retryAfterSeconds).toBe(2)

    vi.advanceTimersByTime(2000)
    expect(store.isRateLimited).toBe(false)
    expect(store.retryAfterSeconds).toBeNull()
  })

  it("attend la durée par défaut quand Retry-After n'est pas connu", () => {
    const store = useServerStatusStore()

    store.rateLimited(null)

    expect(store.retryAfterSeconds).toBe(DEFAULT_RETRY_AFTER_SECONDS)
  })

  it('ne raccourcit pas une attente déjà annoncée', () => {
    const store = useServerStatusStore()

    store.rateLimited(30)
    store.rateLimited(5)

    expect(store.retryAfterSeconds).toBe(30)
  })

  it("garde l'âge le plus élevé des données anciennes, et l'oublie quand elles sont rafraîchies", () => {
    const store = useServerStatusStore()

    store.staleResponse('/competitions/FL1/standings?{}', 120)
    store.staleResponse('/competitions/FL1/matches?{}', 900)
    expect(store.staleAgeSeconds).toBe(900)

    store.freshResponse('/competitions/FL1/matches?{}')
    expect(store.staleAgeSeconds).toBe(120)

    store.freshResponse('/competitions/FL1/standings?{}')
    expect(store.isServingStaleData).toBe(false)
    expect(store.staleAgeSeconds).toBeNull()
  })
})

describe('formatAge', () => {
  it('donne un âge lisible, de la minute au jour', () => {
    expect(formatAge(30)).toBe("moins d'une minute")
    expect(formatAge(60)).toBe('1 min')
    expect(formatAge(59 * 60 + 59)).toBe('59 min')
    expect(formatAge(2 * 3600 + 1200)).toBe('2 h')
    expect(formatAge(24 * 3600)).toBe('1 jour')
    expect(formatAge(3 * 24 * 3600 + 5)).toBe('3 jours')
  })
})
