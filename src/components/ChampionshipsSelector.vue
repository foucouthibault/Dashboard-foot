<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCompetitionsStore } from '@/stores/competitions'

const PLACEHOLDER_EMBLEM =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="12">No logo</text></svg>'

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
  padding: 4rem 4rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

.loading {
  padding: 3rem;
  color: #ffffff;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 500;
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
  gap: 1rem;
  padding: 1.5rem 1rem;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.95);
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.championship-item:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
}

.championship-item:hover::before {
  left: 100%;
}

.championship-item {
  background: #ffffff;
  border-color: #667eea;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.championship-item.active .championship-name {
  color: #667eea;
  font-weight: 700;
}

.championship-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
  text-align: center;
  transition: color 0.3s;
}

img {
  transition: filter 0.3s;
  filter: brightness(1);
}

.championship-item:hover img {
  filter: brightness(1.05);
}
</style>
