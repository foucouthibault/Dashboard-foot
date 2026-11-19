import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getCompetitionMatches } from '@/api/matches'
import { apiClient } from '@/api/client'

vi.mock('@/api/client', () => ({
  apiClient: { get: vi.fn() },
}))

const mockedGet = vi.mocked(apiClient.get)

describe('getCompetitionMatches', () => {
  beforeEach(() => {
    mockedGet.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('appelle la route des matchs de la compétition et renvoie le corps de la réponse', async () => {
    mockedGet.mockResolvedValue({ data: { matches: [{ id: 1 }] } })

    await expect(getCompetitionMatches('FL1')).resolves.toEqual({ matches: [{ id: 1 }] })
    expect(mockedGet).toHaveBeenCalledWith('/competitions/FL1/matches')
  })

  it("propage l'erreur", async () => {
    mockedGet.mockRejectedValue(new Error('réseau'))

    await expect(getCompetitionMatches('FL1')).rejects.toThrow('réseau')
  })
})
