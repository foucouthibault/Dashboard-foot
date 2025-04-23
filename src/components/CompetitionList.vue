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
    console.error('Erreur lors du chargement de la compétition', err)
  }
})
</script>

<template>
  <div>
    <h1>{{ competition?.name }}</h1>
    <div>
      <img alt="Logo compétition" v-bind:src=competition?.emblem>
    </div>
  </div>
</template>

<style scoped></style>
