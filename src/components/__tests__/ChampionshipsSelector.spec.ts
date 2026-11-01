import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ChampionshipsSelector from '@/components/ChampionshipsSelector.vue'
import { getAllChampionships } from '@/api/competitions'
import { PLACEHOLDER_EMBLEM } from '@/constants/placeholders'
import type { Competition } from '@/types'

vi.mock('@/api/competitions', () => ({
  getAllChampionships: vi.fn(),
}))

const push = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}))

const mockedGet = vi.mocked(getAllChampionships)

const mountSelector = () =>
  mount(ChampionshipsSelector, { global: { plugins: [createPinia()] } })

describe('ChampionshipsSelector', () => {
  beforeEach(() => {
    mockedGet.mockReset()
    push.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('affiche le chargement tant que la requête est en cours', async () => {
    let resolve!: (value: Competition[]) => void
    mockedGet.mockReturnValue(new Promise((r) => (resolve = r)))

    const wrapper = mountSelector()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Chargement des championnats…')

    resolve([{ id: 2015, name: 'Ligue 1', code: 'FL1' }])
    await flushPromises()
    expect(wrapper.text()).not.toContain('Chargement des championnats…')
  })

  it("affiche le message d'erreur si l'API échoue", async () => {
    mockedGet.mockRejectedValue(new Error('network'))

    const wrapper = mountSelector()
    await flushPromises()

    expect(wrapper.find('.etat-erreur').text()).toBe('Impossible de charger les championnats')
    expect(wrapper.find('.planche').exists()).toBe(false)
  })

  it("affiche une planche vide, sans message, quand il n'y a aucun championnat", async () => {
    // Comportement actuel : pas de message dédié à l'état vide, contrairement aux autres
    // composants. En pratique la liste n'est jamais vide (6 championnats fixes côté API).
    mockedGet.mockResolvedValue([])

    const wrapper = mountSelector()
    await flushPromises()

    expect(wrapper.find('.planche').exists()).toBe(true)
    expect(wrapper.findAll('.planche li')).toHaveLength(0)
    expect(wrapper.find('.etat').exists()).toBe(false)
  })

  it('affiche une vignette par championnat et ouvre celui qui est cliqué', async () => {
    mockedGet.mockResolvedValue([
      { id: 2015, name: 'Ligue 1', code: 'FL1', emblem: 'https://emblems/fl1.png' },
      { id: 2000, name: 'FIFA World Cup', emblem: null },
    ])

    const wrapper = mountSelector()
    await flushPromises()

    const vignettes = wrapper.findAll('button.vignette')
    expect(vignettes).toHaveLength(2)
    expect(vignettes.map((v) => v.find('.vignette-nom').text())).toEqual([
      'Ligue 1',
      'FIFA World Cup',
    ])
    expect(vignettes[0]!.find('.vignette-ref').text()).toBe('FL1')
    expect(vignettes[1]!.find('.vignette-ref').exists()).toBe(false)
    expect(vignettes[0]!.find('img').attributes('src')).toBe('https://emblems/fl1.png')
    expect(vignettes[1]!.find('img').attributes('src')).toBe(PLACEHOLDER_EMBLEM)

    await vignettes[0]!.trigger('click')

    expect(push).toHaveBeenCalledWith({ name: 'championship', params: { id: '2015' } })
  })
})
