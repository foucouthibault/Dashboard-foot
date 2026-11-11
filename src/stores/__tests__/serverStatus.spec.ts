import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
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
})
