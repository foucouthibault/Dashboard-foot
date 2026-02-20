# ⚽ Dashboard Foot

Un tableau de bord interactif affichant les standings, matchs et statistiques des grands championnats européens de football. **Projet pédagogique** pour l'apprentissage de **Vue 3**, **TypeScript**, et des bonnes pratiques de développement web.

![Vue 3](https://img.shields.io/badge/Vue-3-green?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2-purple?logo=vite)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🎯 À propos

Dashboard Foot est une application web construite avec Vue 3 qui permet de :

- 📊 Consulter les classements des 5 grands championnats européens (Ligue 1, Premier League, La Liga, Bundesliga, Serie A)
- 🏟️ Visualiser les matchs de la dernière journée
- 🔄 Voir les informations détaillées des équipes et compétitions
- 🎨 Interface responsive et moderne

Ce projet est conçu comme **exercice d'apprentissage** pour maîtriser :
- Vue 3 avec Composition API
- TypeScript et typage strict
- Gestion d'état avec Pinia
- Appels API avec Axios
- Tests avec Vitest et Playwright
- Bonnes pratiques de développement

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 16+ et npm

### Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/votre-username/dashboard-foot.git
   cd dashboard-foot
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Obtenir une clé API**
   - Aller sur [football-data.org](https://www.football-data.org/)
   - S'inscrire pour un compte gratuit
   - Copier votre clé API

4. **Configurer l'environnement**
   ```bash
   cp .env.example .env
   # Éditer .env et ajouter votre clé API
   VITE_API_KEY=votre_cle_api
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

   L'application sera disponible à http://localhost:5173

## 📚 Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Compile et minifie pour la production |
| `npm run preview` | Prévisualise la version de production |
| `npm run type-check` | Vérifie les types TypeScript |
| `npm run lint` | Linte et formate le code |
| `npm run format` | Formate le code avec Prettier |
| `npm run test:unit` | Lance les tests unitaires (Vitest) |
| `npm run test:e2e` | Lance les tests E2E (Playwright) |

## 🏗️ Architecture du Projet

```
src/
├── api/              # Appels API
│   ├── client.ts    # Configuration Axios
│   ├── competitions.ts
│   ├── standings.ts
│   └── matches.ts
├── components/       # Composants Vue réutilisables
│   ├── ChampionshipsSelector.vue
│   ├── StandingsComponent.vue
│   ├── MatchdayComponent.vue
│   └── CompetitionList.vue
├── router/          # Configuration Vue Router
├── stores/          # État global (Pinia)
├── views/           # Pages principales
└── App.vue          # Composant racine
```

## 🎨 Technologies Utilisées

- **Frontend Framework** : [Vue 3](https://vuejs.org/)
- **Language** : [TypeScript](https://www.typescriptlang.org/)
- **Build Tool** : [Vite](https://vitejs.dev/)
- **HTTP Client** : [Axios](https://axios-http.com/)
- **State Management** : [Pinia](https://pinia.vuejs.org/)
- **Routing** : [Vue Router](https://router.vuejs.org/)
- **Testing** : [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)
- **Linting** : [ESLint](https://eslint.org/)
- **Formatting** : [Prettier](https://prettier.io/)

## 📡 API Utilisée

Ce projet utilise l'API gratuite de [football-data.org](https://www.football-data.org/) :
- Endpoints : Compétitions, Standings, Matchs, Équipes
- Rate limit : 10 requêtes/minute (gratuit)
- Documentation : https://docs.football-data.org/

### Configuration du Proxy

Un proxy est configuré dans `vite.config.ts` pour contourner les problèmes CORS en développement :
```typescript
proxy: {
  '/api': {
    target: 'https://api.football-data.org',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '/v4'),
  }
}
```

## 🧪 Tests

### Tests Unitaires

```bash
npm run test:unit
```

### Tests E2E

```bash
# Installer les navigateurs (première exécution)
npx playwright install

# Lancer les tests
npm run test:e2e
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez lire [CONTRIBUTING.md](./CONTRIBUTING.md) pour les détails.

### Checklist Rapide
1. Forker le repository
2. Créer une branche feature (`git checkout -b feature/ma-feature`)
3. Committer vos changements
4. Pousser vers la branche (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

## 📝 Code of Conduct

Ce projet adhère à un [Code of Conduct](./CODE_OF_CONDUCT.md). En participant, vous acceptez d'adhérer à ses termes.

## 📄 Licence

Ce projet est sous licence [MIT](./LICENSE) - voir le fichier LICENSE pour plus de détails.

## 🎓 Points d'Apprentissage

Ce projet démontre :

✅ **Vue 3**
- Composition API avec `<script setup>`
- Composants réutilisables
- Lifecycle hooks
- Réactivité avancée

✅ **TypeScript**
- Types strictes et interfaces
- Génériques
- Enums et types utilitaires

✅ **Architecture**
- Séparation API/UI
- Gestion d'état avec Pinia
- Routing avec Vue Router
- Structure modulaire

✅ **Tooling**
- Build avec Vite
- Linting avec ESLint
- Formatage avec Prettier
- Tests avec Vitest

## 🐛 Signaler un Bug

Créez une [issue](https://github.com/votre-username/dashboard-foot/issues) avec une description détaillée, les étapes pour reproduire le bug, et l'environnement utilisé.

## 💡 Suggestions de Features

Nous accueillons les suggestions ! Créez une [issue](https://github.com/votre-username/dashboard-foot/issues) avec le label `enhancement`.

## 📞 Support

Pour toute question, ouvrez une issue ou consultez la [documentation](./CONTRIBUTING.md).

## 🙏 Remerciements

- [Vue.js](https://vuejs.org/) pour son incroyable framework
- [football-data.org](https://www.football-data.org/) pour l'API gratuite
- La communauté Vue et TypeScript

---

**Fait avec ❤️ pour l'apprentissage**
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
