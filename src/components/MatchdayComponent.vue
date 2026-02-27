<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { getCompetitionMatches } from '@/api/matches'

// Types
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

interface Props {
  championshipId: string
}

// Constants
const MATCH_STATUS_LABELS: Record<string, string> = {
  'FINISHED': 'Terminé',
  'LIVE': 'En direct',
  'TIMED': 'À venir'
}

// Props
const props = withDefaults(defineProps<Props>(), {
  championshipId: 'FL1'
})

// State
const matches = ref<Match[]>([])
const currentMatchday = ref<number>(0)
const loading = ref(false)
const error = ref<string | null>(null)

// Lifecycle
onMounted((): void => {
  loadMatchday()
})

watch(
  () => props.championshipId,
  (): void => {
    loadMatchday()
  }
)

// Methods
const loadMatchday = async (): Promise<void> => {
  loading.value = true
  error.value = null

  try {
    const matchesData = await getCompetitionMatches(props.championshipId)
    const allMatches = matchesData.matches
      ? Array.isArray(matchesData.matches)
        ? matchesData.matches
        : [matchesData.matches]
      : []

    const finishedMatches = allMatches.filter((m: Match): boolean => m.status === 'FINISHED')

    if (finishedMatches.length > 0) {
      const maxMatchday = Math.max(...finishedMatches.map((m: Match): number => m.matchday || 0))
      currentMatchday.value = maxMatchday
      matches.value = finishedMatches.filter((m: Match): boolean => m.matchday === maxMatchday)
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
  return MATCH_STATUS_LABELS[match.status] || match.status
}

const isMatchFinished = (match: Match): boolean => {
  return match.status === 'FINISHED'
}
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
  padding: 2.5rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-size: 0.95rem;
}

.error {
  color: #d32f2f;
  font-weight: 500;
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.match-card {
  background-color: #f9f9f9;
  border-radius: 10px;
  border-left: 4px solid #e0e0e0;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.match-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.match-card:hover {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.match-card:hover::before {
  transform: scaleY(1);
}

.match-card.finished {
  border-left-color: #4caf50;
  background-color: #f1f8f4;
}

.match-card.finished::before {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
}

.match-date {
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
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
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
  line-height: 1.4;
}

.score {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
}

.score-value {
  font-weight: 700;
  color: #ffffff;
  font-size: 1.3rem;
  letter-spacing: 1px;
}

.status-badge {
  background-color: #667eea;
  color: #ffffff;
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.home-team {
  text-align: right;
}

.away-team {
  text-align: left;
}
</style>
