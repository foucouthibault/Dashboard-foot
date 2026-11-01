import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getCompetitionScorers } from '@/api/scorers'
import { apiClient } from '@/api/client'

vi.mock('@/api/client', () => ({
  apiClient: { get: vi.fn() },
}))

const mockedGet = vi.mocked(apiClient.get)

describe('getCompetitionScorers', () => {
  beforeEach(() => {
    mockedGet.mockReset()
    mockedGet.mockResolvedValue({ data: { scorers: [] } })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('transmet la saison quand elle est renseignée', async () => {
    await getCompetitionScorers('FL1', 20, '2024')

    expect(mockedGet).toHaveBeenCalledWith('/competitions/FL1/scorers', {
      params: { limit: 20, season: '2024' },
    })
  })

  it("n'envoie pas de paramètre season quand elle est absente ou vide", async () => {
    await getCompetitionScorers('FL1')
    await getCompetitionScorers('FL1', 10, '')

    expect(mockedGet).toHaveBeenNthCalledWith(1, '/competitions/FL1/scorers', {
      params: { limit: 10 },
    })
    expect(mockedGet).toHaveBeenNthCalledWith(2, '/competitions/FL1/scorers', {
      params: { limit: 10 },
    })
  })

  it("renvoie le corps de la réponse et propage l'erreur", async () => {
    mockedGet.mockResolvedValueOnce({ data: { scorers: [{ goals: 3 }] } })
    await expect(getCompetitionScorers('FL1')).resolves.toEqual({ scorers: [{ goals: 3 }] })

    mockedGet.mockRejectedValueOnce(new Error('network'))
    await expect(getCompetitionScorers('FL1')).rejects.toThrow('network')
  })
})
