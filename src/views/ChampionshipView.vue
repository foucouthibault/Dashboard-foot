<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStandingsStore } from '@/stores/standings'
import { useCompetitionsStore } from '@/stores/competitions'
import { useScorersStore } from '@/stores/scorers'
import StandingsComponent from '@/components/StandingsComponent.vue'
import MatchdayComponent from '@/components/MatchdayComponent.vue'
import ScorersComponent from '@/components/ScorersComponent.vue'
import LeagueBanner from '@/components/LeagueBanner.vue'

const route = useRoute()
const router = useRouter()
const standingsStore = useStandingsStore()
const scorersStore = useScorersStore()
const competitionsStore = useCompetitionsStore()

const championshipId = computed<string>(() => String(route.params.id))
const activeTab = ref<'standings' | 'scorers'>('standings')

// Récupère la compétition complète
const competition = computed(() => {
  return competitionsStore.competitions.find(c => String(c.id) === championshipId.value)
})

// Paramètres pour les requêtes
const selectedSeason = ref<string>('')
const scorersLimit = ref<number>(10)

// Année actuelle pour la saison par défaut
const currentYear = new Date().getFullYear()
const defaultSeason = `${currentYear}/${currentYear + 1}`

// Saisons disponibles (à adapter selon les données réelles)
const availableSeasons = ref<string[]>([
  `${currentYear}/${currentYear + 1}`,
  `${currentYear - 1}/${currentYear}`,
  `${currentYear - 2}/${currentYear - 1}`,
])

const goHome = (): void => {
  router.push({ name: 'home' })
}

const load = (): void => {
  // Charger les classements avec la saison sélectionnée
  standingsStore.fetchStandings(championshipId.value, selectedSeason.value || undefined)
  competitionsStore.fetchCompetitions()
}

// Charger les buteurs avec la limite sélectionnée
const loadScorers = (): void => {
  if (activeTab.value === 'scorers') {
    scorersStore.fetchScorers(championshipId.value, scorersLimit.value)
  }
}

// Réagir au changement de saison
watch(selectedSeason, () => {
  load()
})

// Réagir au changement de limite
watch(scorersLimit, () => {
  loadScorers()
})

onMounted(() => {
  load()
  // Initialiser la saison par défaut
  if (availableSeasons.value.length > 0) {
    selectedSeason.value = availableSeasons.value[0]
  }
})

watch(championshipId, () => {
  activeTab.value = 'standings'
  load()
  // Réinitialiser la saison
  if (availableSeasons.value.length > 0) {
    selectedSeason.value = availableSeasons.value[0]
  }
})

// Charger les buteurs quand on change d'onglet
watch(activeTab, (newTab) => {
  if (newTab === 'scorers') {
    loadScorers()
  }
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
        <!-- Contrôles de filtre -->
        <div class="filters-bar">
          <div class="filter-group">
            <label for="season-select" class="filter-label">Saison:</label>
            <select
              id="season-select"
              v-model="selectedSeason"
              class="filter-select"
            >
              <option v-for="season in availableSeasons" :key="season" :value="season">
                {{ season }}
              </option>
            </select>
          </div>
          
          <div class="filter-group" v-if="activeTab === 'scorers'">
            <label for="limit-select" class="filter-label">Nombre de buteurs:</label>
            <select
              id="limit-select"
              v-model="scorersLimit"
              class="filter-select"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

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
          :rows="standingsStore.getRows(championshipId, selectedSeason || undefined)"
          :loading="standingsStore.isLoading(championshipId, selectedSeason || undefined)"
          :error="standingsStore.getError(championshipId, selectedSeason || undefined)"
        />
        <ScorersComponent
          v-if="activeTab === 'scorers'"
          :championship-id="championshipId"
          :limit="scorersLimit"
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

/* Barre de filtres */
.filters-bar {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(20, 30, 40, 0.6);
  color: #FFFFFF;
  font-size: 0.9rem;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
}

.filter-select:hover {
  border-color: rgba(255, 255, 255, 0.4);
}

.filter-select:focus {
  outline: none;
  border-color: #FFD700;
  box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.3);
}

.filter-select option {
  background: rgba(20, 30, 40, 0.9);
  color: #FFFFFF;
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

/* Responsive pour les filtres */
@media (max-width: 768px) {
  .filters-bar {
    gap: 1rem;
  }

  .filter-select {
    min-width: 120px;
    font-size: 0.85rem;
  }

  .filter-label {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    justify-content: space-between;
  }

  .filter-select {
    width: 100%;
    min-width: auto;
  }
}
</style>

