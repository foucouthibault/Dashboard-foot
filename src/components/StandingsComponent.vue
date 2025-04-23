<script setup lang="ts">
import { getCompetitionStandings } from '@/api/standings.ts'
import { onMounted, ref } from 'vue'

interface Team {
  id: number
  name: string
}

interface Position {
  position: number
  team: Team
  points: number
}

interface Standing {
  table: Position[]
}

interface Standings {
  standings: Standing[]
}

const standings = ref<Standings>()

onMounted(async () => {
  try {
    standings.value = await getCompetitionStandings()
  } catch (err) {
    console.error('Erreur lors du chargement des standings', err)
  }
})

</script>

<template>
  <table>
    <thead>
    <tr>
      <th>Position</th>
      <th>Équipe</th>
      <th>Points</th>
    </tr>
    </thead>
    <tbody>
    <div v-for="(standing, index) in standings?.standings" :key="index">
      <tr v-for="(position, index) in standing.table" :key="index">
        <td>{{ position.position }}</td>
        <td>{{ position.team.name }}</td>
        <td>{{ position.points }}</td>
      </tr>
    </div>
    </tbody>
  </table>
</template>

<style scoped>

</style>
