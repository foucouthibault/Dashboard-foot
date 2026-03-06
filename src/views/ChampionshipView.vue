<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStandingsStore } from '@/stores/standings'
import StandingsComponent from '@/components/StandingsComponent.vue'
import MatchdayComponent from '@/components/MatchdayComponent.vue'
import ScorersComponent from '@/components/ScorersComponent.vue'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()
const standingsStore = useStandingsStore()

const championshipId = computed<string>(() => String(route.params.id))
const activeTab = ref<'standings' | 'scorers'>('standings')

const goHome = (): void => {
  router.push({ name: 'home' })
}

const load = (): void => {
  standingsStore.fetchStandings(championshipId.value)
}

onMounted(load)

watch(championshipId, () => {
  activeTab.value = 'standings'
  load()
})
</script>

<template>
  <div class="championship-view">
    <!-- Barre de retour -->
    <div class="back-bar">
      <button class="back-btn" @click="goHome">
        <span class="back-icon">←</span>
        Tous les championnats
      </button>
    </div>

    <!-- Contenu principal -->
    <div class="content-wrapper">
      <!-- Colonne gauche : onglets + tableau -->
      <div class="left-section">
        <div class="tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'standings' }"
            @click="activeTab = 'standings'"
          >
            📊 Classement
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'scorers' }"
            @click="activeTab = 'scorers'"
          >
            ⚽ Buteurs
          </button>
        </div>

        <StandingsComponent
          v-if="activeTab === 'standings'"
          :rows="standingsStore.getRows(championshipId)"
          :loading="standingsStore.isLoading(championshipId)"
          :error="standingsStore.getError(championshipId)"
        />
        <ScorersComponent
          v-if="activeTab === 'scorers'"
          :championship-id="championshipId"
        />
      </div>

      <!-- Colonne droite : dernière journée -->
      <div class="right-section">
        <MatchdayComponent :championship-id="championshipId" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.championship-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
}

.back-bar {
  padding: 1.25rem 4rem;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 2px solid #667eea;
  color: #667eea;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #667eea;
  color: #ffffff;
}

.back-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  padding: 3rem 4rem;
  width: 100%;
  box-sizing: border-box;
}

.left-section {
  display: flex;
  flex-direction: column;
}

.right-section {
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: #f0f0f0;
  color: #666;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 0.3px;
}

.tab-btn:hover {
  background: #e0e0e0;
  color: #2c3e50;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
}
</style>

