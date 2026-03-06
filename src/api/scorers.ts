import { apiClient } from './client'
import type { ScorersResponse } from '@/types'

export async function getCompetitionScorers(competitionId: string): Promise<ScorersResponse> {
  try {
    const response = await apiClient.get<ScorersResponse>(
      `/competitions/${competitionId}/scorers?limit=10`,
    )
    return response.data
  } catch (error) {
    console.error('Error fetching scorers:', error)
    throw error
  }
}
