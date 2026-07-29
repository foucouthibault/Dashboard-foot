<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useScorersStore } from '@/stores/scorers'
import type { Scorer } from '@/types'

interface Props {
  championshipId: string
}

const props = withDefaults(defineProps<Props>(), {
  championshipId: 'FL1',
})

const scorersStore = useScorersStore()

const scorers = computed<Scorer[]>(() => scorersStore.getScorers(props.championshipId))
const loading = computed<boolean>(() => scorersStore.isLoading(props.championshipId))
const error = computed<string | null>(() => scorersStore.getError(props.championshipId))

const PLACEHOLDER_CREST =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="%232E7D5A" rx="12"/><circle cx="12" cy="12" r="8" fill="%23FFFFFF"/><circle cx="12" cy="12" r="4" fill="%232E7D5A"/></svg>'

onMounted(() => scorersStore.fetchScorers(props.championshipId))

watch(
  () => props.championshipId,
  () => scorersStore.fetchScorers(props.championshipId),
)
</script>

<template>
  <div class="scorers-container">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Chargement des buteurs...
    </div>
    <div v-else-if="error" class="error">
      <span class="error-icon">⚠️</span>
      {{ error }}
    </div>
    <div v-else>
      <h2 class="scorers-title">Meilleurs Buteurs</h2>
      <table class="scorers-table">
        <thead>
          <tr>
            <th class="rank-col">#</th>
            <th class="player-col">Joueur</th>
            <th class="team-col">Équipe</th>
            <th class="goals-col">⚽ Buts</th>
            <th class="assists-col">🎯 Passes D.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(scorer, index) in scorers" :key="scorer.player.id" class="scorer-row" :class="{ even: index % 2 === 0 }">
            <td class="rank-col">
              <span class="rank-badge" :class="{ top3: index < 3 }">{{ index + 1 }}</span>
            </td>
            <td class="player-col">
              <div class="player-info">
                <span class="player-name">{{ scorer.player.name }}</span>
                <span class="player-nationality">{{ scorer.player.nationality }}</span>
              </div>
            </td>
            <td class="team-col">
              <div class="team-info">
                <img
                  :src="scorer.team.crest || PLACEHOLDER_CREST"
                  :alt="scorer.team.name"
                  class="team-crest"
                  width="22"
                  height="22"
                />
                <span class="team-name">{{ scorer.team.name }}</span>
              </div>
            </td>
            <td class="goals-col">
              <span class="goals-value">{{ scorer.goals }}</span>
            </td>
            <td class="assists-col">{{ scorer.assists ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.scorers-container {
  width: 100%;
}

.scorers-title {
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

.scorers-table {
  width: 100%;
  border-collapse: collapse;
  background: linear-gradient(180deg, rgba(46, 125, 90, 0.6) 0%, rgba(30, 95, 122, 0.6) 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  font-size: 0.95rem;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.scorers-table th {
  color: #FFD700 !important;
  font-family: 'Bebas Neue', sans-serif;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  padding: 1rem 0.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
}

.scorers-table td {
  padding: 1rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
}

.scorer-row {
  transition: all 0.2s;
}

.scorer-row:hover {
  background: rgba(255, 255, 255, 0.08);
}

.scorer-row.even {
  background: rgba(255, 255, 255, 0.05);
}

.rank-col {
  width: 6%;
  text-align: center;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-family: 'Roboto Mono', monospace;
  font-weight: 700;
  font-size: 0.85rem;
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.2);
}

.rank-badge.top3 {
  background: #FFD700;
  color: #121212;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.player-col {
  width: 30%;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.player-name {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  color: #FFFFFF;
  display: block;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.player-nationality {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.7);
  display: block;
}

.team-col {
  width: 34%;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-crest {
  object-fit: contain;
  flex-shrink: 0;
  border-radius: 50%;
  background: #FFFFFF;
  padding: 2px;
}

.team-name {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #FFFFFF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.goals-col {
  width: 15%;
  text-align: center;
}

.goals-value {
  font-family: 'Roboto Mono', monospace;
  font-weight: 700;
  color: #FFD700;
  font-size: 1.1rem;
}

.assists-col {
  width: 15%;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-family: 'Roboto Mono', monospace;
}
</style>
