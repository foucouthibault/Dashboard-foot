import { test, expect } from '@playwright/test'
import type { Page, Route } from '@playwright/test'

// L'API est simulée avec page.route : les tests ne dépendent ni du backend Spring
// ni du quota football-data.org, et tournent donc aussi en CI.

const COMPETITIONS: Record<string, { id: number; name: string; code: string }> = {
  FL1: { id: 2015, name: 'Ligue 1', code: 'FL1' },
  PL: { id: 2021, name: 'Premier League', code: 'PL' },
  PD: { id: 2014, name: 'Primera Division', code: 'PD' },
  BL1: { id: 2002, name: 'Bundesliga', code: 'BL1' },
  SA: { id: 2019, name: 'Serie A', code: 'SA' },
  WC: { id: 2000, name: 'FIFA World Cup', code: 'WC' },
}

const team = (id: number, name: string) => ({ id, name, crest: '' })

const standingRow = (position: number, id: number, name: string, points: number) => ({
  position,
  team: team(id, name),
  points,
  playedGames: 3,
  won: 0,
  draw: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
})

const STANDINGS = {
  standings: [
    {
      stage: 'REGULAR_SEASON',
      type: 'TOTAL',
      group: null,
      table: [standingRow(1, 524, 'Paris Saint-Germain', 9), standingRow(2, 516, 'Olympique de Marseille', 7)],
    },
    // Les tableaux HOME/AWAY ne doivent pas être affichés
    { stage: 'REGULAR_SEASON', type: 'HOME', group: null, table: [standingRow(1, 999, 'Équipe HOME', 6)] },
  ],
}

const MATCHES = {
  matches: [
    {
      id: 1,
      utcDate: '2026-08-30T19:00:00Z',
      status: 'FINISHED',
      matchday: 3,
      homeTeam: team(524, 'Paris Saint-Germain'),
      awayTeam: team(516, 'Olympique de Marseille'),
      score: { fullTime: { home: 2, away: 1 } },
    },
  ],
}

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })

const mockApi = async (page: Page): Promise<void> => {
  await page.route('**/api/competitions/**', (route) => {
    const path = new URL(route.request().url()).pathname
    const [, , , id, resource] = path.split('/')

    if (resource === 'standings') return json(route, STANDINGS)
    if (resource === 'matches') return json(route, MATCHES)
    if (resource === 'scorers') return json(route, { scorers: [] })

    const competition = COMPETITIONS[id] ?? Object.values(COMPETITIONS).find((c) => String(c.id) === id)
    return competition ? json(route, competition) : json(route, { error: 'Not found' }, 404)
  })
}

test('la page d’accueil liste les championnats', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')

  await expect(page.locator('h1')).toHaveText('Foot')
  for (const { name } of Object.values(COMPETITIONS)) {
    await expect(page.getByRole('button', { name })).toBeVisible()
  }
})

test('ouvrir un championnat affiche son classement et sa dernière journée', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')

  await page.getByRole('button', { name: 'Ligue 1' }).click()

  await expect(page).toHaveURL(/\/championship\/2015$/)
  const table = page.getByRole('table')
  await expect(table.getByText('Paris Saint-Germain')).toBeVisible()
  await expect(table.getByText('Olympique de Marseille')).toBeVisible()
  await expect(table.getByText('Équipe HOME')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Journée 3' })).toBeVisible()
})

test('une erreur de l’API est affichée à l’utilisateur', async ({ page }) => {
  await page.route('**/api/competitions/**', (route) => json(route, { error: 'boom' }, 500))
  await page.goto('/')

  await expect(page.getByText('Impossible de charger les championnats')).toBeVisible()
})

// ── Sélecteur de saison et onglet buteurs ───────────────────────────────────

// Horloge figée : les saisons proposées dépendent de l'année civile (2026, 2025, 2024).
const NOW = new Date('2026-03-15T12:00:00Z')

