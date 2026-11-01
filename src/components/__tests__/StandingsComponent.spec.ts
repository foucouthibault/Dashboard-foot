import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StandingsComponent from '@/components/StandingsComponent.vue'
import { PLACEHOLDER_CREST } from '@/constants/placeholders'
import type { StandingRow } from '@/types'

// Composant de présentation : il reçoit ses données par props, aucune API à mocker.

const row = (position: number, id: number, overrides: Partial<StandingRow> = {}): StandingRow => ({
  position,
  team: { id, name: `Équipe ${id}`, crest: `https://crests/${id}.png` },
  points: 30 - position,
  playedGames: 12,
  won: 8,
  draw: 2,
  lost: 2,
  goalsFor: 20,
  goalsAgainst: 10,
  goalDifference: 10,
  ...overrides,
})

describe('StandingsComponent', () => {
  it('affiche le chargement, même si des lignes ou une erreur sont présentes', () => {
    const wrapper = mount(StandingsComponent, {
      props: { rows: [row(1, 1)], loading: true, error: 'Erreur' },
    })

    expect(wrapper.text()).toContain('Chargement du classement…')
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.find('.etat-erreur').exists()).toBe(false)
  })

  it("affiche le message d'erreur", () => {
    const wrapper = mount(StandingsComponent, {
      props: { rows: [], error: 'Impossible de charger le classement' },
    })

    expect(wrapper.find('.etat-erreur').text()).toBe('Impossible de charger le classement')
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it("affiche un message quand il n'y a aucune ligne", () => {
    const wrapper = mount(StandingsComponent, { props: { rows: [] } })

    expect(wrapper.text()).toContain('Aucun classement publié pour cette saison.')
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('affiche une ligne par équipe avec ses statistiques', () => {
    const wrapper = mount(StandingsComponent, {
      props: {
        rows: [
          row(1, 1),
          row(2, 2, { goalDifference: 0, team: { id: 2, name: 'Équipe 2' } }),
          row(3, 3, { goalDifference: -4 }),
        ],
      },
    })

    const lignes = wrapper.findAll('tbody tr')
    expect(lignes).toHaveLength(3)
    expect(lignes.map((l) => l.find('.equipe-nom').text())).toEqual([
      'Équipe 1',
      'Équipe 2',
      'Équipe 3',
    ])

    const premiere = lignes[0]!
    expect(premiere.classes()).toContain('ligne-leader')
    expect(premiere.find('.col-joues').text()).toBe('12')
    expect(premiere.find('.col-bilan').text()).toBe('8·2·2')
    expect(premiere.find('.col-points').text()).toBe('29')
    expect(premiere.find('img').attributes('src')).toBe('https://crests/1.png')

    expect(lignes.map((l) => l.find('.col-diff').text())).toEqual(['+10', '0', '-4'])
    expect(lignes[0]!.find('.col-diff').classes()).toContain('positif')
    expect(lignes[2]!.find('.col-diff').classes()).toContain('negatif')

    expect(lignes[1]!.classes()).not.toContain('ligne-leader')
    expect(lignes[1]!.find('img').attributes('src')).toBe(PLACEHOLDER_CREST)
  })
})
