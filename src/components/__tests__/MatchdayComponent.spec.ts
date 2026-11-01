import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import MatchdayComponent from '@/components/MatchdayComponent.vue'
import { getCompetitionMatches } from '@/api/matches'
import type { Match, MatchesResponse } from '@/types'

vi.mock('@/api/matches', () => ({
  getCompetitionMatches: vi.fn(),
}))

const mockedGet = vi.mocked(getCompetitionMatches)

const match = (id: number, home: number | null, away: number | null): Match => ({
  id,
  utcDate: '2025-01-11T20:00:00Z',
  status: 'FINISHED',
  matchday: 17,
  homeTeam: { id: 1, name: `Domicile ${id}` },
  awayTeam: { id: 2, name: `Extérieur ${id}` },
  score: { fullTime: { home, away } },
})

const mountMatchday = (championshipId = 'FL1') =>
  mount(MatchdayComponent, { props: { championshipId }, global: { plugins: [createPinia()] } })

describe('MatchdayComponent', () => {
  beforeEach(() => {
    mockedGet.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('affiche le chargement tant que la requête est en cours', async () => {
    let resolve!: (value: MatchesResponse) => void
    mockedGet.mockReturnValue(new Promise((r) => (resolve = r)))

    const wrapper = mountMatchday()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Chargement des matchs…')

    resolve({ matches: [match(1, 2, 1)] })
    await flushPromises()
    expect(wrapper.text()).not.toContain('Chargement des matchs…')
  })

  it("affiche le message d'erreur si l'API échoue", async () => {
    mockedGet.mockRejectedValue(new Error('network'))

    const wrapper = mountMatchday()
    await flushPromises()

    expect(wrapper.find('.etat-erreur').text()).toBe('Impossible de charger les matchs')
    expect(wrapper.find('.matchs').exists()).toBe(false)
  })

  it("affiche un message quand aucun match n'est terminé", async () => {
    // Le store transforme l'absence de match terminé en message d'erreur : c'est ce
    // message que voit l'utilisateur, pas « Aucun match programmé pour cette journée. »
    mockedGet.mockResolvedValue({ matches: [{ ...match(1, null, null), status: 'TIMED' }] })

    const wrapper = mountMatchday()
    await flushPromises()

    expect(wrapper.find('.etat').text()).toBe('Aucun match terminé disponible')
    expect(wrapper.find('.feuillet-titre').text()).toBe('Journée 0')
    expect(wrapper.find('.matchs').exists()).toBe(false)
  })

  it('affiche les matchs de la dernière journée avec leur score', async () => {
    mockedGet.mockResolvedValue({ matches: [match(1, 2, 1), match(2, 0, 0)] })

    const wrapper = mountMatchday()
    await flushPromises()

    expect(wrapper.find('.feuillet-titre').text()).toBe('Journée 17')
    const matchs = wrapper.findAll('.match')
    expect(matchs).toHaveLength(2)
    expect(matchs[0]!.find('.match-domicile').text()).toBe('Domicile 1')
    expect(matchs[0]!.find('.match-exterieur').text()).toBe('Extérieur 1')
    expect(matchs[0]!.find('.score').text()).toBe('2–1')
    expect(matchs[1]!.find('.score').text()).toBe('0–0')
    expect(matchs[0]!.classes()).toContain('match-joue')
    expect(matchs[0]!.find('.match-date').text()).not.toBe('')
  })

  it('recharge les matchs quand la compétition change', async () => {
    mockedGet.mockResolvedValue({ matches: [match(1, 2, 1)] })

    const wrapper = mountMatchday('FL1')
    await flushPromises()
    await wrapper.setProps({ championshipId: 'PL' })
    await flushPromises()

    expect(mockedGet.mock.calls).toEqual([['FL1'], ['PL']])
  })
})
