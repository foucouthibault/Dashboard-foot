import { apiClient } from './client'

interface MatchData {
  id: number
  utcDate: string
  status: string
  homeTeam: { id: number; name: string }
  awayTeam: { id: number; name: string }
  score: { fullTime: { home: number | null; away: number | null } }
  matchday: number
}

interface MatchesResponse {
  matches: MatchData[]
}

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

