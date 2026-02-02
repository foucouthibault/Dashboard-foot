<script setup lang="ts">
import { ref, watch } from 'vue'
import { getTeamMatches, getMatchDetails } from '@/api/matches.ts'

interface Props {
  teamId: number | null
  teamName: string
}

const props = withDefaults(defineProps<Props>(), {
  teamId: null,
  teamName: ''
})

interface Player {
  id: number
  name: string
  position: string
  shirtNumber: number
}

interface Team {
  id: number
  name: string
  shortName: string
  formation?: string
  lineup?: ApiPlayer[]
}

interface ApiPlayer {
  id: number
  name: string
  position?: string
  shirtNumber: number
}

interface Score {
  fullTime: {
    home: number | null
    away: number | null
  }
}

interface Match {
  id: number
  utcDate: string
  status: string
  homeTeam: Team
  awayTeam: Team
  score: Score
}

const matches = ref<Match[]>([])
const selectedMatch = ref<Match | null>(null)
const lineupHome = ref<Player[]>([])
const lineupAway = ref<Player[]>([])
const loading = ref(false)

const loadMatches = async () => {
  if (!props.teamId) return

  loading.value = true
  try {
    const data = await getTeamMatches(props.teamId)
    console.log('Matches list from teams endpoint:', data)

    // Gérer différentes structures possibles de l'API
    let matchesList = []
    if (data.matches) {
      matchesList = Array.isArray(data.matches) ? data.matches : [data.matches]
    } else if (Array.isArray(data)) {
      matchesList = data
    }

    matches.value = matchesList

    // Sélectionner le dernier match et charger ses détails
    if (matchesList.length > 0) {
      const lastMatch = matchesList[0]
      console.log('Last match found:', lastMatch)

      // Charger les détails complets du match (avec lineups) via l'endpoint /matches/{id}
      try {
        const fullMatchData = await getMatchDetails(lastMatch.id)
        console.log('Full match data from /matches endpoint:', fullMatchData)

        // Extraire le match de la réponse (peut être { match: {...} } ou directement {...})
        const matchData = fullMatchData.match || fullMatchData
        selectedMatch.value = matchData
        extractLineup(matchData)
      } catch (err) {
        console.error('Impossible de charger les détails du match:', err)
        selectedMatch.value = lastMatch
        extractLineup(lastMatch)
      }
    }
  } catch (err) {
    console.error('Erreur lors du chargement des matchs', err)
  } finally {
    loading.value = false
  }
}

/**
 * Extrait les lineups (compositions) d'un match
 * @param match - Le match dont on extrait les lineups
 */
const extractLineup = (match: Match): void => {
  console.log('Extracting lineup from match:', match)

  lineupHome.value = []
  lineupAway.value = []

  // La structure correcte: match.homeTeam.lineup et match.awayTeam.lineup
  if (match.homeTeam?.lineup && Array.isArray(match.homeTeam.lineup)) {
    lineupHome.value = match.homeTeam.lineup.map((player: ApiPlayer): Player => ({
      id: player.id || Math.random(),
      name: player.name || 'Joueur inconnu',
      position: player.position || 'N/A',
      shirtNumber: player.shirtNumber || -1
    }))
  }

  if (match.awayTeam?.lineup && Array.isArray(match.awayTeam.lineup)) {
    lineupAway.value = match.awayTeam.lineup.map((player: ApiPlayer): Player => ({
      id: player.id || Math.random(),
      name: player.name || 'Joueur inconnu',
      position: player.position || 'N/A',
      shirtNumber: player.shirtNumber || -1
    }))
  }

  console.log('Lineups extracted:', {
    home: lineupHome.value.length,
    away: lineupAway.value.length
  })
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Date non disponible'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Date non disponible'
    }
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'Date non disponible'
  }
}

watch(() => props.teamId, () => {
  loadMatches()
})
</script>

<template>
  <div class="lineup-container">
    <div v-if="!teamId" class="empty-state">
      Sélectionnez une équipe pour voir son dernier onze
    </div>
    <div v-else>
      <h2>{{ teamName }}</h2>

      <div v-if="loading" class="loading">Chargement...</div>
      <div v-else-if="selectedMatch">
        <div class="match-info">
          <p class="match-label">Dernier match</p>
          <p class="match-date">{{ formatDate(selectedMatch.utcDate) }}</p>
          <p v-if="selectedMatch.score" class="match-score">
            {{ selectedMatch.homeTeam?.name }} <strong>{{ selectedMatch.score.fullTime?.home }}</strong> - <strong>{{ selectedMatch.score.fullTime?.away }}</strong> {{ selectedMatch.awayTeam?.name }}
          </p>
        </div>

        <div class="lineup">
          <div class="team-lineup">
            <h3>{{ selectedMatch.homeTeam?.name }}</h3>
            <div v-if="selectedMatch.homeTeam?.formation" class="formation">
              Formation: {{ selectedMatch.homeTeam.formation }}
            </div>
            <ul v-if="lineupHome.length > 0" class="players-list">
              <li v-for="player in lineupHome" :key="player.id" class="player-item">
                <span class="shirt-number">{{ player.shirtNumber }}</span>
                <span class="player-name">{{ player.name }}</span>
                <span class="position">{{ player.position }}</span>
              </li>
            </ul>
            <div v-else class="no-lineup">
              Composition d'équipe non disponible
            </div>
          </div>

          <div class="team-lineup">
            <h3>{{ selectedMatch.awayTeam?.name }}</h3>
            <div v-if="selectedMatch.awayTeam?.formation" class="formation">
              Formation: {{ selectedMatch.awayTeam.formation }}
            </div>
            <ul v-if="lineupAway.length > 0" class="players-list">
              <li v-for="player in lineupAway" :key="player.id" class="player-item">
                <span class="shirt-number">{{ player.shirtNumber }}</span>
                <span class="player-name">{{ player.name }}</span>
                <span class="position">{{ player.position }}</span>
              </li>
            </ul>
            <div v-else class="no-lineup">
              Composition d'équipe non disponible
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        Aucun match disponible pour cette équipe
      </div>
    </div>
  </div>
</template>

<style scoped>
.lineup-container {
  padding: 1rem;
  background-color: #ffffff;
  border-radius: 8px;
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-size: 0.95rem;
}

h2 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #2c3e50;
}

.match-info {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
}

.match-info p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.match-label {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 0.5rem;
}

.match-date {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1rem;
}

.match-score {
  color: #0066cc;
  font-weight: 500;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.lineup {
  display: flex;
  gap: 2rem;
}

.team-lineup {
  flex: 1;
}

.team-lineup h3 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.formation {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.75rem;
  font-style: italic;
}

.no-lineup {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-size: 0.9rem;
}

.players-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #f9f9f9;
  border-radius: 6px;
  border-left: 3px solid #0066cc;
  font-size: 0.85rem;
}

.shirt-number {
  background-color: #0066cc;
  color: #ffffff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.player-name {
  font-weight: 500;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.position {
  background-color: #e3f2fd;
  color: #0066cc;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
