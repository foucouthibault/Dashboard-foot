<script setup lang="ts">
import { ref } from 'vue'

interface Player {
  name: string
}

const players = ref<Player[]>([
  { name: 'Mbappé' },
  { name: 'Griezmann' },
  { name: 'Benzema' },
])

function addPlayer() {
  players.value.push({ name: 'Giroud' })
}

function removePlayer(index: number) {
  players.value.splice(index, 1)
}
</script>

<template>
  <div>
    <h2>List des joueurs</h2>

    <ul>
      <li v-for="(player, index) in players" :key="index">
        {{ player.name }}
        <button @click="removePlayer(index)">Retirer</button>
      </li>
    </ul>

    <button @click="addPlayer()">Ajouter un joueur</button>
  </div>
</template>

<style scoped>
button {
  margin-left: 10px;
  padding: 5px;
}
</style>
