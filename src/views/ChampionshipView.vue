<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStandingsStore } from '@/stores/standings'
import { useCompetitionsStore } from '@/stores/competitions'
import StandingsComponent from '@/components/StandingsComponent.vue'
import MatchdayComponent from '@/components/MatchdayComponent.vue'
import ScorersComponent from '@/components/ScorersComponent.vue'
import LeagueBanner from '@/components/LeagueBanner.vue'

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

// Paramètres pour les requêtes
const scorersLimit = ref<number>(10)

// Année actuelle pour la saison par défaut
const currentYear = new Date().getFullYear()

// L'API football-data.org attend l'année de début de saison (ex: "2025").
// On affiche le libellé complet ("2025/2026") et, sur les tranches, la forme courte.
interface SeasonOption {
  label: string
  short: string
  value: string
}

const makeSeason = (debut: number): SeasonOption => ({
  value: String(debut),
  label: `${debut}/${debut + 1}`,
  short: `${String(debut).slice(2)}/${String(debut + 1).slice(2)}`,
})

const availableSeasons = ref<SeasonOption[]>([
  makeSeason(currentYear),
  makeSeason(currentYear - 1),
  makeSeason(currentYear - 2),
])

const selectedSeason = ref<string>(availableSeasons.value[0].value)

const selectedSeasonLabel = computed<string>(
  () => availableSeasons.value.find(s => s.value === selectedSeason.value)?.label ?? '',
)

const goHome = (): void => {
  router.push({ name: 'home' })
}

const load = (): void => {
  // Charger les classements avec la saison sélectionnée
  standingsStore.fetchStandings(championshipId.value, selectedSeason.value)
  competitionsStore.fetchCompetitions()
}

// ── L'étagère de tranches : navigation clavier du groupe de boutons radio ──
const spines = ref<(HTMLButtonElement | null)[]>([])

const setSpineRef = (el: Element | ComponentPublicInstance | null, index: number): void => {
  spines.value[index] = el instanceof HTMLButtonElement ? el : null
}

const onSpineKeydown = (event: KeyboardEvent, index: number): void => {
  const last = availableSeasons.value.length - 1
  let next: number

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      next = index === last ? 0 : index + 1
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      next = index === 0 ? last : index - 1
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = last
      break
    default:
      return
  }

  event.preventDefault()
  selectedSeason.value = availableSeasons.value[next].value
  spines.value[next]?.focus()
}

// Réinitialiser l'onglet et la saison quand on change de championnat
watch(championshipId, () => {
  activeTab.value = 'standings'
  selectedSeason.value = availableSeasons.value[0].value
})

// Charger les classements dès le montage, puis à chaque changement de
// championnat ou de saison (le fetch des buteurs est géré par ScorersComponent).
watch([championshipId, selectedSeason], load, { immediate: true })
</script>

<template>
  <div class="championship-view">
    <LeagueBanner
      v-if="competition"
      :competition="competition"
      :season="selectedSeasonLabel"
      @back="goHome"
    />

    <div class="reliure">
      <!-- Page de gauche : la saison, puis le classement ou les buteurs -->
      <section class="page page-gauche">
        <div class="etagere">
          <p id="etiquette-saison" class="surtitre etagere-titre">Saison</p>

          <div class="etagere-rangee">
            <div class="tranches" role="radiogroup" aria-labelledby="etiquette-saison">
              <button
                v-for="(season, index) in availableSeasons"
                :key="season.value"
                :ref="el => setSpineRef(el, index)"
                type="button"
                role="radio"
                class="tranche"
                :class="{ 'tranche-active': season.value === selectedSeason }"
                :aria-checked="season.value === selectedSeason"
                :aria-label="`Saison ${season.label}`"
                :tabindex="season.value === selectedSeason ? 0 : -1"
                @click="selectedSeason = season.value"
                @keydown="onSpineKeydown($event, index)"
              >
                <span class="tranche-annee">{{ season.short }}</span>
              </button>
            </div>

            <p class="etagere-courante">{{ selectedSeasonLabel }}</p>
          </div>
        </div>

        <div class="onglets">
          <button
            type="button"
            class="onglet"
            :class="{ 'onglet-actif': activeTab === 'standings' }"
            :aria-pressed="activeTab === 'standings'"
            @click="activeTab = 'standings'"
          >
            Classement
          </button>
          <button
            type="button"
            class="onglet"
            :class="{ 'onglet-actif': activeTab === 'scorers' }"
            :aria-pressed="activeTab === 'scorers'"
            @click="activeTab = 'scorers'"
          >
            Buteurs
          </button>

          <label v-if="activeTab === 'scorers'" class="reglage">
            <span class="reglage-texte">Afficher</span>
            <select v-model.number="scorersLimit" class="reglage-champ">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </label>
        </div>

        <StandingsComponent
          v-if="activeTab === 'standings'"
          :rows="standingsStore.getRows(championshipId, selectedSeason)"
          :loading="standingsStore.isLoading(championshipId, selectedSeason)"
          :error="standingsStore.getError(championshipId, selectedSeason)"
        />
        <ScorersComponent
          v-else
          :championship-id="championshipId"
          :limit="scorersLimit"
          :season="selectedSeason"
        />
      </section>

      <!-- Page de droite : la dernière journée -->
      <aside class="page page-droite">
        <MatchdayComponent :championship-id="championshipId" />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.championship-view {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 4rem;
}

