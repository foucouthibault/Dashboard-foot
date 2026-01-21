import { apiClient } from './client'

export async function getTeamMatches(teamId: number, limit: number = 5) {
  const response = await apiClient.get(`/teams/${teamId}/matches?status=FINISHED&limit=${limit}`)
  return response.data
}

export async function getMatchDetails(matchId: number) {
  const response = await apiClient.get(`/matches/${matchId}`)
  return response.data
}

