import { isAxiosError } from 'axios'
import type { AxiosInstance } from 'axios'

/**
 * Statuts attendus du backend : quota atteint (`429`), saison hors offre (`403`), compétition
 * inconnue (`404`). Ils sont gérés par l'interface et ne sont gardés qu'en contexte : un pic de
 * `429` ne doit ni déclencher d'alerte ni épuiser le quota mensuel de Sentry.
 */
export const EXPECTED_STATUSES: ReadonlySet<number> = new Set([403, 404, 429])

/** Une erreur d'appel au backend attendue (voir `EXPECTED_STATUSES`). */
export function isExpectedApiError(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  const status = error.response?.status
  return status !== undefined && EXPECTED_STATUSES.has(status)
}

/** Ce dont l'intercepteur a besoin de Sentry, injecté pour pouvoir le tester sans réseau. */
export interface ErrorReporter {
  captureException(error: unknown): unknown
  captureMessage(message: string, level: 'error'): unknown
  addBreadcrumb(breadcrumb: {
    category: string
    level: 'warning'
    message: string
    data: Record<string, unknown>
  }): void
}

/**
 * Remonte les échecs d'appel au backend, que les stores rattrapent (et que Sentry ne verrait
 * donc pas) : `5xx`, échecs réseau et réponses illisibles deviennent des événements ; les
 * statuts attendus ne laissent qu'un breadcrumb. L'intercepteur ne modifie ni ne relance
 * aucun appel.
 */
export function reportApiErrors(client: AxiosInstance, reporter: ErrorReporter): void {
  client.interceptors.response.use(
    (response) => {
      // Le backend ne renvoie que du JSON : une chaîne signale une réponse qu'axios n'a pas
      // pu lire (page HTML d'un proxy, corps tronqué...).
      if (typeof response.data === 'string' && response.data !== '') {
        reporter.captureMessage(
          `Réponse illisible du backend : ${response.config.method?.toUpperCase()} ${response.config.url}`,
          'error',
        )
      }
      return response
    },
    (error: unknown) => {
      if (isExpectedApiError(error) && isAxiosError(error)) {
        reporter.addBreadcrumb({
          category: 'api',
          level: 'warning',
          message: `${error.response?.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          data: { status: error.response?.status },
        })
      } else {
        reporter.captureException(error)
      }
      return Promise.reject(error)
    },
  )
}
