<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCompetitionsStore } from '@/stores/competitions'

const PLACEHOLDER_EMBLEM =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="100%" height="100%" fill="%232E7D5A"/><circle cx="60" cy="40" r="20" fill="%23FFFFFF"/><circle cx="60" cy="40" r="10" fill="%232E7D5A"/></svg>'

const router = useRouter()
const competitionsStore = useCompetitionsStore()

onMounted(() => competitionsStore.fetchCompetitions())

const selectChampionship = (id: string): void => {
  router.push({ name: 'championship', params: { id } })
}
</script>

<template>
  <div class="championships-container">
    <div v-if="competitionsStore.loading" class="loading">Chargement des championnats...</div>
    <div v-else-if="competitionsStore.error" class="error">{{ competitionsStore.error }}</div>
    <ul v-else class="championships-list">
      <li
        v-for="c in competitionsStore.competitions"
        :key="c.id"
        class="championship-item"
        @click="selectChampionship(String(c.id))"
      >
        <img
          :src="c.emblem || PLACEHOLDER_EMBLEM"
          :alt="c.name"
          width="70"
          height="70"
        />
        <div class="championship-name">{{ c.name }}</div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.championships-container {
  padding: 2rem 4rem;
  width: 100%;
  box-sizing: border-box;
}

.loading {
  padding: 3rem;
  color: #FFD700;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

.championships-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.championship-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(46, 125, 90, 0.8) 0%, rgba(30, 95, 122, 0.8) 100%);
  border: 2px solid rgba(255, 215, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.championship-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.championship-item:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.3);
  border-color: #FFD700;
}

.championship-item:hover::before {
  left: 100%;
}

.championship-name {
  font-family: 'Bebas Neue', sans-serif;
  font-weight: 400;
  color: #FFFFFF;
  font-size: 1rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  transition: all 0.3s;
}

.championship-item:hover .championship-name {
  color: #FFD700;
  transform: scale(1.05);
}

img {
  transition: all 0.3s;
  filter: brightness(1);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px;
}

.championship-item:hover img {
  filter: brightness(1.1);
  transform: scale(1.05);
}
</style>
