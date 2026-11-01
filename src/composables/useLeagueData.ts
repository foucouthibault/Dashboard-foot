import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { Competition } from '@/types'

type KnownLeagueId =
  'Ligue1' | 'PremierLeague' | 'Liga' | 'Bundesliga' | 'SerieA' | 'Ligue2' | 'WorldCup'
type LeagueId = KnownLeagueId | 'default'

// Mapping des codes/IDs de compétition vers des identifiants de ligue standardisés
const LEAGUE_MAPPINGS: Record<string, KnownLeagueId> = {
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
  // Coupe du monde
  '2000': 'WorldCup',
  'WC': 'WorldCup',
  'FIFA World Cup': 'WorldCup',
}

// Les tables suivantes sont indexées par LeagueId : TypeScript refuse une ligue
// à laquelle il manquerait un nom, une icône, des couleurs ou un dégradé.

// Noms affichés pour chaque ligue (`default` ne sert que si la compétition n'a pas de nom)
const LEAGUE_NAMES: Record<LeagueId, string> = {
  Ligue1: 'Ligue 1 Uber Eats',
  PremierLeague: 'Premier League',
  Liga: 'La Liga',
  Bundesliga: 'Bundesliga',
  SerieA: 'Serie A',
  Ligue2: 'Ligue 2 BKT',
  WorldCup: 'Coupe du monde',
  default: 'Compétition',
}

// Icônes pour chaque ligue (emojis)
const LEAGUE_ICONS: Record<LeagueId, string> = {
  Ligue1: '🏆',
  PremierLeague: '⚽',
  Liga: '🔥',
  Bundesliga: '⭐',
  SerieA: '🛡️',
  Ligue2: '🥈',
  WorldCup: '🌍',
  default: '⚽',
}

// Couleurs principales pour chaque ligue
const LEAGUE_COLORS: Record<
  LeagueId,
  { bg: string; text: string; border?: string; accent?: string }
> = {
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
  WorldCup: {
    bg: '#7f1d1d',
    text: '#ffffff',
    border: '#d4af37',
    accent: '#d4af37',
  },
}

// Couleurs des dégradés pour chaque ligue
const LEAGUE_GRADIENTS: Record<LeagueId, { from: string; to: string }> = {
  default: {
    from: '#6b7280',
    to: '#9ca3af',
  },
  Ligue1: { from: '#1e3a8a', to: '#3b82f6' },
  PremierLeague: { from: '#b91c1c', to: '#ef4444' },
  Liga: { from: '#ea580c', to: '#f97316' },
  Bundesliga: { from: '#000000', to: '#1f2937' },
  SerieA: { from: '#166534', to: '#22c55e' },
  Ligue2: { from: '#2563eb', to: '#3b82f6' },
  WorldCup: { from: '#7f1d1d', to: '#b91c1c' },
}

// Détermine l'ID de la ligue : par l'id, puis le code, puis le nom de la compétition
// (une Map ignore les propriétés héritées d'Object, comme `constructor` ou `toString`).
const LEAGUE_BY_KEY = new Map(Object.entries(LEAGUE_MAPPINGS))

const getLeagueId = (competition: Competition): LeagueId => {
  const keys = [String(competition.id), competition.code, competition.name]
  for (const key of keys) {
    const leagueId = key ? LEAGUE_BY_KEY.get(key) : undefined
    if (leagueId) return leagueId
  }
  return 'default'
}

// Récupère les données de la ligue. Une compétition inconnue garde son propre nom.
const getLeagueData = (competition: Competition) => {
  const id = getLeagueId(competition)
  return {
    id,
    name: id === 'default' ? competition.name || LEAGUE_NAMES.default : LEAGUE_NAMES[id],
    icon: LEAGUE_ICONS[id],
    colors: LEAGUE_COLORS[id],
    gradient: LEAGUE_GRADIENTS[id],
    emblem: competition.emblem,
  }
}

// Accepte une valeur, une ref ou un getter : passer un getter (`() => props.competition`)
// garde les données à jour quand on navigue d'un championnat à l'autre sans remontage.
export const useLeagueData = (source: MaybeRefOrGetter<Competition>) => {
  const leagueId = computed(() => getLeagueId(toValue(source)))
  const leagueData = computed(() => getLeagueData(toValue(source)))

  return { leagueId, leagueData }
}

export { LEAGUE_MAPPINGS, LEAGUE_NAMES, LEAGUE_ICONS, LEAGUE_COLORS, LEAGUE_GRADIENTS }
