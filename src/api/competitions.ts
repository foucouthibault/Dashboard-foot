import { apiClient } from './client'

export async function getCompetition() {
  const response = await apiClient.get('/competitions/FL1')
  return response.data
}

export async function getAllChampionships() {
  const ids = ['FL1', 'PL', 'PD', 'BL1', 'SA']
  const championships = await Promise.all(
    ids.map(id => apiClient.get(`/competitions/${id}`).then(res => res.data))
  )
  return championships
}

