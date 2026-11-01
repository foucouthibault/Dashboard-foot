import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCompetitionsStore } from '@/stores/competitions'
import { getAllChampionships } from '@/api/competitions'
import type { Competition } from '@/types'

vi.mock('@/api/competitions', () => ({
  getAllChampionships: vi.fn(),
}))

const mockedGet = vi.mocked(getAllChampionships)

const competition = (code: string): Competition => ({ id: code, name: `Ligue ${code}`, code })

describe('useCompetitionsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockedGet.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('charge la liste des championnats', async () => {
    mockedGet.mockResolvedValue([competition('FL1'), competition('PL')])
    const store = useCompetitionsStore()

    await store.fetchCompetitions()

    expect(store.competitions.map((c) => c.code)).toEqual(['FL1', 'PL'])
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
  })

  it("ne rappelle pas l'API tant que la liste chargée est fraîche", async () => {
    mockedGet.mockResolvedValue([competition('FL1')])
    const store = useCompetitionsStore()

    await store.fetchCompetitions()
    await store.fetchCompetitions()

    expect(mockedGet).toHaveBeenCalledTimes(1)
  })

  it("rappelle l'API une fois le cache expiré (30 minutes)", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))
    mockedGet.mockResolvedValueOnce([competition('FL1')])
    mockedGet.mockResolvedValueOnce([competition('FL1'), competition('PL')])
    const store = useCompetitionsStore()

    await store.fetchCompetitions()
    vi.setSystemTime(new Date('2025-01-01T12:30:00Z'))
    await store.fetchCompetitions()
    expect(mockedGet).toHaveBeenCalledTimes(1)

    vi.setSystemTime(new Date('2025-01-01T12:30:01Z'))
    await store.fetchCompetitions()
    expect(mockedGet).toHaveBeenCalledTimes(2)
    expect(store.competitions).toHaveLength(2)
  })

  it('indique le chargement pendant la requête', async () => {
    let resolve!: (value: Competition[]) => void
    mockedGet.mockReturnValue(new Promise((r) => (resolve = r)))
    const store = useCompetitionsStore()

    const pending = store.fetchCompetitions()
    expect(store.loading).toBe(true)

    resolve([competition('FL1')])
    await pending
    expect(store.loading).toBe(false)
  })

  it("expose un message d'erreur et termine le chargement si l'API échoue", async () => {
    mockedGet.mockRejectedValue(new Error('network'))
    const store = useCompetitionsStore()

    await store.fetchCompetitions()

    expect(store.error).toBe('Impossible de charger les championnats')
    expect(store.loading).toBe(false)
    expect(store.competitions).toEqual([])
  })

  it("réessaie l'appel après un échec et efface l'erreur", async () => {
    mockedGet.mockRejectedValueOnce(new Error('network'))
    mockedGet.mockResolvedValueOnce([competition('FL1')])
    const store = useCompetitionsStore()

    await store.fetchCompetitions()
    await store.fetchCompetitions()

    expect(mockedGet).toHaveBeenCalledTimes(2)
    expect(store.error).toBeNull()
    expect(store.competitions).toHaveLength(1)
  })
})
