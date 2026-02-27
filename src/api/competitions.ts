import { apiClient } from './client'

interface Competition {
  id: string | number
  name: string
  emblem?: string | null
  [key: string]: unknown
}

const CHAMPIONSHIP_IDS = ['FL1', 'PL', 'PD', 'BL1', 'SA'] as const

export async function getAllChampionships(): Promise<Competition[]> {
  try {

    return await Promise.all(
      CHAMPIONSHIP_IDS.map(
        (id): Promise<Competition> =>
          apiClient.get<Competition>(`/competitions/${id}`).then((res) => res.data),
      ),
    )
  } catch (error) {
    console.error('Error fetching championships:', error)
    throw error
  }
}

