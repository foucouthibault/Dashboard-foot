<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStandingsStore } from '@/stores/standings'
import { useCompetitionsStore } from '@/stores/competitions'
import StandingsComponent from '@/components/StandingsComponent.vue'
import MatchdayComponent from '@/components/MatchdayComponent.vue'
import ScorersComponent from '@/components/ScorersComponent.vue'
import LeagueBanner from '@/components/LeagueBanner.vue'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()
const standingsStore = useStandingsStore()
const competitionsStore = useCompetitionsStore()

const championshipId = computed<string>(() => String(route.params.id))
const activeTab = ref<'standings' | 'scorers'>('standings')

// Récupère la compétition complète
const competition = computed(() => {
  return competitionsStore.competitions.find(c => String(c.id) === championshipId.value)
})

const goHome = (): void => {
  router.push({ name: 'home' })
}

const load = (): void => {
  standingsStore.fetchStandings(championshipId.value)
  competitionsStore.fetchCompetitions()
}

onMounted(load)

watch(championshipId, () => {
  activeTab.value = 'standings'
  load()
})
</script>

<template>
  <div class="championship-view">
    <!-- Bannière du championnat -->
    <LeagueBanner
      v-if="competition"
      :competition="competition"
      @back="goHome"
    />

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

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem 4rem;
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  background: rgba(46, 125, 90, 0.8);
}

.tab-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'Bebas Neue', sans-serif;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
}

.tab-btn.active {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.1) 100%);
  color: #FFD700;
  border-bottom: 3px solid #FFD700;
}

@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
}
</style>

