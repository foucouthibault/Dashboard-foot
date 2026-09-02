import { apiClient } from './client'
import type { StandingsResponse } from '@/types'

export async function getCompetitionStandings(
  competitionId: string = 'FL1',
  season?: string
): Promise<StandingsResponse> {
  try {
    const response = await apiClient.get<StandingsResponse>(
      `/competitions/${competitionId}/standings`,
      { params: season ? { season } : undefined },
    )
    return response.data
  } catch (error) {
    console.error('Error fetching standings:', error)
    throw error
  }
}
