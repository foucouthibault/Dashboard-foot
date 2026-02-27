import { apiClient } from './client'

interface Standings {
  standings: Array<{
    table: Array<{
      position: number
      team: { id: number; name: string }
      points: number
      playedGames: number
      won: number
      draw: number
      lost: number
      goalsFor: number
      goalsAgainst: number
      goalDifference: number
    }>
  }>
}

export async function getCompetitionStandings(
  competitionId: string = 'FL1'
): Promise<Standings> {
  try {
    const response = await apiClient.get<Standings>(
      `/competitions/${competitionId}/standings`
    )
    return response.data
  } catch (error) {
    console.error('Error fetching standings:', error)
    throw error
  }
}
