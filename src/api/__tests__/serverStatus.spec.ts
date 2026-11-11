import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import axios, { AxiosError, AxiosHeaders } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { parseRetryAfter, trackServerStatus } from '@/api/serverStatus'
import {
  useServerStatusStore,
  SLOW_REQUEST_DELAY_MS,
  DEFAULT_RETRY_AFTER_SECONDS,
} from '@/stores/serverStatus'

// Aucun appel réseau : l'adaptateur axios est remplacé par une réponse simulée.
type Adapter = (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>

const response = (
  config: InternalAxiosRequestConfig,
  status: number,
  headers: Record<string, string> = {},
): AxiosResponse => ({
  data: {},
  status,
  statusText: '',
  headers: new AxiosHeaders(headers),
  config,
})

const clientWith = (adapter: Adapter): AxiosInstance => {
  const client = axios.create({ adapter })
  trackServerStatus(client, useServerStatusStore())
  return client
}

const tooManyRequests =
  (headers: Record<string, string> = {}): Adapter =>
  (config) => {
    const res = response(config, 429, headers)
    return Promise.reject(new AxiosError('429', 'ERR_BAD_REQUEST', config, null, res))
  }

describe('trackServerStatus', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("signale un réveil pendant un appel lent et l'efface à la réponse", async () => {
    let respond: () => void = () => {}
    const client = clientWith(
      (config) => new Promise((resolve) => (respond = () => resolve(response(config, 200)))),
    )
    const store = useServerStatusStore()

    const call = client.get('/competitions/FL1')
    await vi.advanceTimersByTimeAsync(SLOW_REQUEST_DELAY_MS)
    expect(store.isWakingUp).toBe(true)

    respond()
    await call
    expect(store.isWakingUp).toBe(false)
  })

  it("efface le réveil aussi quand l'appel lent échoue", async () => {
    let fail: () => void = () => {}
    const client = clientWith(
      (config) =>
        new Promise((_, reject) => {
          fail = () =>
            reject(new AxiosError('502', 'ERR_BAD_RESPONSE', config, null, response(config, 502)))
        }),
    )
    const store = useServerStatusStore()

    const call = client.get('/competitions/FL1').catch(() => {})
    await vi.advanceTimersByTimeAsync(SLOW_REQUEST_DELAY_MS)
    fail()
    await call

    expect(store.isWakingUp).toBe(false)
    expect(store.isRateLimited).toBe(false)
  })

  it('un 429 annonce le délai de Retry-After et laisse passer l’erreur', async () => {
    const client = clientWith(tooManyRequests({ 'Retry-After': '12' }))
    const store = useServerStatusStore()

    await expect(client.get('/competitions/FL1/standings')).rejects.toBeInstanceOf(AxiosError)

    expect(store.retryAfterSeconds).toBe(12)
  })

  it('un 429 sans Retry-After lisible annonce le délai par défaut', async () => {
    const client = clientWith(tooManyRequests())
    const store = useServerStatusStore()

    await expect(client.get('/competitions/FL1/standings')).rejects.toBeInstanceOf(AxiosError)

    expect(store.retryAfterSeconds).toBe(DEFAULT_RETRY_AFTER_SECONDS)
  })
})

describe('parseRetryAfter', () => {
  it('lit un nombre de secondes', () => {
    expect(parseRetryAfter('42')).toBe(42)
    expect(parseRetryAfter(7)).toBe(7)
  })

  it('ignore une valeur absente, nulle ou non numérique', () => {
    expect(parseRetryAfter(undefined)).toBeNull()
    expect(parseRetryAfter('0')).toBeNull()
    expect(parseRetryAfter('Wed, 21 Oct 2026 07:28:00 GMT')).toBeNull()
  })
})
