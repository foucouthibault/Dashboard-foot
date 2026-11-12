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

/**
 * Adresse propre à un déploiement Netlify (`<id>--site.netlify.app`, `deploy-preview-<n>--…`),
 * qui sert les mêmes fichiers que le site. Son origine n'est pas autorisée par le CORS du
 * backend : tous les appels y échouent en « Network Error » (le navigateur masque le `403`).
 * Le robot de Netlify en charge une à chaque déploiement : on n'y active pas Sentry.
 */
export function isNetlifyDeployHost(hostname: string): boolean {
  return hostname.endsWith('.netlify.app') && hostname.includes('--')
}

interface SentryOptions {
  dsn: string | undefined
  /** Nom d'hôte de la page (`window.location.hostname`). */
  hostname: string
  apiBaseUrl: string
  environment: string
  release: string | undefined
}

/**
 * Initialise Sentry si un DSN est fourni. Sans DSN (développement, CI, tests), ou sur une adresse
 * de déploiement Netlify (voir `isNetlifyDeployHost`), rien n'est initialisé et rien n'est envoyé. Vie privée : ni adresse IP (`dataCollection.userInfo: false`),
 * ni session replay, ni cookie.
 */
export function initSentry(
  app: App,
  router: Router,
  client: AxiosInstance,
  { dsn, hostname, apiBaseUrl, environment, release }: SentryOptions,
): boolean {
  if (!dsn || isNetlifyDeployHost(hostname)) return false

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
