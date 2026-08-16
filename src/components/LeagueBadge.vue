<script setup lang="ts">
import { computed } from 'vue'
import type { Competition } from '@/types'

interface Props {
  competition: Competition
  season?: string
}

const props = defineProps<Props>()

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

// Couleurs principales pour chaque ligue
const LEAGUE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Ligue1: {
    bg: '#1e3a8a', // bleu-800
    text: '#ffffff',
    border: '#f59e0b', // yellow-500
  },
  PremierLeague: {
    bg: '#b91c1c', // red-700
    text: '#ffffff',
    border: '#fbbf24', // yellow-400
  },
  Liga: {
    bg: '#ea580c', // orange-600
    text: '#ffffff',
    border: '#ef4444', // red-500
  },
  Bundesliga: {
    bg: '#000000',
    text: '#fbbf24', // yellow-400
    border: '#fbbf24', // yellow-400
  },
  SerieA: {
    bg: '#166534', // green-800
    text: '#ffffff',
    border: '#3b82f6', // blue-400
  },
  Ligue2: {
    bg: '#2563eb', // blue-600
    text: '#ffffff',
    border: '#9ca3af', // silver-400
  },
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
    colors: LEAGUE_COLORS[id] || LEAGUE_COLORS.Ligue1,
  }
})
</script>

<template>
  <div
    class="league-badge"
    :style="{
      backgroundColor: leagueData.colors.bg,
      color: leagueData.colors.text,
      border: `2px solid ${leagueData.colors.border}`,
    }"
    role="region"
    :aria-label="`Championnat: ${leagueData.name}`"
  >
    <span class="league-icon" aria-hidden="true">{{ leagueData.icon }}</span>
    <span class="league-name">{{ leagueData.name }}</span>
    <span v-if="season" class="season-text">[{{ season }}]</span>
  </div>
</template>

<style scoped>
.league-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  min-width: fit-content;
}

.league-badge:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.league-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.league-name {
  font-size: 0.875rem;
  letter-spacing: 0.02em;
}

.season-text {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* Pour les très petits écrans */
@media (max-width: 640px) {
  .league-badge {
    padding: 0.5rem;
  }
  .league-name {
    font-size: 0.8rem;
  }
  .season-text {
    display: none;
  }
}

/* Cache le texte de saison sur les petits écrans */
@media (max-width: 768px) {
  .season-text {
    display: none;
  }
}
</style>
