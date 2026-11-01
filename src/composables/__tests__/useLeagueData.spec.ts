import { describe, it, expect } from 'vitest'
import { reactive, ref } from 'vue'
import { useLeagueData, LEAGUE_COLORS } from '@/composables/useLeagueData'
import type { Competition } from '@/types'

const competition = (
  id: Competition['id'],
  name: string,
  emblem?: string | null,
  code?: string,
): Competition => ({ id, name, emblem, code })

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
  })

  it.each([
    [2000, 'WC', 'FIFA World Cup', 'WorldCup'],
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

  it('reconnaît une compétition par son code quand son id est absent de la table', () => {
    const { leagueId } = useLeagueData(competition(9999, 'Inconnu', null, 'FL1'))

    expect(leagueId.value).toBe('Ligue1')
  })

  it("cherche dans l'ordre l'id, le code puis le nom", () => {
    expect(useLeagueData(competition(2021, 'Ligue 1', null, 'SA')).leagueId.value).toBe(
      'PremierLeague',
    )
    expect(useLeagueData(competition(9999, 'Ligue 1', null, 'SA')).leagueId.value).toBe('SerieA')
  })

  it('donne à la Coupe du monde son nom, son icône et ses couleurs', () => {
    const { leagueData } = useLeagueData(competition(2000, 'FIFA World Cup', null, 'WC'))

    expect(leagueData.value.name).toBe('Coupe du monde')
    expect(leagueData.value.icon).toBe('🌍')
    expect(leagueData.value.colors).toEqual(LEAGUE_COLORS.WorldCup)
    expect(leagueData.value.colors).not.toEqual(LEAGUE_COLORS.default)
  })

  it('utilise les valeurs par défaut et le nom reçu pour une compétition inconnue', () => {
    const { leagueId, leagueData } = useLeagueData(
      competition(2001, 'UEFA Champions League', null, 'CL'),
    )

    expect(leagueId.value).toBe('default')
    expect(leagueData.value).toEqual({
      id: 'default',
      name: 'UEFA Champions League',
      icon: '⚽',
      colors: LEAGUE_COLORS.default,
      emblem: null,
    })
  })

  it("ignore les propriétés héritées d'Object dans la table des ligues", () => {
    expect(useLeagueData(competition('constructor', 'toString')).leagueId.value).toBe('default')
  })

  it('affiche « Compétition » pour une compétition inconnue sans nom', () => {
    expect(useLeagueData(competition('CL', '')).leagueData.value.name).toBe('Compétition')
    expect(useLeagueData({ id: 'CL' } as Competition).leagueData.value.name).toBe('Compétition')
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
