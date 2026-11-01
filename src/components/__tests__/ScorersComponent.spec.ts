import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ScorersComponent from '@/components/ScorersComponent.vue'
import { getCompetitionScorers } from '@/api/scorers'
import type { Scorer, ScorersResponse } from '@/types'

vi.mock('@/api/scorers', () => ({
  getCompetitionScorers: vi.fn(),
}))

const mockedGet = vi.mocked(getCompetitionScorers)

const scorer = (id: number, goals: number, assists: number | null): Scorer => ({
  player: { id, name: `Joueur ${id}`, nationality: 'France' },
  team: { id: 10 + id, name: `Équipe ${id}`, crest: `https://crests/${id}.png` },
  goals,
  assists,
  penalties: null,
})

const mountScorers = (props: { championshipId: string; limit?: number; season?: string }) =>
  mount(ScorersComponent, { props, global: { plugins: [createPinia()] } })

describe('ScorersComponent', () => {
  beforeEach(() => {
    mockedGet.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('affiche le chargement tant que la requête est en cours', async () => {
    let resolve!: (value: ScorersResponse) => void
    mockedGet.mockReturnValue(new Promise((r) => (resolve = r)))

    const wrapper = mountScorers({ championshipId: 'FL1' })
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Chargement des buteurs…')
    expect(mockedGet).toHaveBeenCalledWith('FL1', 10, undefined)

    resolve({ scorers: [scorer(1, 12, 3)] })
    await flushPromises()
    expect(wrapper.text()).not.toContain('Chargement des buteurs…')
  })

  it("affiche le message d'erreur si l'API échoue", async () => {
    mockedGet.mockRejectedValue(new Error('network'))

    const wrapper = mountScorers({ championshipId: 'FL1' })
    await flushPromises()

    expect(wrapper.find('.etat-erreur').text()).toBe('Impossible de charger les buteurs')
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it("affiche un message quand il n'y a aucun buteur", async () => {
    mockedGet.mockResolvedValue({ scorers: [] })

    const wrapper = mountScorers({ championshipId: 'FL1' })
    await flushPromises()

    expect(wrapper.text()).toContain('Aucun buteur enregistré pour cette compétition.')
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('affiche une ligne par buteur, numérotée dans l’ordre reçu', async () => {
    mockedGet.mockResolvedValue({ scorers: [scorer(1, 12, 3), scorer(2, 9, null)] })

    const wrapper = mountScorers({ championshipId: 'PL', limit: 20, season: '2024' })
    await flushPromises()

    expect(mockedGet).toHaveBeenCalledWith('PL', 20, '2024')
    const lignes = wrapper.findAll('tbody tr')
    expect(lignes).toHaveLength(2)
    expect(lignes.map((l) => l.find('.rang').text())).toEqual(['1', '2'])
    expect(lignes[0]!.find('.joueur-nom').text()).toBe('Joueur 1')
    expect(lignes[0]!.find('.equipe-nom').text()).toBe('Équipe 1')
    expect(lignes[0]!.find('.col-buts').text()).toBe('12')
    expect(lignes[0]!.find('.col-passes').text()).toBe('3')
    expect(lignes[1]!.find('.col-passes').text()).toBe('—')
  })

  it('recharge les buteurs quand la saison change', async () => {
    mockedGet.mockResolvedValue({ scorers: [scorer(1, 12, 3)] })

    const wrapper = mountScorers({ championshipId: 'FL1', season: '2025' })
    await flushPromises()
    await wrapper.setProps({ season: '2024' })
    await flushPromises()

    expect(mockedGet.mock.calls).toEqual([
      ['FL1', 10, '2025'],
      ['FL1', 10, '2024'],
    ])
  })
})
