import { apiClient } from './client'
import type { ScorersResponse } from '@/types'

export async function getCompetitionScorers(
  competitionId: string,
  limit: number = 10
): Promise<ScorersResponse> {
  try {
    let url = `/competitions/${competitionId}/scorers`
    
    // Ajouter le paramètre limit
    url += `?limit=${limit}`
    
    const response = await apiClient.get<ScorersResponse>(url)
    return response.data
  } catch (error) {
    console.error('Error fetching scorers:', error)
    throw error
  }
}
