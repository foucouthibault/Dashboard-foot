import { apiClient } from './client'
import type { ScorersResponse } from '@/types'

export async function getCompetitionScorers(
  competitionId: string,
  limit: number = 10
): Promise<ScorersResponse> {
  try {
    const response = await apiClient.get<ScorersResponse>(
      `/competitions/${competitionId}/scorers`,
      { params: { limit } },
    )
    return response.data
  } catch (error) {
    console.error('Error fetching scorers:', error)
    throw error
  }
}
