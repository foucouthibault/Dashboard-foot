<script setup lang="ts">
import { ref } from 'vue'
import CompetitionList from '@/components/CompetitionList.vue'
import StandingsComponent from '@/components/StandingsComponent.vue'
import ChampionshipsSelector from '@/components/ChampionshipsSelector.vue'

const selectedChampionshipId = ref<string>('FL1')

const onChampionshipSelect = (id: string) => {
  selectedChampionshipId.value = id
}
</script>

<template>
  <div>
    <CompetitionList />
    <ChampionshipsSelector @championship-selected="onChampionshipSelect" />
    <StandingsComponent :championship-id="selectedChampionshipId" />
  </div>
</template>

<style scoped>

</style>
