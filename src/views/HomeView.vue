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
}

.hero {
  text-align: center;
  padding: 3rem 4rem 2rem;
}

.hero h1 {
  color: #2c3e50;
  font-size: 2.8rem;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
  letter-spacing: -1px;
}

.hero p {
  color: #666;
  font-size: 1.05rem;
  margin: 0;
}
</style>
