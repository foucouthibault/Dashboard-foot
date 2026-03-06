import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCompetitionScorers } from '@/api/scorers'
import type { Scorer } from '@/types'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  scorers: Scorer[]
  fetchedAt: number
}

export const useScorersStore = defineStore('scorers', () => {
  const cache = ref<Record<string, CacheEntry>>({})
  const loading = ref<Record<string, boolean>>({})
  const error = ref<Record<string, string | null>>({})

  const isStale = (competitionId: string): boolean => {
    const entry = cache.value[competitionId]
    if (!entry) return true
    return Date.now() - entry.fetchedAt > CACHE_TTL
  }

  const fetchScorers = async (competitionId: string): Promise<void> => {
    if (!isStale(competitionId)) return

    loading.value[competitionId] = true
    error.value[competitionId] = null

    try {
      const data = await getCompetitionScorers(competitionId)
      cache.value[competitionId] = {
        scorers: data.scorers ?? [],
        fetchedAt: Date.now(),
      }
    } catch (err) {
      console.error('Erreur scorers', err)
      error.value[competitionId] = 'Impossible de charger les buteurs'
    } finally {
      loading.value[competitionId] = false
    }
  }

  const getScorers = (competitionId: string): Scorer[] =>
    cache.value[competitionId]?.scorers ?? []

  const isLoading = (competitionId: string): boolean =>
    loading.value[competitionId] ?? false

  const getError = (competitionId: string): string | null =>
    error.value[competitionId] ?? null

  return { fetchScorers, getScorers, isLoading, getError }
})

