import { describe, it, expect, vi } from 'vitest'
import axios, { AxiosError, AxiosHeaders } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { isExpectedApiError, reportApiErrors } from '@/monitoring/apiErrors'
import type { ErrorReporter } from '@/monitoring/apiErrors'
import { backendTraceTarget } from '@/monitoring/sentry'

// Aucun appel réseau : l'adaptateur axios est remplacé par une réponse simulée.
type Adapter = (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>

const response = (
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown = {},
): AxiosResponse => ({ data, status, statusText: '', headers: new AxiosHeaders(), config })

const failing =
  (status: number): Adapter =>
  (config) =>
    Promise.reject(
      new AxiosError(String(status), 'ERR_BAD_RESPONSE', config, null, response(config, status)),
    )

const setup = (adapter: Adapter) => {
  const reporter = {
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    addBreadcrumb: vi.fn(),
  } satisfies ErrorReporter
  const client = axios.create({ adapter })
  reportApiErrors(client, reporter)
  return { client, reporter }
}

describe('reportApiErrors', () => {
  it.each([429, 403, 404])('ne garde un %i qu’en breadcrumb, sans événement', async (status) => {
    const { client, reporter } = setup(failing(status))

    await expect(client.get('/competitions/2015')).rejects.toBeInstanceOf(AxiosError)

    expect(reporter.captureException).not.toHaveBeenCalled()
    expect(reporter.captureMessage).not.toHaveBeenCalled()
    expect(reporter.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'api', data: { status } }),
    )
  })

  it.each([500, 502, 503])('remonte un %i comme erreur', async (status) => {
    const { client, reporter } = setup(failing(status))

    await expect(client.get('/competitions/2015')).rejects.toBeInstanceOf(AxiosError)

    expect(reporter.captureException).toHaveBeenCalledOnce()
    expect(reporter.addBreadcrumb).not.toHaveBeenCalled()
  })

  it('remonte un échec réseau comme erreur', async () => {
    const { client, reporter } = setup((config) =>
      Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK', config)),
    )

    await expect(client.get('/competitions/2015')).rejects.toBeInstanceOf(AxiosError)

    expect(reporter.captureException).toHaveBeenCalledOnce()
  })

  it('remonte une réponse illisible sans bloquer la réponse', async () => {
    const { client, reporter } = setup((config) =>
      Promise.resolve(response(config, 200, '<html>Bad Gateway</html>')),
    )

    await expect(client.get('/competitions/2015')).resolves.toMatchObject({ status: 200 })

    expect(reporter.captureMessage).toHaveBeenCalledWith(
      'Réponse illisible du backend : GET /competitions/2015',
      'error',
    )
  })

  it('ne remonte rien pour une réponse JSON correcte', async () => {
    const { client, reporter } = setup((config) => Promise.resolve(response(config, 200)))

    await client.get('/competitions/2015')

    expect(reporter.captureException).not.toHaveBeenCalled()
    expect(reporter.captureMessage).not.toHaveBeenCalled()
  })
})

describe('isExpectedApiError', () => {
  it('ne reconnaît que les erreurs axios aux statuts attendus', () => {
    const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig
    const withStatus = (status: number) =>
      new AxiosError('', 'ERR_BAD_REQUEST', config, null, response(config, status))

    expect(isExpectedApiError(withStatus(429))).toBe(true)
    expect(isExpectedApiError(withStatus(502))).toBe(false)
    expect(isExpectedApiError(new Error('boom'))).toBe(false)
  })
})

describe('backendTraceTarget', () => {
  it('ne vise que l’URL du backend', () => {
    const target = backendTraceTarget('https://dashboard-foot-backend.onrender.com/api')

    expect(target.test('https://dashboard-foot-backend.onrender.com/api/competitions/2015')).toBe(
      true,
    )
    expect(target.test('https://dashboard-foot-backend.onrender.com/apidocs')).toBe(false)
    expect(target.test('https://crests.football-data.org/2015.png')).toBe(false)
    expect(
      target.test('https://evil.example/?https://dashboard-foot-backend.onrender.com/api'),
    ).toBe(false)
  })

  it('accepte le chemin relatif du développement', () => {
    expect(backendTraceTarget('/api').test('/api/competitions/2015')).toBe(true)
  })
})
