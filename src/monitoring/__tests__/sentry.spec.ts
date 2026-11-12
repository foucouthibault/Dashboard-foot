import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios, { AxiosError, AxiosHeaders } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import type { App } from 'vue'
import type { Router } from 'vue-router'
import type { ErrorEvent } from '@sentry/vue'
import * as Sentry from '@sentry/vue'
import { backendTraceTarget, initSentry, isNetlifyDeployHost } from '@/monitoring/sentry'

// Aucun envoi : le SDK est entièrement simulé.
vi.mock('@sentry/vue', () => ({
  init: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({ name: 'BrowserTracing' })),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
}))

const app = {} as App
const router = {} as Router
const options = {
  dsn: 'https://cle@exemple.ingest.sentry.io/1',
  hostname: 'dashboard-foot-frontend.netlify.app',
  apiBaseUrl: 'https://backend.example/api',
  environment: 'production',
  release: 'abc123',
}

type InitOptions = Parameters<typeof Sentry.init>[0] & object

const initOptions = (): InitOptions => vi.mocked(Sentry.init).mock.calls[0]![0] as InitOptions

const withStatus = (status: number): AxiosError => {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig
  return new AxiosError('', 'ERR_BAD_RESPONSE', config, null, {
    data: {},
    status,
    statusText: '',
    headers: new AxiosHeaders(),
    config,
  })
}

describe('initSentry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("n'initialise rien sans DSN", () => {
    const client = axios.create()

    expect(initSentry(app, router, client, { ...options, dsn: undefined })).toBe(false)
    expect(initSentry(app, router, client, { ...options, dsn: '' })).toBe(false)

    expect(Sentry.init).not.toHaveBeenCalled()
    expect(client.interceptors.response.handlers).toHaveLength(0)
  })

  it.each([
    '6af62d07fee0cab6fc109a03--dashboard-foot-frontend.netlify.app',
    'deploy-preview-145--dashboard-foot-frontend.netlify.app',
  ])("n'initialise rien sur l'adresse de déploiement %s", (hostname) => {
    const client = axios.create()

    expect(initSentry(app, router, client, { ...options, hostname })).toBe(false)

    expect(Sentry.init).not.toHaveBeenCalled()
    expect(client.interceptors.response.handlers).toHaveLength(0)
  })

  it("transmet l'environnement, la version et le routeur, sans données personnelles", () => {
    expect(initSentry(app, router, axios.create(), options)).toBe(true)

    expect(Sentry.browserTracingIntegration).toHaveBeenCalledWith({ router })
    expect(initOptions()).toMatchObject({
      app,
      dsn: options.dsn,
      environment: 'production',
      release: 'abc123',
      dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [] },
    })
    expect(initOptions()).not.toHaveProperty('replaysSessionSampleRate')
  })

  it('omet la version quand elle est vide', () => {
    initSentry(app, router, axios.create(), { ...options, release: '' })

    expect(initOptions().release).toBeUndefined()
  })

  it("limite les en-têtes de suivi à l'URL du backend", () => {
    initSentry(app, router, axios.create(), options)

    expect(initOptions().tracePropagationTargets).toEqual([backendTraceTarget(options.apiBaseUrl)])
  })

  it('branche le tri des erreurs sur le client API', () => {
    const client = axios.create()

    initSentry(app, router, client, options)

    expect(client.interceptors.response.handlers).toHaveLength(1)
  })

  it('écarte un 403, 404 ou 429 non rattrapé et garde les autres erreurs', () => {
    initSentry(app, router, axios.create(), options)
    const beforeSend = initOptions().beforeSend!
    const event: ErrorEvent = { type: undefined, message: 'erreur' }

    for (const status of [403, 404, 429]) {
      expect(beforeSend(event, { originalException: withStatus(status) })).toBeNull()
    }
    expect(beforeSend(event, { originalException: withStatus(502) })).toBe(event)
    expect(beforeSend(event, { originalException: new Error('boom') })).toBe(event)
  })
})

describe('backendTraceTarget', () => {
  it('ignore les barres obliques finales de la base', () => {
    expect(
      backendTraceTarget('https://backend.example/api//').test('https://backend.example/api/x'),
    ).toBe(true)
  })
})

describe('isNetlifyDeployHost', () => {
  it('ne reconnaît que les adresses de déploiement Netlify', () => {
    expect(isNetlifyDeployHost('6af62d07--dashboard-foot-frontend.netlify.app')).toBe(true)
    expect(isNetlifyDeployHost('deploy-preview-145--dashboard-foot-frontend.netlify.app')).toBe(
      true,
    )
    expect(isNetlifyDeployHost('dashboard-foot-frontend.netlify.app')).toBe(false)
    expect(isNetlifyDeployHost('localhost')).toBe(false)
    expect(isNetlifyDeployHost('a--b.example.com')).toBe(false)
  })
})
