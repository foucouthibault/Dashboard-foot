# CLAUDE.md — Dashboard Foot (frontend)

Application Vue 3 + TypeScript + Pinia + Vite qui affiche compétitions, classements,
dernière journée et buteurs. Toutes les données passent par le backend Spring
(dépôt `foucouthibault/Dashboard-foot-backend`, cloné à côté dans
`../Dashboard-foot-backend`), jamais directement par football-data.org.

## Commandes

```bash
npm ci
npm run dev             # http://localhost:5173, /api relayé vers http://localhost:8080
npm run lint:check      # ESLint sans correction (ce que lance la CI)
npm run type-check      # vue-tsc
npm test                # tests unitaires Vitest
npm run test:coverage   # idem + coverage/lcov.info (lu par Sonar)
npm run build           # type-check + build de production
npx playwright test --project=chromium   # tests E2E (lance lui-même le serveur)
```

Avant une PR, lancer au minimum : `lint:check`, `test`, `build`, et les tests E2E si un
écran ou un parcours change.

## Architecture

- `src/api/` : un fichier par route du backend, tous via `apiClient` (`client.ts`,
  base `VITE_API_BASE_URL` ou `/api` par défaut). Ne pas créer d'autre instance axios.
- `src/stores/` : un store Pinia par type de donnée (`competitions`, `standings`,
  `matches`, `scorers`). Les stores gèrent le chargement, les erreurs et leur propre
  cache, indexé par clé (compétition, saison et, pour les buteurs, `limit`).
- `src/composables/useLeagueData.ts` : apparence par ligue (nom, icône, couleurs). Prend
  un getter (`() => props.competition`) pour rester réactif lors d'une navigation sans
  remontage du composant.
- `src/views/` : `HomeView` (liste des championnats) et `ChampionshipView` (route
  `/championship/:id`, sélecteur de saison).
- `src/types/index.ts` : types des réponses du backend. Elles reprennent la structure de
  football-data.org, réduite aux champs déclarés ici (records du paquet `model` côté
  backend) : un champ absent de ces types n'est pas renvoyé par le backend.
- Routeur en `createWebHistory` : un hébergeur doit rediriger toutes les routes vers
  `index.html`.

## Invariants à ne pas casser

- **Quota de 10 appels/minute côté football-data.org, partagé par tous les visiteurs.**
  Le backend met en cache et renvoie `429` + `Retry-After` quand le quota est atteint.
  Côté frontend : ne pas multiplier les appels, passer par le cache des stores plutôt
  que rappeler `@/api/*` directement depuis un composant. Un changement de `limit` des
  buteurs appelle le backend, mais celui-ci le sert depuis son cache sans consommer de
  quota : ne pas casser ce fonctionnement en ajoutant de nouveaux paramètres amont.
- **Les saisons proposées sont calculées à partir de l'année civile**, comme
  `isHistoricalSeason` dans le backend. Changer l'un implique de vérifier l'autre.
- **Les tests n'appellent jamais de vraie API** : Vitest mocke les modules `@/api/*`
  (`vi.mock`), Playwright simule les réponses avec `page.route`. Ils doivent tourner sans
  backend ni clé.
- **Aucune clé d'API dans le frontend** : elle n'existe que côté backend.

## Contrat avec le backend

`GET /api/competitions/{id}`, `/standings?season=`, `/matches`, `/scorers?limit=&season=`.
Ajouter ou modifier un paramètre demande une branche dans chaque dépôt et deux PR qui se
référencent ; mettre à jour `src/types/index.ts` en même temps. Il en va de même pour lire
un nouveau champ de football-data.org : il faut l'ajouter au record correspondant du
backend, sinon il n'arrive pas jusqu'au frontend. Les erreurs du backend ont la forme
`{"error": "…"}` ; une erreur de football-data.org est relayée avec son statut et son corps.

## Travailler à partir d'une issue

- Les tâches sont des issues GitHub (`gh issue list`), une par PR, avec des critères de fin.
  Étiquettes : `qualite`, `deploiement`, `tests`, `refacto`, `outillage`,
  `fonctionnalite` (optionnel), `vitrine` (présentation du projet, en pause).
- Ordre de traitement : les issues sont rangées dans des jalons numérotés
  (« 1 – Filet de sécurité », « 2 – Backend propre », « 3 – Mise en ligne »…), à traiter
  dans l'ordre. La prochaine tâche est une issue ouverte du plus petit jalon qui n'est
  bloquée par aucune autre : `gh issue list --milestone "<titre>"`. Les jalons « optionnel »
  et « en pause » ne se traitent que sur demande.
- Avant de commencer : lire l'issue (`gh issue view <n>`) et vérifier qu'aucune issue ne la
  bloque encore (liens « bloqué par » de GitHub, y compris vers l'autre dépôt :
  `gh api repos/foucouthibault/<dépôt>/issues/<n>/dependencies/blocked_by`).
- La PR reprend les critères de fin cochés et contient `Closes #<n>` pour fermer l'issue
  au merge. Un critère non rempli est signalé dans la PR, pas coché.

## Conventions

- Code, commentaires, textes affichés, noms de tests (`it('ne garde que …')`), commits et
  PR en **français**.
- Commits à l'impératif présent, sans préfixe : « Ajoute … », « Corrige … ».
- Jamais de push sur `main` : une branche (`feat/…`, `fix/…`, `chore/…`, `docs/…`) et une PR.
- Prettier : sans point-virgule, guillemets simples, 100 colonnes ; indentation 2 espaces.
- Composition API avec `<script setup lang="ts">` ; imports via l'alias `@/`.
- Tests unitaires dans `__tests__/*.spec.ts` à côté du code testé ; tests E2E dans `e2e/`.
- Accessibilité : les contrôles interactifs (ex. sélecteur de saison) ont un rôle ARIA,
  un `aria-label` et sont utilisables au clavier.

## CI et qualité

- `.github/workflows/node.js.yml` : job `build` (lint, tests avec couverture, build,
  analyse SonarQube Cloud) et job `e2e` (Playwright sur Chromium).
- Projet Sonar `foucouthibault_Dashboard-foot`, quality gate bloquant sur la PR.
  Résultats lisibles sans token (projet public) :
  `curl "https://sonarcloud.io/api/issues/search?componentKeys=foucouthibault_Dashboard-foot&resolved=false"`
  (ajouter `&pullRequest=<n>` pour une PR).
- Toute nouvelle action GitHub tierce est épinglée sur un SHA complet avec la version
  en commentaire (règle Sonar S7637), même si les workflows existants utilisent encore
  des tags.
- Vérifier la CI d'une PR avec `gh pr checks <n>`.

## Ne jamais committer

- `.env` ou toute clé ; `dist/`, `coverage/`, `test-results/`, `playwright-report/`.
- `.mcp.json`, `.claude/settings.local.json`.
