import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LeagueBanner from '@/components/LeagueBanner.vue'
import { LEAGUE_COLORS } from '@/composables/useLeagueData'

// Le titre du bandeau de la page d'un championnat vient de useLeagueData.

const hexToRgb = (hex: string): string => {
  const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16))
  return `rgb(${r}, ${g}, ${b})`
}

describe('LeagueBanner', () => {
  it('affiche le nom et les couleurs de la Coupe du monde', () => {
    const wrapper = mount(LeagueBanner, {
      props: { competition: { id: 2000, name: 'FIFA World Cup', code: 'WC' }, season: '2026/2027' },
    })

    expect(wrapper.find('h1').text()).toBe('Coupe du monde')
    expect(wrapper.find('.titre-bloc').attributes('style')).toContain(
      `background-color: ${hexToRgb(LEAGUE_COLORS.WorldCup.bg)}`,
    )
  })

  it('affiche le nom reçu pour une compétition absente de la table', () => {
    const wrapper = mount(LeagueBanner, {
      props: { competition: { id: 2001, name: 'UEFA Champions League', code: 'CL' } },
    })

    expect(wrapper.find('h1').text()).toBe('UEFA Champions League')
  })

  it('émet back au clic sur le bouton de retour', async () => {
    const wrapper = mount(LeagueBanner, {
      props: { competition: { id: 2015, name: 'Ligue 1', code: 'FL1' } },
    })

    await wrapper.find('button.retour').trigger('click')

    expect(wrapper.emitted('back')).toHaveLength(1)
  })
})
