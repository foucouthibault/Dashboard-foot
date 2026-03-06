import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCompetitionMatches } from '@/api/matches'
import type { Match } from '@/types'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  matches: Match[]
  matchday: number
  fetchedAt: number
}

export const useMatchesStore = defineStore('matches', () => {
  const cache = ref<Record<string, CacheEntry>>({})
  const loading = ref<Record<string, boolean>>({})
  const error = ref<Record<string, string | null>>({})

  const isStale = (competitionId: string): boolean => {
    const entry = cache.value[competitionId]
    if (!entry) return true
    return Date.now() - entry.fetchedAt > CACHE_TTL
  }

  const fetchMatches = async (competitionId: string): Promise<void> => {
    if (!isStale(competitionId)) return

    loading.value[competitionId] = true
    error.value[competitionId] = null

    try {
      const data = await getCompetitionMatches(competitionId)
      const all = data.matches ?? []
      const finished = all.filter((m: Match) => m.status === 'FINISHED')

      if (finished.length === 0) {
        error.value[competitionId] = 'Aucun match terminé disponible'
        cache.value[competitionId] = { matches: [], matchday: 0, fetchedAt: Date.now() }
        return
      }

      const maxMatchday = Math.max(...finished.map((m: Match) => m.matchday ?? 0))
      cache.value[competitionId] = {
        matches: finished.filter((m: Match) => m.matchday === maxMatchday),
        matchday: maxMatchday,
        fetchedAt: Date.now(),
      }
    } catch (err) {
      console.error('Erreur matches', err)
      error.value[competitionId] = 'Impossible de charger les matchs'
    } finally {
      loading.value[competitionId] = false
    }
  }

  const getMatches = (competitionId: string): Match[] =>
    cache.value[competitionId]?.matches ?? []

  const getMatchday = (competitionId: string): number =>
    cache.value[competitionId]?.matchday ?? 0

  const isLoading = (competitionId: string): boolean =>
    loading.value[competitionId] ?? false

  const getError = (competitionId: string): string | null =>
    error.value[competitionId] ?? null

  return { fetchMatches, getMatches, getMatchday, isLoading, getError }
})

