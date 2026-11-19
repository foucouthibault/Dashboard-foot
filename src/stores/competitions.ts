import { defineStore } from 'pinia'
import { cacheTtlFor } from '@/api/serverStatus'
import { ref } from 'vue'
import { getAllChampionships } from '@/api/competitions'
import type { Competition } from '@/types'

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes (les compétitions changent peu)

export const useCompetitionsStore = defineStore('competitions', () => {
  const competitions = ref<Competition[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const fetchedAt = ref<number | null>(null)
  // Courte si une des compétitions vient de la copie de secours du backend
  const ttl = ref(CACHE_TTL)

  const isStale = (): boolean => {
    if (!fetchedAt.value) return true
    return Date.now() - fetchedAt.value > ttl.value
  }

  const fetchCompetitions = async (): Promise<void> => {
    if (!isStale()) return

    loading.value = true
    error.value = null

    try {
      const data = await getAllChampionships()
      competitions.value = data
      fetchedAt.value = Date.now()
      ttl.value = Math.min(
        ...data.map((competition) => cacheTtlFor(competition, CACHE_TTL)),
        CACHE_TTL,
      )
    } catch (err) {
      console.error('Erreur competitions', err)
      error.value = 'Impossible de charger les championnats'
    } finally {
      loading.value = false
    }
  }

  return { competitions, loading, error, fetchCompetitions }
})
