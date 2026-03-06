<script setup lang="ts">
import type { StandingRow } from '@/types'

interface Props {
  rows: StandingRow[]
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
})
</script>

<template>
  <div>
    <div v-if="props.loading" class="loading">Chargement...</div>
    <div v-else-if="props.error" class="error">{{ props.error }}</div>
    <table v-else class="standings-table">
      <thead>
        <tr>
          <th class="position-col">#</th>
          <th class="team-col">Équipe</th>
          <th class="matches-col">J</th>
          <th class="record-col">V-N-D</th>
          <th class="goals-col">+/-</th>
          <th class="points-col">PTS</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="position in props.rows"
          :key="position.team.id"
          class="team-row"
        >
          <td class="position-col">{{ position.position }}</td>
          <td class="team-col">{{ position.team.name }}</td>
          <td class="matches-col">{{ position.playedGames }}</td>
          <td class="record-col">{{ position.won }}-{{ position.draw }}-{{ position.lost }}</td>
          <td class="goals-col">
            {{ position.goalDifference > 0 ? '+' : '' }}{{ position.goalDifference }}
          </td>
          <td class="points-col">{{ position.points }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.loading {
  text-align: center;
  padding: 2rem;
  color: #2c3e50;
  font-size: 1rem;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #d32f2f;
  font-size: 0.95rem;
  font-weight: 500;
}

.standings-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #ffffff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-size: 0.95rem;
  table-layout: fixed;
}

.standings-table th,
.standings-table td {
  padding: 16px 8px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
  color: #333333;
}

.standings-table th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.team-row {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.team-row:hover {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  box-shadow: inset 0 0 20px rgba(102, 126, 234, 0.1);
}

.position-col {
  width: 8%;
  text-align: center;
  font-weight: 700;
  color: #667eea;
  position: relative;
}

.team-col {
  width: 46%;
  text-align: left;
  font-weight: 500;
  white-space: normal;
  overflow: visible;
}

.matches-col {
  width: 8%;
  text-align: center;
  font-size: 0.9rem;
}

.record-col {
  width: 18%;
  text-align: center;
  font-size: 0.85rem;
  color: #666;
}

.goals-col {
  width: 10%;
  text-align: center;
  font-size: 0.9rem;
}

.points-col {
  width: 10%;
  text-align: center;
  font-weight: 700;
  color: #764ba2;
  font-size: 1.1rem;
}
</style>
