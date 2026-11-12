# ⚽ Dashboard Foot

Tableau de bord des grands championnats européens de football : classements, meilleurs buteurs et résultats de la dernière journée, présentés comme un album de vignettes.

**▶ Démo : https://dashboard-foot-frontend.netlify.app** (le backend gratuit se met en veille : le premier chargement peut prendre jusqu'à 2 minutes)

[![Node.js CI](https://github.com/foucouthibault/Dashboard-foot/actions/workflows/node.js.yml/badge.svg)](https://github.com/foucouthibault/Dashboard-foot/actions/workflows/node.js.yml)
![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Ce dépôt contient le **frontend** (Vue 3 + TypeScript). Il s'appuie sur un backend Spring Boot, [Dashboard-foot-backend](https://github.com/foucouthibault/Dashboard-foot-backend), qui relaie et met en cache l'API [football-data.org](https://www.football-data.org/).

## Fonctionnalités

- 🏆 Ligue 1, Premier League, La Liga, Bundesliga, Serie A et Coupe du Monde
- 📊 Classement de la saison en cours et des deux saisons précédentes
- 🥇 Meilleurs buteurs par saison
- 🏟️ Résultats de la dernière journée jouée
- ♿ Sélecteur de saison utilisable au clavier (flèches, Début, Fin), interface responsive

## Architecture

```mermaid
flowchart LR
    A["Frontend Vue 3<br/>(Pinia : cache 5 à 30 min)"] -- "/api/*" --> B["Backend Spring Boot<br/>(cache Caffeine + limite de débit)"]
    B -- "X-Auth-Token" --> C["football-data.org v4"]
```

Le frontend n'appelle jamais football-data.org directement : il interroge `/api`, que le serveur Vite relaie en développement vers le backend (`localhost:8080`).

### Choix techniques

- **Un backend proxy plutôt qu'un appel direct** : la clé d'API reste côté serveur, et on évite les problèmes de CORS.
- **Un quota tenu côté serveur** : l'offre gratuite de football-data.org limite à 10 requêtes par minute. Le backend applique cette limite à tous les visiteurs réunis (fenêtre glissante) et répond `429` avec `Retry-After` plutôt que de se faire bloquer par l'API.
- **Un cache adapté à chaque type de donnée** : 60 s pour les compétitions et les matchs, 5 min pour la saison en cours, 24 h pour les saisons terminées, qui ne changent plus.
- **Un cache aussi dans le navigateur** : les stores Pinia gardent les réponses par compétition et par saison, pour ne pas refaire de requête à chaque changement d'onglet.
- **Une interface qui résiste aux formats variés de l'API** : les classements `HOME` et `AWAY` sont écartés, et les compétitions à poules (Coupe du Monde) sont mises à plat.

## Démarrage rapide

### Prérequis

- Node.js 22+
- Le [backend](https://github.com/foucouthibault/Dashboard-foot-backend) (Java 25) lancé sur `http://localhost:8080`, avec une clé football-data.org ([inscription gratuite](https://www.football-data.org/client/register))

### Installation

```bash
# 1. Lancer le backend (dans un autre terminal)
git clone https://github.com/foucouthibault/Dashboard-foot-backend.git
cd Dashboard-foot-backend
FOOTBALL_DATA_API_TOKEN=votre_cle ./mvnw spring-boot:run

# 2. Lancer le frontend
git clone https://github.com/foucouthibault/Dashboard-foot.git
cd Dashboard-foot
npm install
npm run dev
```

L'application est disponible sur http://localhost:5173.

Aucune variable d'environnement n'est nécessaire côté frontend en développement. Voir [`.env.example`](./.env.example) pour pointer vers un backend hébergé ailleurs.

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Vérification des types + build de production |
| `npm run preview` | Sert le build de production en local |
| `npm test` | Tests unitaires (une passe) |
| `npm run test:unit` | Tests unitaires en mode watch |
| `npm run test:e2e` | Tests end-to-end (Playwright) |
| `npm run lint` | ESLint avec correction automatique |
| `npm run format` | Formatage Prettier |
| `npm run api:sync` | Récupère le contrat du backend (`openapi.json`) et régénère ses types |
| `npm run api:types` | Régénère `src/types/api.generated.ts` à partir de `openapi.json` |

## Déploiement

Le frontend est en ligne sur **https://dashboard-foot-frontend.netlify.app** et appelle le backend déployé sur Render (https://dashboard-foot-backend.onrender.com).

- **Hébergeur : [Netlify](https://www.netlify.com), offre gratuite.** Choisi plutôt que Vercel parce que toute la configuration (build, variable d'API, redirection des routes, en-têtes) tient dans un fichier versionné, [`netlify.toml`](./netlify.toml), sans réglage à refaire dans l'interface.
- **Build :** `npm run build` (type-check + build), publié depuis `dist/`, sous Node 22.
- **API :** `VITE_API_BASE_URL` vaut `https://dashboard-foot-backend.onrender.com/api`. Elle est lue au build et n'a rien de secret (elle est visible dans le code envoyé au navigateur).
- **Routes :** le routeur est en `createWebHistory`. Une redirection `/* → /index.html` (statut `200`) permet de recharger directement `/championship/2015` sans 404 ; les fichiers existants restent servis tels quels.
- **CORS :** l'origine `https://dashboard-foot-frontend.netlify.app` doit figurer dans la variable `APP_CORS_ALLOWED_ORIGINS` du backend sur Render. Les aperçus de PR de Netlify ont une autre origine (`deploy-preview-<n>--...`) : leurs appels API sont bloqués tant qu'elle n'est pas ajoutée.
- **Suivi des erreurs : [Sentry](https://sentry.io), offre gratuite.** Activé seulement si `VITE_SENTRY_DSN` est renseigné (dans `netlify.toml` pour la production ; le DSN d'un frontend n'est pas un secret). Vide par défaut : rien n'est envoyé en développement, en CI ni pendant les tests. Sentry reste aussi désactivé sur les adresses propres à un déploiement (`<id>--dashboard-foot-frontend.netlify.app`, `deploy-preview-<n>--…`) : leur origine n'est pas autorisée par le CORS du backend, tous les appels y échoueraient en « Network Error », et le robot de Netlify en ouvre une à chaque déploiement. Chaque événement porte la route, l'environnement (`CONTEXT` de Netlify : `production`, `deploy-preview`…) et la version (hash du commit, `COMMIT_REF`).
  - **Ce qui remonte :** erreurs JavaScript et Vue non gérées, réponses `5xx` du backend, échecs réseau et réponses illisibles. Les `429` (quota), `403` (saison hors offre) et `404` (compétition inconnue) sont attendus : ils ne restent qu'en contexte (breadcrumb) des erreurs suivantes, sans créer d'événement.
  - **Suivi des appels :** les en-têtes `sentry-trace` et `baggage` ne partent que vers l'URL du backend (`tracePropagationTargets`), qui les autorise dans sa configuration CORS. Une erreur du frontend est ainsi reliée à la requête du backend.
  - **Vie privée :** ni adresse IP (`dataCollection.userInfo: false`), ni cookie, ni en-tête, ni session replay. Aucune donnée personnelle n'étant collectée, aucune bannière de consentement n'est nécessaire.
  - **Sourcemaps :** non générées au build (réglage par défaut de Vite) : aucun `.map` n'est publié, et les piles d'appels dans Sentry restent minifiées.
- **Redéployer :** automatique à chaque commit sur `main`. À la main : *Deploys → Trigger deploy* dans le tableau de bord Netlify.

## Contrat avec le backend

Le backend publie son contrat en OpenAPI ([`openapi.json`](https://github.com/foucouthibault/Dashboard-foot-backend/blob/main/openapi.json), Swagger UI sur `/swagger-ui.html`). Une copie est versionnée ici, et `openapi-typescript` en tire `src/types/api.generated.ts`.

Les composants utilisent toujours les types écrits à la main de `src/types/index.ts`. `src/types/__tests__/contrat.spec.ts` vérifie à la compilation que chaque réponse du backend satisfait ces types. En CI, le `openapi.json` de la branche `main` du backend est téléchargé avant le type-check : un champ retiré, renommé ou dont le type change côté backend fait échouer la CI du frontend. Un changement compatible passe, avec un avertissement invitant à lancer `npm run api:sync`.

## Tests

- **Unitaires** (Vitest) : logique des stores Pinia (filtrage des classements, cache par saison, gestion des erreurs).
- **Contrat** (`contrat.spec.ts`) : compatibilité des types avec `openapi.json`, vérifiée par `npm run type-check`.
- **End-to-end** (Playwright) : parcours accueil → championnat et affichage des erreurs. L'API est simulée avec `page.route`, donc les tests ne dépendent ni du backend ni du quota.

```bash
npm test
npx playwright install chromium   # première exécution uniquement
npm run test:e2e
```

La CI GitHub Actions lance le lint, les tests unitaires, la vérification des types, le build et les tests E2E à chaque push et chaque pull request.

## Structure du projet

```
src/
├── api/            # Appels HTTP (Axios) : compétitions, classements, matchs, buteurs
├── components/     # Composants d'affichage (classement, buteurs, journée, bannières)
├── composables/    # Logique réutilisable (identité visuelle des ligues)
├── constants/      # Images de remplacement
├── router/         # Routes : accueil, championnat
├── stores/         # Stores Pinia avec cache et tests (__tests__)
├── types/          # Types des réponses de l'API, et types générés depuis openapi.json
└── views/          # Pages : accueil, championnat
e2e/                # Tests Playwright
```

## Stack

[Vue 3](https://vuejs.org/) (Composition API) · [TypeScript](https://www.typescriptlang.org/) · [Vite](https://vite.dev/) · [Pinia](https://pinia.vuejs.org/) · [Vue Router](https://router.vuejs.org/) · [Axios](https://axios-http.com/) · [Vitest](https://vitest.dev/) · [Playwright](https://playwright.dev/) · ESLint · Prettier

## Licence

[MIT](./LICENSE)
