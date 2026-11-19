import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStandingsStore } from '@/stores/standings'
import { getCompetitionStandings } from '@/api/standings'
import { markStaleData } from '@/api/serverStatus'
import { STALE_DATA_TTL_MS } from '@/stores/serverStatus'
import type { StandingGroup, StandingRow } from '@/types'

vi.mock('@/api/standings', () => ({
  getCompetitionStandings: vi.fn(),
}))

const mockedGet = vi.mocked(getCompetitionStandings)

const row = (position: number, id: number): StandingRow => ({
  position,
  team: { id, name: `Team ${id}` },
  points: 0,
  playedGames: 0,
  won: 0,
  draw: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
})

const group = (
  type: StandingGroup['type'],
  rows: StandingRow[],
  name: string | null = null,
): StandingGroup => ({
  stage: 'REGULAR_SEASON',
  type,
  group: name,
  table: rows,
})

describe('useStandingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockedGet.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('ne garde que les tableaux TOTAL', async () => {
    mockedGet.mockResolvedValue({
      standings: [
        group('TOTAL', [row(1, 1), row(2, 2)]),
        group('HOME', [row(1, 3)]),
        group('AWAY', [row(1, 4)]),
      ],
    })
    const store = useStandingsStore()

    await store.fetchStandings('FL1')

    expect(store.getRows('FL1').map((r) => r.team.id)).toEqual([1, 2])
  })

  it('aplatit les groupes TOTAL des compétitions à poules', async () => {
    mockedGet.mockResolvedValue({
      standings: [group('TOTAL', [row(1, 1)], 'GROUP_A'), group('TOTAL', [row(1, 2)], 'GROUP_B')],
    })
    const store = useStandingsStore()

    await store.fetchStandings('WC')

    expect(store.getRows('WC').map((r) => r.team.id)).toEqual([1, 2])
  })

  it("sert le cache sans rappeler l'API tant qu'il est frais, par saison", async () => {
    mockedGet.mockResolvedValue({ standings: [group('TOTAL', [row(1, 1)])] })
    const store = useStandingsStore()

    await store.fetchStandings('FL1', '2025')
    await store.fetchStandings('FL1', '2025')
    await store.fetchStandings('FL1', '2024')

    expect(mockedGet).toHaveBeenCalledTimes(2)
  })

  it("expose un message d'erreur et termine le chargement si l'API échoue", async () => {
    mockedGet.mockRejectedValue(new Error('network'))
    const store = useStandingsStore()

    await store.fetchStandings('FL1')

    expect(store.getError('FL1')).toBe('Impossible de charger le classement')
    expect(store.isLoading('FL1')).toBe(false)
    expect(store.getRows('FL1')).toEqual([])
  })

  describe('donnée servie par la copie de secours du backend', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('ne la garde que peu de temps, pour redemander la donnée fraîche', async () => {
      const stale = { standings: [group('TOTAL', [row(1, 1)])] }
      markStaleData(stale)
      mockedGet
        .mockResolvedValueOnce(stale)
        .mockResolvedValue({ standings: [group('TOTAL', [row(1, 2)])] })
      const store = useStandingsStore()

      await store.fetchStandings('FL1')
      vi.advanceTimersByTime(STALE_DATA_TTL_MS - 1)
      await store.fetchStandings('FL1')
      expect(mockedGet).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(2)
      await store.fetchStandings('FL1')
      expect(mockedGet).toHaveBeenCalledTimes(2)
      expect(store.getRows('FL1').map((r) => r.team.id)).toEqual([2])
    })

    it('garde une donnée fraîche toute la durée habituelle', async () => {
      mockedGet.mockResolvedValue({ standings: [group('TOTAL', [row(1, 1)])] })
      const store = useStandingsStore()

      await store.fetchStandings('FL1')
      vi.advanceTimersByTime(STALE_DATA_TTL_MS * 2)
      await store.fetchStandings('FL1')

      expect(mockedGet).toHaveBeenCalledTimes(1)
    })
  })
})
