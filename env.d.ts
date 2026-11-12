/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** DSN Sentry ; vide par défaut, Sentry est alors désactivé. */
  readonly VITE_SENTRY_DSN?: string
  /** Fixé par vite.config.ts depuis `CONTEXT` de Netlify (`development` hors Netlify). */
  readonly VITE_SENTRY_ENVIRONMENT: string
  /** Fixé par vite.config.ts depuis `COMMIT_REF` de Netlify (vide hors Netlify). */
  readonly VITE_SENTRY_RELEASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
