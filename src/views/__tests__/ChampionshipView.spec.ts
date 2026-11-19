import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ChampionshipView from '@/views/ChampionshipView.vue'
import { getAllChampionships } from '@/api/competitions'
import { getCompetitionStandings } from '@/api/standings'
import { getCompetitionMatches } from '@/api/matches'

vi.mock('@/api/competitions', () => ({ getAllChampionships: vi.fn() }))
vi.mock('@/api/standings', () => ({ getCompetitionStandings: vi.fn() }))
vi.mock('@/api/matches', () => ({ getCompetitionMatches: vi.fn() }))
vi.mock('@/api/scorers', () => ({ getCompetitionScorers: vi.fn() }))

const currentYear = new Date().getFullYear()

const mountAt = async (id: string) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/championship/:id', name: 'championship', component: ChampionshipView },
    ],
  })
  await router.push(`/championship/${id}`)
  const wrapper = mount(ChampionshipView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('ChampionshipView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(getAllChampionships).mockResolvedValue([
      { id: 2015, name: 'Ligue 1', code: 'FL1', emblem: '' },
      { id: 2021, name: 'Premier League', code: 'PL', emblem: '' },
    ])
    vi.mocked(getCompetitionStandings).mockResolvedValue({ standings: [] })
    vi.mocked(getCompetitionMatches).mockResolvedValue({ matches: [] })
  })

  it('affiche la bannière de la compétition demandée avec la saison en cours', async () => {
    const wrapper = await mountAt('2015')

    expect(wrapper.text()).toContain('Ligue 1')
    expect(wrapper.find('.etagere-courante').text()).toBe(`${currentYear}/${currentYear + 1}`)
  })

  it('propose trois saisons, la plus récente sélectionnée et seule atteignable au clavier', async () => {
    const wrapper = await mountAt('2015')

    const saisons = wrapper.findAll('[role="radio"]')
    expect(saisons).toHaveLength(3)
    expect(saisons.map((s) => s.attributes('aria-checked'))).toEqual(['true', 'false', 'false'])
    expect(saisons.map((s) => s.attributes('tabindex'))).toEqual(['0', '-1', '-1'])
  })

  it('choisir une saison passée met à jour le libellé et recharge le classement de cette saison', async () => {
    const wrapper = await mountAt('2015')

    await wrapper.findAll('[role="radio"]')[2].trigger('click')
    await flushPromises()

    expect(wrapper.find('.etagere-courante').text()).toBe(`${currentYear - 2}/${currentYear - 1}`)
    expect(getCompetitionStandings).toHaveBeenLastCalledWith('2015', String(currentYear - 2))
  })

  it('les flèches du clavier passent à la saison suivante et y déplacent le focus', async () => {
    const wrapper = await mountAt('2015')
    const saisons = wrapper.findAll('[role="radio"]')

    await saisons[0].trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.findAll('[role="radio"]')[1].attributes('aria-checked')).toBe('true')
  })
})
