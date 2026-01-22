<script setup lang="ts">
import { getCompetitionStandings } from '@/api/standings.ts'
import { onMounted, ref, watch } from 'vue'
import MatchdayComponent from './MatchdayComponent.vue'

interface Team {
  id: number
  name: string
}

interface Position {
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

interface Standing {
  table: Position[]
}

interface Standings {
  standings: Standing[]
}

interface Props {
  championshipId: string
}

const props = withDefaults(defineProps<Props>(), {
  championshipId: 'FL1'
})

const standings = ref<Standings>()
const loading = ref(false)

const loadStandings = async () => {
  loading.value = true
  try {
    standings.value = await getCompetitionStandings(props.championshipId)
  } catch (err) {
    console.error('Erreur lors du chargement des standings', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStandings()
})

watch(() => props.championshipId, () => {
  loadStandings()
})
</script>

<template>
  <div class="standings-wrapper">
    <div class="standings-section">
      <div v-if="loading" class="loading">Chargement...</div>
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
          <tr v-for="position in standings?.standings?.[0]?.table" :key="position.team.id" class="team-row">
            <td class="position-col">{{ position.position }}</td>
            <td class="team-col">{{ position.team.name }}</td>
            <td class="matches-col">{{ position.playedGames }}</td>
            <td class="record-col">{{ position.won }}-{{ position.draw }}-{{ position.lost }}</td>
            <td class="goals-col">{{ position.goalDifference > 0 ? '+' : '' }}{{ position.goalDifference }}</td>
            <td class="points-col">{{ position.points }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="matchday-section">
      <MatchdayComponent :championship-id="props.championshipId" />
    </div>
  </div>
</template>

<style scoped>
.standings-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.standings-section {
  display: flex;
  flex-direction: column;
}

.matchday-section {
  display: flex;
  flex-direction: column;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #2c3e50;
  font-size: 1rem;
}

.standings-table {
  width: 100%;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-size: 0.9rem;
}

.standings-table thead {
  background-color: #2c3e50;
  font-weight: bold;
  color: #ffffff;
}

.standings-table th,
.standings-table td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
  color: #333333;
}

.standings-table th {
  background-color: #2c3e50;
  color: #ffffff;
  font-size: 0.85rem;
}

.team-row {
  transition: all 0.2s;
}

.team-row:hover {
  background-color: #e8f4f8;
}


.position-col {
  width: 8%;
  text-align: center;
  font-weight: 600;
}

.team-col {
  width: 45%;
  text-align: left;
}

.matches-col {
  width: 8%;
  text-align: center;
}

.record-col {
  width: 18%;
  text-align: center;
  font-size: 0.85rem;
}

.goals-col {
  width: 10%;
  text-align: center;
}

.points-col {
  width: 11%;
  text-align: right;
  font-weight: 600;
}

@media (max-width: 1200px) {
  .standings-wrapper {
    grid-template-columns: 1fr;
  }
}
</style>
