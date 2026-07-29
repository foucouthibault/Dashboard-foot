<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useMatchesStore } from '@/stores/matches'
import type { Match } from '@/types'

interface Props {
  championshipId: string
}

const MATCH_STATUS_LABELS: Record<string, string> = {
  FINISHED: 'Terminé',
  LIVE: 'En direct',
  TIMED: 'À venir',
}

const props = withDefaults(defineProps<Props>(), {
  championshipId: 'FL1',
})

const matchesStore = useMatchesStore()

const matches = computed<Match[]>(() => matchesStore.getMatches(props.championshipId))
const currentMatchday = computed<number>(() => matchesStore.getMatchday(props.championshipId))
const loading = computed<boolean>(() => matchesStore.isLoading(props.championshipId))
const error = computed<string | null>(() => matchesStore.getError(props.championshipId))

onMounted(() => matchesStore.fetchMatches(props.championshipId))

watch(
  () => props.championshipId,
  () => matchesStore.fetchMatches(props.championshipId),
)

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Date non disponible'
  }
}

const getMatchStatus = (match: Match): string => MATCH_STATUS_LABELS[match.status] || match.status
const isMatchFinished = (match: Match): boolean => match.status === 'FINISHED'
</script>

<template>
  <div class="matchday-container">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Chargement des matchs...
    </div>
    <div v-else-if="error" class="error">
      <span class="error-icon">⚠️</span>
      {{ error }}
    </div>
    <div v-else>
      <h2 class="matchday-title">Journée {{ currentMatchday }}</h2>

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
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;700&display=swap');

.matchday-container {
  padding: 1.5rem;
  background: linear-gradient(180deg, rgba(46, 125, 90, 0.6) 0%, rgba(30, 95, 122, 0.6) 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.matchday-title {
  font-family: 'Bebas Neue', sans-serif;
  color: #FFD700;
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 215, 0, 0.3);
  border-top-color: #FFD700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  padding: 1.5rem;
  color: #D32F2F;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
  background: rgba(211, 47, 47, 0.1);
  border-radius: 8px;
}

.error-icon {
  font-size: 1.2rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
  font-style: italic;
  font-family: 'Inter', sans-serif;
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.match-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 4px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
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
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.8) 0%, rgba(255, 165, 0, 0.8) 100%);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.match-card:hover {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.2);
  transform: translateY(-2px);
}

.match-card:hover::before {
  transform: scaleY(1);
}

.match-card.finished {
  border-left-color: #4CAF50;
  background: rgba(76, 175, 80, 0.05);
}

.match-card.finished::before {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
}

.match-date {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
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
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  color: #FFFFFF;
  font-size: 0.95rem;
  line-height: 1.4;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.score {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.8) 0%, rgba(255, 165, 0, 0.8) 100%);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.score-value {
  font-family: 'Roboto Mono', monospace;
  font-weight: 700;
  color: #121212;
  font-size: 1.2rem;
  letter-spacing: 1px;
}

.status-badge {
  font-family: 'Bebas Neue', sans-serif;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.8) 0%, rgba(255, 165, 0, 0.8) 100%);
  color: #121212;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.home-team {
  text-align: right;
}

.away-team {
  text-align: left;
}
</style>
