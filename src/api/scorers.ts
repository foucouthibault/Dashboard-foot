import { apiClient } from './client'
import type { ScorersResponse } from '@/types'

export async function getCompetitionScorers(
  competitionId: string,
  limit: number = 10,
  season?: string
): Promise<ScorersResponse> {
  try {
    const response = await apiClient.get<ScorersResponse>(
      `/competitions/${competitionId}/scorers`,
      { params: season ? { limit, season } : { limit } },
    )
    return response.data
  } catch (error) {
    console.error('Error fetching scorers:', error)
    throw error
  }
}
