import { apiClient } from './client'
import type { StandingsResponse } from '@/types'

export async function getCompetitionStandings(
  competitionId: string = 'FL1',
  season?: string
): Promise<StandingsResponse> {
  try {
    let url = `/competitions/${competitionId}/standings`
    
    // Ajouter le paramètre season si fourni
    if (season) {
      url += `?season=${season}`
    }
    
    const response = await apiClient.get<StandingsResponse>(url)
    return response.data
  } catch (error) {
    console.error('Error fetching standings:', error)
    throw error
  }
}
