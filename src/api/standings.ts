import { apiClient } from './client'
import type { StandingsResponse } from '@/types'

export async function getCompetitionStandings(
  competitionId: string = 'FL1'
): Promise<StandingsResponse> {
  try {
    const response = await apiClient.get<StandingsResponse>(
      `/competitions/${competitionId}/standings`
    )
    return response.data
  } catch (error) {
    console.error('Error fetching standings:', error)
    throw error
  }
}
