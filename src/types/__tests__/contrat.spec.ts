import { describe, expectTypeOf, it } from 'vitest'
import type { components } from '@/types/api.generated'
import type { Competition, MatchesResponse, ScorersResponse, StandingsResponse } from '@/types'

/**
 * Contrat avec le backend : chaque réponse décrite dans openapi.json (types générés par
 * `npm run api:types`) doit être utilisable là où le frontend attend ses propres types.
 * La vérification a lieu à la compilation (`npm run type-check`) : un champ retiré ou renommé
 * côté backend, ou dont le type change, fait échouer la CI. La CI télécharge d'abord le
 * openapi.json de la branche main du backend (`npm run api:sync`).
 */
type Schemas = components['schemas']

describe('contrat avec le backend (openapi.json)', () => {
  it('la compétition renvoyée satisfait le type Competition', () => {
    expectTypeOf<Schemas['CompetitionResponse']>().toExtend<Competition>()
  })

  it('le classement renvoyé satisfait le type StandingsResponse', () => {
    expectTypeOf<Schemas['StandingsResponse']>().toExtend<StandingsResponse>()
  })

  it('les matchs renvoyés satisfont le type MatchesResponse', () => {
    expectTypeOf<Schemas['MatchesResponse']>().toExtend<MatchesResponse>()
  })

  it('les buteurs renvoyés satisfont le type ScorersResponse', () => {
    expectTypeOf<Schemas['ScorersResponse']>().toExtend<ScorersResponse>()
  })
})
