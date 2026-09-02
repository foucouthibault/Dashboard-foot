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

  // Génère une clé de cache unique basée sur competitionId et limit
  const getCacheKey = (competitionId: string, limit: number = 10): string => {
    return `${competitionId}-${limit}`
  }

  const isStale = (competitionId: string, limit: number = 10): boolean => {
    const key = getCacheKey(competitionId, limit)
    const entry = cache.value[key]
    if (!entry) return true
    return Date.now() - entry.fetchedAt > CACHE_TTL
  }

  const fetchScorers = async (competitionId: string, limit: number = 10): Promise<void> => {
    const cacheKey = getCacheKey(competitionId, limit)
    if (!isStale(competitionId, limit)) return

    loading.value[cacheKey] = true
    error.value[cacheKey] = null

    try {
      const data = await getCompetitionScorers(competitionId, limit)
      cache.value[cacheKey] = {
        scorers: data.scorers ?? [],
        fetchedAt: Date.now(),
      }
    } catch (err) {
      console.error('Erreur scorers', err)
      error.value[cacheKey] = 'Impossible de charger les buteurs'
    } finally {
      loading.value[cacheKey] = false
    }
  }

  const getScorers = (competitionId: string, limit: number = 10): Scorer[] => {
    const cacheKey = getCacheKey(competitionId, limit)
    return cache.value[cacheKey]?.scorers ?? []
  }

  const isLoading = (competitionId: string, limit: number = 10): boolean => {
    const cacheKey = getCacheKey(competitionId, limit)
    return loading.value[cacheKey] ?? false
  }

  const getError = (competitionId: string, limit: number = 10): string | null => {
    const cacheKey = getCacheKey(competitionId, limit)
    return error.value[cacheKey] ?? null
  }

  return { fetchScorers, getScorers, isLoading, getError }
})

