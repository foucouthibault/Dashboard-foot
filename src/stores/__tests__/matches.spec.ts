import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMatchesStore } from '@/stores/matches'
import { getCompetitionMatches } from '@/api/matches'
import type { Match, MatchesResponse } from '@/types'

vi.mock('@/api/matches', () => ({
  getCompetitionMatches: vi.fn(),
}))

const mockedGet = vi.mocked(getCompetitionMatches)

const match = (id: number, matchday: number, status = 'FINISHED'): Match => ({
  id,
  utcDate: '2025-01-01T20:00:00Z',
  status,
  matchday,
  homeTeam: { id: 1, name: 'Domicile' },
  awayTeam: { id: 2, name: 'Extérieur' },
  score: { fullTime: { home: 1, away: 0 } },
})

describe('useMatchesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockedGet.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('ne garde que les matchs terminés de la dernière journée jouée', async () => {
    mockedGet.mockResolvedValue({
      matches: [
        match(1, 10),
        match(2, 11),
        match(3, 11),
        match(4, 12, 'SCHEDULED'),
        match(5, 11, 'IN_PLAY'),
      ],
    })
    const store = useMatchesStore()

    await store.fetchMatches('FL1')

    expect(store.getMatchday('FL1')).toBe(11)
    expect(store.getMatches('FL1').map((m) => m.id)).toEqual([2, 3])
    expect(store.getError('FL1')).toBeNull()
  })

  it("signale l'absence de match terminé et met le résultat vide en cache", async () => {
    mockedGet.mockResolvedValue({ matches: [match(1, 1, 'SCHEDULED')] })
    const store = useMatchesStore()

    await store.fetchMatches('FL1')
    await store.fetchMatches('FL1')

    expect(store.getError('FL1')).toBe('Aucun match terminé disponible')
    expect(store.getMatches('FL1')).toEqual([])
    expect(store.getMatchday('FL1')).toBe(0)
    expect(store.isLoading('FL1')).toBe(false)
    expect(mockedGet).toHaveBeenCalledTimes(1)
  })

  it('traite une réponse sans liste de matchs comme vide', async () => {
    mockedGet.mockResolvedValue({} as MatchesResponse)
    const store = useMatchesStore()

    await store.fetchMatches('FL1')

    expect(store.getError('FL1')).toBe('Aucun match terminé disponible')
    expect(store.getMatches('FL1')).toEqual([])
  })

  it("sert le cache sans rappeler l'API tant qu'il est frais, par compétition", async () => {
    mockedGet.mockResolvedValue({ matches: [match(1, 1)] })
    const store = useMatchesStore()

    await store.fetchMatches('FL1')
    await store.fetchMatches('FL1')
    await store.fetchMatches('PL')

    expect(mockedGet).toHaveBeenCalledTimes(2)
    expect(mockedGet).toHaveBeenNthCalledWith(1, 'FL1')
    expect(mockedGet).toHaveBeenNthCalledWith(2, 'PL')
  })

  it("rappelle l'API une fois le cache expiré (5 minutes)", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))
    mockedGet.mockResolvedValue({ matches: [match(1, 1)] })
    const store = useMatchesStore()

    await store.fetchMatches('FL1')
    vi.setSystemTime(new Date('2025-01-01T12:05:00Z'))
    await store.fetchMatches('FL1')
    expect(mockedGet).toHaveBeenCalledTimes(1)

    vi.setSystemTime(new Date('2025-01-01T12:05:01Z'))
    await store.fetchMatches('FL1')
    expect(mockedGet).toHaveBeenCalledTimes(2)
  })

  it('indique le chargement pendant la requête', async () => {
    let resolve!: (value: MatchesResponse) => void
    mockedGet.mockReturnValue(new Promise((r) => (resolve = r)))
    const store = useMatchesStore()

    const pending = store.fetchMatches('FL1')
    expect(store.isLoading('FL1')).toBe(true)

    resolve({ matches: [match(1, 1)] })
    await pending
    expect(store.isLoading('FL1')).toBe(false)
  })

  it("expose un message d'erreur et termine le chargement si l'API échoue", async () => {
    mockedGet.mockRejectedValue(new Error('network'))
    const store = useMatchesStore()

    await store.fetchMatches('FL1')

    expect(store.getError('FL1')).toBe('Impossible de charger les matchs')
    expect(store.isLoading('FL1')).toBe(false)
    expect(store.getMatches('FL1')).toEqual([])
  })

  it("réessaie l'appel après un échec et efface l'erreur", async () => {
    mockedGet.mockRejectedValueOnce(new Error('network'))
    mockedGet.mockResolvedValueOnce({ matches: [match(1, 3)] })
    const store = useMatchesStore()

    await store.fetchMatches('FL1')
    await store.fetchMatches('FL1')

    expect(mockedGet).toHaveBeenCalledTimes(2)
    expect(store.getError('FL1')).toBeNull()
    expect(store.getMatchday('FL1')).toBe(3)
  })

  it("renvoie des valeurs par défaut pour une compétition jamais chargée", () => {
    const store = useMatchesStore()

    expect(store.getMatches('FL1')).toEqual([])
    expect(store.getMatchday('FL1')).toBe(0)
    expect(store.isLoading('FL1')).toBe(false)
    expect(store.getError('FL1')).toBeNull()
  })
})
