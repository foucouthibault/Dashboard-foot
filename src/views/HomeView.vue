<script setup lang="ts">
import { ref } from 'vue'
import StandingsComponent from '@/components/StandingsComponent.vue'
import ChampionshipsSelector from '@/components/ChampionshipsSelector.vue'

const selectedChampionshipId = ref<string>('FL1')

const onChampionshipSelect = (id: string): void => {
  selectedChampionshipId.value = id
}
</script>

<template>
  <div class="home-view">
    <div>
      <h1>⚽ Football Dashboard</h1>
      <p>Suivez les classements des grands championnats européens</p>
    </div>
    <ChampionshipsSelector @championship-selected="onChampionshipSelect" />
    <StandingsComponent :championship-id="selectedChampionshipId" />
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 3rem 0;
  width: 100%;
  min-height: 100vh;
}

.home-view h1 {
  text-align: center;
  color: #2c3e50;
  font-size: 2.8rem;
  margin: 1rem 0 0.5rem 0;
  font-weight: 700;
  letter-spacing: -1px;
  padding: 0 4rem;
}

.home-view p {
  text-align: center;
  color: #666;
  font-size: 1.05rem;
  margin: 0 0 1rem 0;
  padding: 0 4rem;
}
</style>
