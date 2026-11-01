import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getAllChampionships } from '@/api/competitions'
import { apiClient } from '@/api/client'

vi.mock('@/api/client', () => ({
  apiClient: { get: vi.fn() },
}))

const mockedGet = vi.mocked(apiClient.get)

const CHAMPIONSHIP_IDS = ['FL1', 'PL', 'PD', 'BL1', 'SA', 'WC']

describe('getAllChampionships', () => {
  beforeEach(() => {
    mockedGet.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('demande chaque championnat et renvoie les réponses dans le même ordre', async () => {
    mockedGet.mockImplementation((url: string) =>
      Promise.resolve({ data: { id: url.split('/').pop(), name: url } }),
    )

    const result = await getAllChampionships()

    expect(mockedGet.mock.calls.map(([url]) => url)).toEqual(
      CHAMPIONSHIP_IDS.map((id) => `/competitions/${id}`),
    )
    expect(result.map((c) => c.id)).toEqual(CHAMPIONSHIP_IDS)
  })

  it("échoue entièrement si un seul des appels échoue (Promise.all)", async () => {
    mockedGet.mockImplementation((url: string) =>
      url.endsWith('/SA')
        ? Promise.reject(new Error('429'))
        : Promise.resolve({ data: { id: 'x', name: 'x' } }),
    )

    await expect(getAllChampionships()).rejects.toThrow('429')
  })
})
