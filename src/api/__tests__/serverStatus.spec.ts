import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import axios, { AxiosError, AxiosHeaders } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import {
  cacheTtlFor,
  isStaleData,
  markStaleData,
  parseAge,
  parseRetryAfter,
  trackServerStatus,
} from '@/api/serverStatus'
import {
  useServerStatusStore,
  SLOW_REQUEST_DELAY_MS,
  DEFAULT_RETRY_AFTER_SECONDS,
  STALE_DATA_TTL_MS,
} from '@/stores/serverStatus'

// Aucun appel réseau : l'adaptateur axios est remplacé par une réponse simulée.
type Adapter = (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>

const response = (
  config: InternalAxiosRequestConfig,
  status: number,
  headers: Record<string, string> = {},
): AxiosResponse => ({
  data: { standings: [] },
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

describe('trackServerStatus et la copie de secours du backend (en-tête Age)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const answering =
    (...ages: (string | undefined)[]): Adapter =>
    (config) => {
      const age = ages.shift()
      return Promise.resolve(response(config, 200, age === undefined ? {} : { Age: age }))
    }

  it("signale l'âge d'une donnée servie par la copie de secours et la marque comme ancienne", async () => {
    const client = clientWith(answering('7200'))
    const store = useServerStatusStore()

    const { data } = await client.get('/competitions/FL1/standings')

    expect(store.isServingStaleData).toBe(true)
    expect(store.staleAgeSeconds).toBe(7200)
    expect(isStaleData(data)).toBe(true)
  })

  it('ne signale rien pour une réponse sans Age, ou avec un Age illisible ou nul', async () => {
    const client = clientWith(answering(undefined, 'hier', '0'))
    const store = useServerStatusStore()

    const responses = [
      await client.get('/competitions/FL1'),
      await client.get('/competitions/PL'),
      await client.get('/competitions/SA'),
    ]

    expect(store.isServingStaleData).toBe(false)
    expect(responses.some(({ data }) => isStaleData(data))).toBe(false)
  })

  it('une réponse fraîche pour la même donnée efface le signalement', async () => {
    const client = clientWith(answering('600', undefined))
    const store = useServerStatusStore()

    await client.get('/competitions/FL1/standings', { params: { season: '2024' } })
    expect(store.staleAgeSeconds).toBe(600)

    await client.get('/competitions/FL1/standings', { params: { season: '2024' } })
    expect(store.isServingStaleData).toBe(false)
  })

  it("une réponse fraîche pour une autre donnée n'efface pas le signalement", async () => {
    const client = clientWith(answering('600', undefined))
    const store = useServerStatusStore()

    await client.get('/competitions/FL1/standings', { params: { season: '2024' } })
    await client.get('/competitions/FL1/standings', { params: { season: '2023' } })

    expect(store.staleAgeSeconds).toBe(600)
  })
})

describe('parseAge', () => {
  it('lit un nombre de secondes', () => {
    expect(parseAge('90')).toBe(90)
    expect(parseAge(3600)).toBe(3600)
  })

  it('ignore une valeur absente, nulle ou non numérique', () => {
    expect(parseAge(undefined)).toBeNull()
    expect(parseAge('0')).toBeNull()
    expect(parseAge('-5')).toBeNull()
    expect(parseAge('une heure')).toBeNull()
  })
})

describe('cacheTtlFor', () => {
  it('raccourcit la durée de cache d’une donnée ancienne seulement', () => {
    const fresh = { scorers: [] }
    const stale = { scorers: [] }
    markStaleData(stale)

    expect(cacheTtlFor(fresh, 5 * 60 * 1000)).toBe(5 * 60 * 1000)
    expect(cacheTtlFor(stale, 5 * 60 * 1000)).toBe(STALE_DATA_TTL_MS)
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