const standingsForSeason = (season: string) => ({
  standings: [
    {
      stage: 'REGULAR_SEASON',
      type: 'TOTAL',
      group: null,
      table: [standingRow(1, Number(season), `Champion ${season}`, 80)],
    },
  ],
})

const scorers = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    player: { id: i + 1, name: `Buteur ${i + 1}`, nationality: 'France' },
    team: team(524, 'Paris Saint-Germain'),
    goals: 30 - i,
    assists: null,
    penalties: null,
  }))

// Simule l'API en tenant compte de `season` et `limit`, et garde la trace des requêtes.
const mockApiWithParams = async (page: Page): Promise<URL[]> => {
  const requests: URL[] = []
  await page.route('**/api/competitions/**', (route) => {
    const url = new URL(route.request().url())
    requests.push(url)
    const resource = url.pathname.split('/')[4]
    const season = url.searchParams.get('season') ?? 'aucune'

    if (resource === 'standings') return json(route, standingsForSeason(season))
    if (resource === 'matches') return json(route, MATCHES)
    if (resource === 'scorers') {
      return json(route, { scorers: scorers(Number(url.searchParams.get('limit') ?? 10)) })
    }
    return json(route, COMPETITIONS.FL1)
  })
  return requests
}

const requestsFor = (requests: URL[], resource: string) =>
  requests.filter((url) => url.pathname.endsWith(`/${resource}`))

test('les flèches du clavier changent de saison, le focus et le classement suivent', async ({
  page,
}) => {
  await page.clock.setFixedTime(NOW)
  const requests = await mockApiWithParams(page)
  await page.goto('/championship/2015')

  const saisons = page.getByRole('radiogroup', { name: 'Saison' })
  const saison2026 = saisons.getByRole('radio', { name: 'Saison 2026/2027' })
  const saison2025 = saisons.getByRole('radio', { name: 'Saison 2025/2026' })
  const saison2024 = saisons.getByRole('radio', { name: 'Saison 2024/2025' })
  const table = page.getByRole('table')

  await expect(saison2026).toHaveAttribute('aria-checked', 'true')
  await expect(table.getByText('Champion 2026')).toBeVisible()

  await saison2026.focus()
  await page.keyboard.press('ArrowRight')

  await expect(saison2025).toBeFocused()
  await expect(saison2025).toHaveAttribute('aria-checked', 'true')
  await expect(saison2026).toHaveAttribute('aria-checked', 'false')
  await expect(table.getByText('Champion 2025')).toBeVisible()

  // Depuis la première saison, la flèche gauche boucle sur la dernière
  await page.keyboard.press('ArrowLeft')
  await expect(saison2026).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(saison2024).toBeFocused()
  await expect(saison2024).toHaveAttribute('aria-checked', 'true')
  await expect(table.getByText('Champion 2024')).toBeVisible()

  expect(requestsFor(requests, 'standings').map((url) => url.searchParams.get('season'))).toEqual(
    ['2026', '2025', '2024'],
  )
})

test("l'onglet buteurs suit la saison choisie et le nombre de buteurs demandé", async ({
  page,
}) => {
  await page.clock.setFixedTime(NOW)
  const requests = await mockApiWithParams(page)
  await page.goto('/championship/2015')

  await page.getByRole('radio', { name: 'Saison 2025/2026' }).click()
  await page.getByRole('button', { name: 'Buteurs' }).click()

  await expect(page.getByRole('button', { name: 'Buteurs' })).toHaveAttribute('aria-pressed', 'true')
  const lignes = page.getByRole('table').locator('tbody tr')
  await expect(lignes).toHaveCount(10)
  await expect(lignes.first()).toContainText('Buteur 1')

  await page.getByRole('combobox').selectOption('5')
  await expect(lignes).toHaveCount(5)

  const scorersRequests = requestsFor(requests, 'scorers').map((url) => ({
    season: url.searchParams.get('season'),
    limit: url.searchParams.get('limit'),
  }))
  expect(scorersRequests).toEqual([
    { season: '2025', limit: '10' },
    { season: '2025', limit: '5' },
  ])
})
