import { apiClient } from './client'

export async function getCompetitionStandings(competitionId: string = 'FL1') {
  const response = await apiClient.get(`/competitions/${competitionId}/standings`)
  return response.data
}
