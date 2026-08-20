import { computed } from 'vue'
import type { Competition } from '@/types'

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
  default: 'Compétition',
}

// Icônes pour chaque ligue (emojis)
const LEAGUE_ICONS: Record<string, string> = {
  Ligue1: '🏆',
  PremierLeague: '⚽',
  Liga: '🔥',
  Bundesliga: '⭐',
  SerieA: '🛡️',
  Ligue2: '🥈',
  default: '⚽',
}

// Couleurs principales pour chaque ligue
const LEAGUE_COLORS: Record<string, { bg: string; text: string; border?: string; accent?: string }> = {
  default: {
    bg: '#6b7280',
    text: '#ffffff',
    border: '#9ca3af',
    accent: '#9ca3af',
  },
  Ligue1: {
    bg: '#1e3a8a',
    text: '#ffffff',
    border: '#f59e0b',
    accent: '#f59e0b',
  },
  PremierLeague: {
    bg: '#b91c1c',
    text: '#ffffff',
    border: '#fbbf24',
    accent: '#fbbf24',
  },
  Liga: {
    bg: '#ea580c',
    text: '#ffffff',
    border: '#ef4444',
    accent: '#ef4444',
  },
  Bundesliga: {
    bg: '#000000',
    text: '#fbbf24',
    border: '#fbbf24',
    accent: '#fbbf24',
  },
  SerieA: {
    bg: '#166534',
    text: '#ffffff',
    border: '#3b82f6',
    accent: '#3b82f6',
  },
  Ligue2: {
    bg: '#2563eb',
    text: '#ffffff',
    border: '#9ca3af',
    accent: '#9ca3af',
  },
}

// Couleurs des dégradés pour chaque ligue - couleurs authentiques et plus profondes
const LEAGUE_GRADIENTS: Record<string, { from: string; to: string }> = {
  default: {
    from: '#6b7280',
    to: '#9ca3af',
  },
  Ligue1: { from: '#002257', to: '#0055a4' },  // Bleu nuit vers bleu royal (Uber Eats)
  PremierLeague: { from: '#38003c', to: '#e50914' },  // Pourpre vers rouge (Barclays)
  Liga: { from: '#c60b1e', to: '#ffbf00' },  // Rouge vers or (Santander)
  Bundesliga: { from: '#000000', to: '#d20515' },  // Noir vers rouge
  SerieA: { from: '#009246', to: '#006341' },  // Vert italien foncé vers vert moyen
  Ligue2: { from: '#003087', to: '#2563eb' },  // Bleu marine vers bleu BKT
}

// Détermine l'ID de la ligue à partir de l'ID ou du nom de la compétition
const getLeagueId = (competition: Competition): string => {
  const id = String(competition.id)
  const name = competition.name || ''
  return LEAGUE_MAPPINGS[id] || LEAGUE_MAPPINGS[name] || 'default'
}

// Récupère les données de la ligue
const getLeagueData = (competition: Competition) => {
  const id = getLeagueId(competition)
  return {
    id,
    name: LEAGUE_NAMES[id] || competition.name || LEAGUE_NAMES.default,
    icon: LEAGUE_ICONS[id] || LEAGUE_ICONS.default,
    colors: LEAGUE_COLORS[id] || LEAGUE_COLORS.default,
    gradient: LEAGUE_GRADIENTS[id] || LEAGUE_GRADIENTS.default,
    emblem: competition.emblem,
  }
}

export const useLeagueData = (competition: Competition) => {
  const leagueId = computed(() => getLeagueId(competition))
  const leagueData = computed(() => getLeagueData(competition))

  return { leagueId, leagueData }
}

export { LEAGUE_MAPPINGS, LEAGUE_NAMES, LEAGUE_ICONS, LEAGUE_COLORS, LEAGUE_GRADIENTS }
