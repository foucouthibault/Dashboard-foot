import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useScorersStore } from '@/stores/scorers'
import { getCompetitionScorers } from '@/api/scorers'
import type { Scorer, ScorersResponse } from '@/types'

vi.mock('@/api/scorers', () => ({
  getCompetitionScorers: vi.fn(),
}))

const mockedGet = vi.mocked(getCompetitionScorers)

const scorer = (id: number, goals: number): Scorer => ({
  player: { id, name: `Joueur ${id}`, nationality: 'France' },
  team: { id: 1, name: 'Équipe' },
  goals,
  assists: null,
  penalties: null,
})

describe('useScorersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockedGet.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("stocke les buteurs renvoyés par l'API sous la clé demandée", async () => {
    mockedGet.mockResolvedValue({ scorers: [scorer(1, 12), scorer(2, 9)] })
    const store = useScorersStore()

    await store.fetchScorers('FL1', 20, '2024')

    expect(mockedGet).toHaveBeenCalledWith('FL1', 20, '2024')
    expect(store.getScorers('FL1', 20, '2024').map((s) => s.player.id)).toEqual([1, 2])
    expect(store.getScorers('FL1', 20)).toEqual([])
    expect(store.getError('FL1', 20, '2024')).toBeNull()
  })

  it('utilise un limit de 10 et aucune saison par défaut', async () => {
    mockedGet.mockResolvedValue({ scorers: [scorer(1, 12)] })
    const store = useScorersStore()

    await store.fetchScorers('FL1')

    expect(mockedGet).toHaveBeenCalledWith('FL1', 10, undefined)
    expect(store.getScorers('FL1', 10)).toHaveLength(1)
  })

  it("ne rappelle pas l'API pour la même compétition, le même limit et la même saison", async () => {
    mockedGet.mockResolvedValue({ scorers: [scorer(1, 12)] })
    const store = useScorersStore()

    await store.fetchScorers('FL1', 10, '2024')
    await store.fetchScorers('FL1', 10, '2024')
    await store.fetchScorers('FL1')
    await store.fetchScorers('FL1', 10)

    expect(mockedGet).toHaveBeenCalledTimes(2)
  })

  it("rappelle l'API si la compétition, le limit ou la saison change", async () => {
    mockedGet.mockResolvedValue({ scorers: [scorer(1, 12)] })
    const store = useScorersStore()

    await store.fetchScorers('FL1', 10, '2024')
    await store.fetchScorers('PL', 10, '2024')
    await store.fetchScorers('FL1', 20, '2024')
    await store.fetchScorers('FL1', 10, '2023')
    await store.fetchScorers('FL1', 10)

    expect(mockedGet.mock.calls).toEqual([
      ['FL1', 10, '2024'],
      ['PL', 10, '2024'],
      ['FL1', 20, '2024'],
      ['FL1', 10, '2023'],
      ['FL1', 10, undefined],
    ])
  })

  it("rappelle l'API une fois le cache expiré (5 minutes)", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))
    mockedGet.mockResolvedValue({ scorers: [scorer(1, 12)] })
    const store = useScorersStore()

    await store.fetchScorers('FL1')
    vi.setSystemTime(new Date('2025-01-01T12:05:00Z'))
    await store.fetchScorers('FL1')
    expect(mockedGet).toHaveBeenCalledTimes(1)

    vi.setSystemTime(new Date('2025-01-01T12:05:01Z'))
    await store.fetchScorers('FL1')
    expect(mockedGet).toHaveBeenCalledTimes(2)
  })

  it('traite une réponse sans liste de buteurs comme vide', async () => {
    mockedGet.mockResolvedValue({} as ScorersResponse)
    const store = useScorersStore()

    await store.fetchScorers('FL1')

    expect(store.getScorers('FL1')).toEqual([])
    expect(store.getError('FL1')).toBeNull()
  })

  it('indique le chargement pendant la requête, pour la clé concernée seulement', async () => {
    let resolve!: (value: ScorersResponse) => void
    mockedGet.mockReturnValue(new Promise((r) => (resolve = r)))
    const store = useScorersStore()

    const pending = store.fetchScorers('FL1', 10, '2024')
    expect(store.isLoading('FL1', 10, '2024')).toBe(true)
    expect(store.isLoading('FL1', 10)).toBe(false)

    resolve({ scorers: [scorer(1, 12)] })
    await pending
    expect(store.isLoading('FL1', 10, '2024')).toBe(false)
  })

  it("expose un message d'erreur et termine le chargement si l'API échoue", async () => {
    mockedGet.mockRejectedValue(new Error('network'))
    const store = useScorersStore()

    await store.fetchScorers('FL1', 10, '2024')

    expect(store.getError('FL1', 10, '2024')).toBe('Impossible de charger les buteurs')
    expect(store.getError('FL1', 10)).toBeNull()
    expect(store.isLoading('FL1', 10, '2024')).toBe(false)
    expect(store.getScorers('FL1', 10, '2024')).toEqual([])
  })

  it("réessaie l'appel après un échec et efface l'erreur", async () => {
    mockedGet.mockRejectedValueOnce(new Error('network'))
    mockedGet.mockResolvedValueOnce({ scorers: [scorer(1, 12)] })
    const store = useScorersStore()

    await store.fetchScorers('FL1')
    await store.fetchScorers('FL1')

    expect(mockedGet).toHaveBeenCalledTimes(2)
    expect(store.getError('FL1')).toBeNull()
    expect(store.getScorers('FL1')).toHaveLength(1)
  })
})
