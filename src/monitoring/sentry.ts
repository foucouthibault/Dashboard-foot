import * as Sentry from '@sentry/vue'
import type { App } from 'vue'
import type { Router } from 'vue-router'
import type { AxiosInstance } from 'axios'
import { isExpectedApiError, reportApiErrors } from './apiErrors'

/** Échappe une chaîne pour l'utiliser telle quelle dans une expression régulière. */
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Cible des en-têtes `sentry-trace` et `baggage` : l'URL du backend et rien d'autre. Sentry
 * compare l'URL complète, ou son chemin pour un appel de même origine (`/api` en développement).
 */
export function backendTraceTarget(apiBaseUrl: string): RegExp {
  let base = apiBaseUrl
  while (base.endsWith('/')) base = base.slice(0, -1)
  return new RegExp(`^${escapeRegExp(base)}(/|$)`)
}

interface SentryOptions {
  dsn: string | undefined
  apiBaseUrl: string
  environment: string
  release: string | undefined
}

/**
 * Initialise Sentry si un DSN est fourni. Sans DSN (développement, CI, tests), rien n'est
 * initialisé et rien n'est envoyé. Vie privée : ni adresse IP (`dataCollection.userInfo: false`),
 * ni session replay, ni cookie.
 */
export function initSentry(
  app: App,
  router: Router,
  client: AxiosInstance,
  { dsn, apiBaseUrl, environment, release }: SentryOptions,
): boolean {
  if (!dsn) return false

  Sentry.init({
    app,
    dsn,
    environment,
    release: release || undefined,
    // Vie privée (remplace sendDefaultPii depuis le SDK 11) : userInfo à false demande à Sentry
    // de ne pas déduire l'adresse IP (infer_ip: never) ; ni cookie, ni en-tête, ni corps.
    dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [] },
    // Le nom de la route (ex. « championship ») accompagne chaque événement.
    integrations: [Sentry.browserTracingIntegration({ router })],
    tracesSampleRate: 0.1,
    tracePropagationTargets: [backendTraceTarget(apiBaseUrl)],
    // Filet de sécurité : un 403/404/429 non rattrapé ne crée pas d'événement non plus.
    beforeSend: (event, hint) => (isExpectedApiError(hint.originalException) ? null : event),
  })

  reportApiErrors(client, Sentry)
  return true
}