/* La double page de l'album */
.reliure {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 2.5rem;
  margin-top: 2rem;
}

.page {
  min-width: 0;
}

/* ── L'étagère : les saisons sont des tranches d'albums rangées ───────── */
.etagere {
  margin-bottom: 1.75rem;
}

/* De l'air sous l'étiquette : l'album tiré dépasse vers le haut */
.etagere-titre {
  margin-bottom: 1.5rem;
}

.etagere-rangee {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.55rem;
  /* Le rebord de l'étagère sur lequel les albums reposent */
  border-bottom: 3px solid var(--encre);
}

.tranches {
  display: flex;
  align-items: flex-end;
  gap: 0.4rem;
}

/* La saison en toutes lettres, au bout du rebord */
.etagere-courante {
  font-family: var(--chiffres);
  font-size: 1.05rem;
  letter-spacing: 0.04em;
  color: var(--encre);
  white-space: nowrap;
}

.tranche {
  position: relative;
  overflow: hidden;
  display: grid;
  place-items: center;
  width: 38px;
  height: 88px;
  padding: 0;
  border: 0;
  border-radius: 2px 2px 0 0;
  background: var(--encre);
  background-image: var(--trame);
  color: var(--papier);
  cursor: pointer;
  box-shadow: var(--ombre-vignette);
  transition: transform 0.28s cubic-bezier(0.3, 1.3, 0.5, 1), background-color 0.2s ease;
}

/* Le liseré haut : la coiffe de l'album */
.tranche::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 6px;
  background: rgba(239, 227, 200, 0.35);
}

.tranche-annee {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-family: var(--chiffres);
  font-weight: 500;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
}

.tranche:hover {
  transform: translateY(-5px);
}

/* L'album qu'on a tiré de l'étagère */
.tranche-active {
  background-color: var(--rouge);
  transform: translateY(-14px);
  height: 104px;
  box-shadow: 0 3px 0 rgba(21, 28, 59, 0.25), 0 14px 22px -12px rgba(21, 28, 59, 0.7);
}

.tranche-active:hover {
  transform: translateY(-16px);
}

/* ── Onglets : les intercalaires de la page ──────────────────────────── */
.onglets {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  border-bottom: 2px solid var(--encre);
}

.onglet {
  padding: 0.6rem 1.15rem;
  border: 2px solid var(--encre);
  border-bottom: 0;
  border-radius: 6px 6px 0 0;
  margin-bottom: -2px;
  background: transparent;
  color: var(--encre);
  font-family: var(--condense);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.onglet:hover {
  background: var(--papier-creux);
}

.onglet-actif {
  background: var(--encre);
  color: var(--papier);
}

.onglet-actif:hover {
  background: var(--encre);
}

/* Le réglage du nombre de buteurs, poussé en bout de ligne */
.reglage {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  padding-bottom: 0.5rem;
  font-family: var(--condense);
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--encre-pale);
}

.reglage-champ {
  padding: 0.3rem 0.5rem;
  border: 2px solid var(--encre);
  border-radius: 4px;
  background: var(--papier);
  color: var(--encre);
  font-family: var(--chiffres);
  font-size: 0.85rem;
  cursor: pointer;
}

@media (max-width: 1100px) {
  .reliure {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

@media (max-width: 640px) {
  .championship-view {
    padding: 1rem 1rem 3rem;
  }

  .onglets {
    flex-wrap: wrap;
  }

  .reglage {
    margin-left: 0;
    width: 100%;
    padding-top: 0.5rem;
  }

  .onglet {
    padding: 0.5rem 0.85rem;
    font-size: 0.85rem;
  }
}
</style>
