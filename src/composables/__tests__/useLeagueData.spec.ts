import { describe, it, expect } from 'vitest'
import { reactive, ref } from 'vue'
import { useLeagueData, LEAGUE_COLORS, LEAGUE_GRADIENTS } from '@/composables/useLeagueData'
import type { Competition } from '@/types'

const competition = (id: Competition['id'], name: string, emblem?: string | null): Competition => ({
  id,
  name,
  emblem,
})

describe('useLeagueData', () => {
  it.each([
    ['id numérique', competition(2015, 'Inconnu')],
    ['id numérique en chaîne', competition('2015', 'Inconnu')],
    ['code', competition('FL1', 'Inconnu')],
    ['nom', competition(9999, 'Ligue 1')],
  ])('associe la Ligue 1 à partir de son %s', (_, source) => {
    const { leagueId, leagueData } = useLeagueData(source)

    expect(leagueId.value).toBe('Ligue1')
    expect(leagueData.value.name).toBe('Ligue 1 Uber Eats')
    expect(leagueData.value.icon).toBe('🏆')
    expect(leagueData.value.colors).toEqual(LEAGUE_COLORS.Ligue1)
    expect(leagueData.value.gradient).toEqual(LEAGUE_GRADIENTS.Ligue1)
  })

  it.each([
    [2021, 'PL', 'Premier League', 'PremierLeague'],
    [2014, 'PD', 'La Liga', 'Liga'],
    [2002, 'BL1', 'Bundesliga', 'Bundesliga'],
    [2019, 'SA', 'Serie A', 'SerieA'],
    [2016, 'FL2', 'Ligue 2', 'Ligue2'],
  ])('associe %s, %s et « %s » à %s', (numericId, code, name, expected) => {
    for (const source of [
      competition(numericId, 'Inconnu'),
      competition(code, 'Inconnu'),
      competition(0, name),
    ]) {
      expect(useLeagueData(source).leagueId.value).toBe(expected)
    }
  })

  it("privilégie l'id au nom quand les deux désignent des ligues différentes", () => {
    const { leagueId } = useLeagueData(competition(2021, 'Ligue 1'))

    expect(leagueId.value).toBe('PremierLeague')
  })

  it('transmet le logo de la compétition', () => {
    const { leagueData } = useLeagueData(competition(2015, 'Ligue 1', 'https://crests/fl1.png'))

    expect(leagueData.value.emblem).toBe('https://crests/fl1.png')
  })

  it('utilise les valeurs par défaut pour une compétition inconnue', () => {
    const { leagueId, leagueData } = useLeagueData(competition(2000, 'FIFA World Cup'))

    expect(leagueId.value).toBe('default')
    expect(leagueData.value).toEqual({
      id: 'default',
      // Comportement actuel : LEAGUE_NAMES a une entrée `default`, donc le nom reçu
      // n'est jamais utilisé. Probablement un bug, à mettre à jour avec sa correction.
      name: 'Compétition',
      icon: '⚽',
      colors: LEAGUE_COLORS.default,
      gradient: LEAGUE_GRADIENTS.default,
      emblem: undefined,
    })
  })

  it('accepte une compétition sans nom', () => {
    const { leagueId } = useLeagueData({ id: 'CL' } as Competition)

    expect(leagueId.value).toBe('default')
  })

  it('suit le changement de compétition passé par un getter (navigation sans remontage)', () => {
    const props = reactive({ competition: competition(2015, 'Ligue 1') })
    const { leagueId, leagueData } = useLeagueData(() => props.competition)
    expect(leagueId.value).toBe('Ligue1')

    props.competition = competition(2021, 'Premier League')

    expect(leagueId.value).toBe('PremierLeague')
    expect(leagueData.value.name).toBe('Premier League')
    expect(leagueData.value.colors).toEqual(LEAGUE_COLORS.PremierLeague)
  })

  it('suit le changement de compétition passé par une ref', () => {
    const source = ref(competition(2002, 'Bundesliga'))
    const { leagueId } = useLeagueData(source)
    expect(leagueId.value).toBe('Bundesliga')

    source.value = competition('CL', 'UEFA Champions League')

    expect(leagueId.value).toBe('default')
  })
})
