<script setup lang="ts">
import ChampionshipsSelector from '@/components/ChampionshipsSelector.vue'
</script>

<template>
  <div class="home-view">
    <div class="hero">
      <h1>⚽ Football Dashboard</h1>
      <p>Sélectionnez un championnat pour voir le classement et les matchs</p>
    </div>
    <ChampionshipsSelector />
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  align-items: center;
}

.hero {
  text-align: center;
  padding: 4rem 4rem 2rem;
  width: 100%;
  max-width: 800px;
}

.hero h1 {
  font-family: 'Bebas Neue', sans-serif;
  color: #FFD700;
  font-size: 3.5rem;
  margin: 0 0 1rem 0;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.hero p {
  font-family: 'Inter', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  margin: 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}
</style>
