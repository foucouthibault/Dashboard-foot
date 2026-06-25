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

  const isStale = (competitionId: string): boolean => {
    const entry = cache.value[competitionId]
    if (!entry) return true
    return Date.now() - entry.fetchedAt > CACHE_TTL
  }

  const fetchStandings = async (competitionId: string): Promise<void> => {
    if (!isStale(competitionId)) return

    loading.value[competitionId] = true
    error.value[competitionId] = null

    try {
      const data = await getCompetitionStandings(competitionId)
      // Pour les compétitions avec groupes (comme la Coupe du Monde), on aplatit tous les groupes
      const allRows = data.standings?.flatMap(group => group.table) ?? []
      cache.value[competitionId] = {
        rows: allRows,
        fetchedAt: Date.now(),
      }
    } catch (err) {
      console.error('Erreur standings', err)
      error.value[competitionId] = 'Impossible de charger le classement'
    } finally {
      loading.value[competitionId] = false
    }
  }

  const getRows = (competitionId: string): StandingRow[] =>
    cache.value[competitionId]?.rows ?? []

  const isLoading = (competitionId: string): boolean =>
    loading.value[competitionId] ?? false

  const getError = (competitionId: string): string | null =>
    error.value[competitionId] ?? null

  return { fetchStandings, getRows, isLoading, getError }
})

