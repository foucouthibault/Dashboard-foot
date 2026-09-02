// ─── Shared primitives ───────────────────────────────────────────────────────

export interface Team {
  id: number
  name: string
  crest?: string
}

// ─── Competition ─────────────────────────────────────────────────────────────

export interface Competition {
  id: string | number
  name: string
  emblem?: string | null
}

// ─── Standings ───────────────────────────────────────────────────────────────

export interface StandingRow {
  position: number
  team: Team
  points: number
  playedGames: number
  won: number
  draw: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

export interface StandingGroup {
  stage: string
  type: 'TOTAL' | 'HOME' | 'AWAY'
  group: string | null
  table: StandingRow[]
}

export interface StandingsResponse {
  standings: StandingGroup[]
}

// ─── Matches ─────────────────────────────────────────────────────────────────

export interface MatchScore {
  fullTime: {
    home: number | null
    away: number | null
  }
}

export interface Match {
  id: number
  utcDate: string
  status: string
  matchday: number
  homeTeam: Team
  awayTeam: Team
  score: MatchScore
}

export interface MatchesResponse {
  matches: Match[]
}

// ─── Scorers ─────────────────────────────────────────────────────────────────

export interface Scorer {
  player: {
    id: number
    name: string
    nationality: string
  }
  team: Team
  goals: number
  assists: number | null
  penalties: number | null
}

export interface ScorersResponse {
  scorers: Scorer[]
}

