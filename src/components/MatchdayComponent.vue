<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { getCompetitionMatches } from '@/api/matches.ts'

interface Props {
  championshipId: string
}

const props = withDefaults(defineProps<Props>(), {
  championshipId: 'FL1'
})

interface Match {
  id: number
  utcDate: string
  status: string
  homeTeam: {
    name: string
    id: number
  }
  awayTeam: {
    name: string
    id: number
  }
  score: {
    fullTime: {
      home: number | null
      away: number | null
    }
  }
  matchday: number
}

const matches = ref<Match[]>([])
const currentMatchday = ref<number>(0)
const loading = ref(false)
const error = ref<string | null>(null)

const loadMatchday = async () => {
  loading.value = true
  error.value = null

  try {
    const matchesData = await getCompetitionMatches(props.championshipId)
    console.log('All matches:', matchesData)

    let allMatches = []
    if (matchesData.matches) {
      allMatches = Array.isArray(matchesData.matches) ? matchesData.matches : [matchesData.matches]
    }

    const finishedMatches = allMatches.filter((m: Match) => m.status === 'FINISHED')

    if (finishedMatches.length > 0) {
      const maxMatchday = Math.max(...finishedMatches.map((m: Match) => m.matchday || 0))
      currentMatchday.value = maxMatchday
      matches.value = finishedMatches.filter((m: Match) => m.matchday === maxMatchday)
    } else {
      error.value = 'Aucun match terminé disponible'
    }
  } catch (err) {
    console.error('Erreur lors du chargement de la journée:', err)
    error.value = 'Impossible de charger les matchs de la journée'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Date non disponible'
  }
}

const getMatchStatus = (match: Match): string => {
  if (match.status === 'FINISHED') return 'Terminé'
  if (match.status === 'LIVE') return 'En direct'
  if (match.status === 'TIMED') return 'À venir'
  return match.status
}

const isMatchFinished = (match: Match): boolean => {
  return match.status === 'FINISHED'
}

onMounted(() => {
  loadMatchday()
})

watch(() => props.championshipId, () => {
  loadMatchday()
})
</script>

<template>
  <div class="matchday-container">
    <div v-if="loading" class="loading">Chargement des matchs...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <h2>Journée {{ currentMatchday }}</h2>

      <div v-if="matches.length > 0" class="matches-list">
        <div
          v-for="match in matches"
          :key="match.id"
          class="match-card"
          :class="{ finished: isMatchFinished(match) }"
        >
          <div class="match-date">
            {{ formatDate(match.utcDate) }}
          </div>

          <div class="match-content">
            <div class="team home-team">
              <span class="team-name">{{ match.homeTeam.name }}</span>
            </div>

            <div class="score">
              <span v-if="isMatchFinished(match)" class="score-value">
                {{ match.score.fullTime.home }} - {{ match.score.fullTime.away }}
              </span>
              <span v-else class="status-badge">{{ getMatchStatus(match) }}</span>
            </div>

            <div class="team away-team">
              <span class="team-name">{{ match.awayTeam.name }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        Aucun match disponible pour cette journée
      </div>
    </div>
  </div>
</template>

<style scoped>
.matchday-container {
  padding: 1rem;
  background-color: #ffffff;
  border-radius: 8px;
}

h2 {
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #d32f2f;
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.match-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #e0e0e0;
  padding: 1rem;
  transition: all 0.2s;
}

.match-card:hover {
  background-color: #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left-color: #0066cc;
}

.match-card.finished {
  border-left-color: #4caf50;
  background-color: #f1f8f4;
}

.match-date {
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.match-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.team {
  flex: 1;
  text-align: center;
}

.team-name {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.score {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.score-value {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.2rem;
}

.status-badge {
  background-color: #0066cc;
  color: #ffffff;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.home-team {
  text-align: right;
}

.away-team {
  text-align: left;
}
</style>
