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
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><rect width="100%" height="100%" fill="%23eee" rx="4"/></svg>'

onMounted(() => scorersStore.fetchScorers(props.championshipId))

watch(
  () => props.championshipId,
  () => scorersStore.fetchScorers(props.championshipId),
)
</script>

<template>
  <div class="scorers-container">
    <div v-if="loading" class="loading">Chargement des buteurs...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <table v-else class="scorers-table">
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
        <tr v-for="(scorer, index) in scorers" :key="scorer.player.id" class="scorer-row">
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
</template>

<style scoped>
.scorers-container {
  width: 100%;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-size: 0.95rem;
}

.error {
  color: #d32f2f;
}

.scorers-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-size: 0.95rem;
  table-layout: fixed;
}

.scorers-table th,
.scorers-table td {
  padding: 14px 10px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
  color: #333333;
}

.scorers-table th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.scorer-row {
  transition: background 0.2s;
}

.scorer-row:hover {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
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
  font-weight: 700;
  font-size: 0.85rem;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.rank-badge.top3 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
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
  font-weight: 600;
  color: #2c3e50;
  display: block;
}

.player-nationality {
  font-size: 0.78rem;
  color: #999;
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
}

.team-name {
  font-size: 0.9rem;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goals-col {
  width: 15%;
  text-align: center;
}

.goals-value {
  font-weight: 700;
  color: #764ba2;
  font-size: 1.1rem;
}

.assists-col {
  width: 15%;
  text-align: center;
  color: #667eea;
  font-weight: 600;
}
</style>



