<script setup lang="ts">
import { computed } from 'vue'
import type { Competition } from '@/types'

interface Props {
  competition: Competition
  season?: string
}

interface Emits {
  (e: 'back'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Mapping des codes/IDs de compétition vers des identifiants de ligue standardisés
const LEAGUE_MAPPINGS: Record<string, string> = {
  // Ligue 1
  '2015': 'Ligue1',
  'FL1': 'Ligue1',
  'Ligue 1': 'Ligue1',
  'Ligue1': 'Ligue1',
  // Premier League
  '2021': 'PremierLeague',
  'PL': 'PremierLeague',
  'Premier League': 'PremierLeague',
  'PremierLeague': 'PremierLeague',
  // Liga
  '2014': 'Liga',
  'PD': 'Liga',
  'La Liga': 'Liga',
  'Liga': 'Liga',
  // Bundesliga
  '2002': 'Bundesliga',
  'BL1': 'Bundesliga',
  'Bundesliga': 'Bundesliga',
  // Serie A
  '2019': 'SerieA',
  'SA': 'SerieA',
  'Serie A': 'SerieA',
  'SerieA': 'SerieA',
  // Ligue 2
  '2016': 'Ligue2',
  'FL2': 'Ligue2',
  'Ligue 2': 'Ligue2',
}

// Noms affichés pour chaque ligue
const LEAGUE_NAMES: Record<string, string> = {
  Ligue1: 'Ligue 1 Uber Eats',
  PremierLeague: 'Premier League',
  Liga: 'La Liga',
  Bundesliga: 'Bundesliga',
  SerieA: 'Serie A',
  Ligue2: 'Ligue 2 BKT',
}

// Icônes pour chaque ligue (emojis)
const LEAGUE_ICONS: Record<string, string> = {
  Ligue1: '🏆',
  PremierLeague: '⚽',
  Liga: '🔥',
  Bundesliga: '⭐',
  SerieA: '🛡️',
  Ligue2: '🥈',
}

// Couleurs des dégradés pour chaque ligue
const LEAGUE_GRADIENTS: Record<string, { from: string; to: string }> = {
  Ligue1: { from: '#1e3a8a', to: '#3b82f6' }, // Bleu marine → Bleu
  PremierLeague: { from: '#b91c1c', to: '#ef4444' }, // Rouge → Rouge clair
  Liga: { from: '#ea580c', to: '#f97316' }, // Orange → Orange clair
  Bundesliga: { from: '#000000', to: '#1f2937' }, // Noir → Gris foncé
  SerieA: { from: '#166534', to: '#22c55e' }, // Vert foncé → Vert clair
  Ligue2: { from: '#2563eb', to: '#3b82f6' }, // Bleu → Bleu clair
}

// Détermine l'ID de la ligue à partir de l'ID ou du nom de la compétition
const leagueId = computed<string>(() => {
  const id = String(props.competition.id)
  return LEAGUE_MAPPINGS[id] || LEAGUE_MAPPINGS[props.competition.name] || 'default'
})

// Récupère les données de la ligue
const leagueData = computed(() => {
  const id = leagueId.value
  return {
    id,
    name: LEAGUE_NAMES[id] || props.competition.name,
    icon: LEAGUE_ICONS[id] || '⚽',
    gradient: LEAGUE_GRADIENTS[id] || LEAGUE_GRADIENTS.Ligue1,
    emblem: props.competition.emblem,
  }
})
</script>

<template>
  <div
    class="league-banner"
    :style="{
      background: `linear-gradient(135deg, ${leagueData.gradient.from}, ${leagueData.gradient.to})`,
    }"
    role="banner"
    :aria-label="`Bannière du championnat: ${leagueData.name}`"
  >
    <!-- Bouton de retour intégré -->
    <button class="banner-back-btn" @click="emit('back')" aria-label="Retour à tous les championnats">
      <span class="banner-back-icon">←</span>
    </button>

    <!-- Groupe logo + texte (centré) -->
    <div class="banner-center-group">
      <!-- Logo ou icône -->
      <div class="banner-logo">
        <img
          v-if="leagueData.emblem"
          :src="leagueData.emblem"
          :alt="`Logo ${leagueData.name}`"
          class="logo-image"
        />
        <span v-else class="logo-fallback">{{ leagueData.icon }}</span>
      </div>

      <!-- Contenu texte -->
      <div class="banner-content">
        <h1 class="banner-title">{{ leagueData.name }}</h1>
        <p v-if="season" class="banner-season">Saison {{ season }}</p>
      </div>
    </div>

    <!-- Décoration -->
    <div class="banner-decoration">
      <span class="decoration-icon">{{ leagueData.icon }}</span>
    </div>
  </div>
</template>



<style scoped>
.league-banner {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1;
  width: 100%;
  box-sizing: border-box;
}

/* Motif de terrain de foot en arrière-plan */
.league-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.05) 10px,
      rgba(255, 255, 255, 0.05) 20px
    );
  opacity: 0.3;
  pointer-events: none;
}

.banner-back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 40px;
  min-width: 40px;
  height: 40px;
  min-height: 40px;
  color: white;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  justify-self: start;
  text-align: center;
}

.banner-back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  transform: scale(1.05);
}

.banner-back-icon {
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
  transform: translateY(-1px);
}

.banner-logo {
  flex-shrink: 0;
}

.logo-image {
  height: 40px;
  width: auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.logo-fallback {
  font-size: 2rem;
}

.banner-center-group {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  justify-content: center;
  grid-column: 2;
}

.banner-content {
  text-align: left;
}

.banner-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  font-family: 'Inter', sans-serif;
}

.banner-season {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 400;
}

.banner-decoration {
  opacity: 0.8;
  justify-self: end;
}

.decoration-icon {
  font-size: 2rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Responsive */
@media (max-width: 768px) {
  .league-banner {
    padding: 1rem;
    gap: 0.75rem;
    grid-template-columns: auto 1fr;
  }

  .banner-back-btn {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }

  .banner-center-group {
    gap: 1rem;
    grid-column: 1 / -1;
    justify-content: flex-start;
  }

  .banner-decoration {
    display: none;
  }

  .banner-title {
    font-size: 1.25rem;
  }

  .banner-season {
    font-size: 0.75rem;
  }

  .logo-image {
    height: 32px;
  }

  .logo-fallback {
    font-size: 1.5rem;
  }

  .banner-content {
    text-align: left;
  }
}

@media (max-width: 480px) {
  .league-banner {
    padding: 0.75rem;
    grid-template-columns: auto 1fr;
  }

  .banner-title {
    font-size: 1rem;
  }

  .banner-season {
    display: none;
  }

  .banner-center-group {
    gap: 0.5rem;
  }

  .logo-container {
    width: 40px;
    height: 40px;
  }

  .logo-image {
    height: 28px;
  }

  .logo-fallback {
    font-size: 1.25rem;
  }

  .banner-back-btn {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
}
</style>
