<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCompetition } from '@/api/competitions.ts'

interface Competition {
  id: number
  name: string
  emblem: string
}

const competition = ref<Competition>()

onMounted(async () => {
  try {
    competition.value = await getCompetition()
  } catch (err) {
    console.error('Erreur lors du chargement des joueurs', err)
  }
})
</script>

<template>
  <div>
    <div>
      <img alt="logo" v-bind:src=competition?.emblem>
    </div>
    <div>
      {{ competition?.name }}
    </div>
  </div>
</template>

<style scoped></style>
