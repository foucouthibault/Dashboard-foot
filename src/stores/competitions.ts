import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAllChampionships } from '@/api/competitions'
import type { Competition } from '@/types'

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes (les compétitions changent peu)

export const useCompetitionsStore = defineStore('competitions', () => {
  const competitions = ref<Competition[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const fetchedAt = ref<number | null>(null)

  const isStale = (): boolean => {
    if (!fetchedAt.value) return true
    return Date.now() - fetchedAt.value > CACHE_TTL
  }

  const fetchCompetitions = async (): Promise<void> => {
    if (!isStale()) return

    loading.value = true
    error.value = null

    try {
      competitions.value = await getAllChampionships()
      fetchedAt.value = Date.now()
    } catch (err) {
      console.error('Erreur competitions', err)
      error.value = 'Impossible de charger les championnats'
    } finally {
      loading.value = false
    }
  }

  return { competitions, loading, error, fetchCompetitions }
})

