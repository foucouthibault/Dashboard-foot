import { apiClient } from './client'
import type { MatchesResponse } from '@/types'

export async function getCompetitionMatches(
  competitionId: string
): Promise<MatchesResponse> {
  try {
    const response = await apiClient.get<MatchesResponse>(
      `/competitions/${competitionId}/matches`
    )
    return response.data
  } catch (error) {
    console.error('Error fetching matches:', error)
    throw error
  }
}
