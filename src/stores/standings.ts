import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCompetitionStandings } from '@/api/standings'
import type { StandingRow } from '@/types'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  rows: StandingRow[]
  fetchedAt: number
}

export const useStandingsStore = defineStore('standings', () => {
  const cache = ref<Record<string, CacheEntry>>({})
  const loading = ref<Record<string, boolean>>({})
  const error = ref<Record<string, string | null>>({})

  // Génère une clé de cache unique basée sur competitionId et season
  const getCacheKey = (competitionId: string, season?: string): string => {
    return season ? `${competitionId}-${season}` : competitionId
  }

  const isStale = (competitionId: string, season?: string): boolean => {
    const key = getCacheKey(competitionId, season)
    const entry = cache.value[key]
    if (!entry) return true
    return Date.now() - entry.fetchedAt > CACHE_TTL
  }

  const fetchStandings = async (competitionId: string, season?: string): Promise<void> => {
    const cacheKey = getCacheKey(competitionId, season)
    if (!isStale(competitionId, season)) return

    loading.value[cacheKey] = true
    error.value[cacheKey] = null

    try {
      const data = await getCompetitionStandings(competitionId, season)
      // L'API renvoie un tableau TOTAL, HOME et AWAY par groupe : on ne garde que TOTAL
      // pour éviter de dupliquer chaque équipe. Pour les compétitions avec groupes
      // (comme la Coupe du Monde), on aplatit ensuite tous les groupes TOTAL.
      const totalGroups = data.standings?.filter(group => group.type === 'TOTAL') ?? []
      if ((data.standings?.length ?? 0) > 0 && totalGroups.length === 0) {
        // La compétition a bien des groupes, mais aucun n'est de type TOTAL : format
        // API inattendu plutôt qu'un classement légitimement vide.
        console.error('Réponse standings inattendue : aucun groupe TOTAL trouvé', data.standings)
      }
      const allRows = totalGroups.flatMap(group => group.table)
      cache.value[cacheKey] = {
        rows: allRows,
        fetchedAt: Date.now(),
      }
    } catch (err) {
      console.error('Erreur standings', err)
      error.value[cacheKey] = 'Impossible de charger le classement'
    } finally {
      loading.value[cacheKey] = false
    }
  }

  const getRows = (competitionId: string, season?: string): StandingRow[] => {
    const cacheKey = getCacheKey(competitionId, season)
    return cache.value[cacheKey]?.rows ?? []
  }

  const isLoading = (competitionId: string, season?: string): boolean => {
    const cacheKey = getCacheKey(competitionId, season)
    return loading.value[cacheKey] ?? false
  }

  const getError = (competitionId: string, season?: string): string | null => {
    const cacheKey = getCacheKey(competitionId, season)
    return error.value[cacheKey] ?? null
  }

  return { fetchStandings, getRows, isLoading, getError }
})

