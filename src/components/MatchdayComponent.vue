<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useMatchesStore } from '@/stores/matches'
import type { Match } from '@/types'

interface Props {
  championshipId: string
}

const MATCH_STATUS_LABELS: Record<string, string> = {
  FINISHED: 'Terminé',
  LIVE: 'En direct',
  TIMED: 'À venir',
}

const props = withDefaults(defineProps<Props>(), {
  championshipId: 'FL1',
})

const matchesStore = useMatchesStore()

const matches = computed<Match[]>(() => matchesStore.getMatches(props.championshipId))
const currentMatchday = computed<number>(() => matchesStore.getMatchday(props.championshipId))
const loading = computed<boolean>(() => matchesStore.isLoading(props.championshipId))
const error = computed<string | null>(() => matchesStore.getError(props.championshipId))

onMounted(() => matchesStore.fetchMatches(props.championshipId))

watch(
  () => props.championshipId,
  () => matchesStore.fetchMatches(props.championshipId),
)

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Date non disponible'
  }
}

const getMatchStatus = (match: Match): string => MATCH_STATUS_LABELS[match.status] || match.status
const isMatchFinished = (match: Match): boolean => match.status === 'FINISHED'
</script>

<template>
  <div class="feuillet">
    <header class="feuillet-entete">
      <p class="surtitre feuillet-surtitre">Résultats</p>
      <h2 class="feuillet-titre">Journée {{ currentMatchday }}</h2>
    </header>

    <div class="feuillet-corps">
      <p v-if="loading" class="etat">Chargement des matchs…</p>

      <p v-else-if="error" class="etat etat-erreur">{{ error }}</p>

      <ul v-else-if="matches.length > 0" class="matchs">
        <li
          v-for="match in matches"
          :key="match.id"
          class="match"
          :class="{ 'match-joue': isMatchFinished(match) }"
        >
          <p class="match-date">{{ formatDate(match.utcDate) }}</p>

          <div class="match-ligne">
            <span class="match-equipe match-domicile">{{ match.homeTeam.name }}</span>

            <span v-if="isMatchFinished(match)" class="score">
              {{ match.score.fullTime.home }}<span class="score-tiret">–</span
              >{{ match.score.fullTime.away }}
            </span>
            <span v-else class="attente">{{ getMatchStatus(match) }}</span>

            <span class="match-equipe match-exterieur">{{ match.awayTeam.name }}</span>
          </div>
        </li>
      </ul>

      <p v-else class="etat">Aucun match programmé pour cette journée.</p>
    </div>
  </div>
</template>

<style scoped>
/* Le feuillet : la page de droite, imprimée séparément et collée */
.feuillet {
  border: 2px solid var(--encre);
  border-radius: var(--rayon-page);
  background: var(--papier);
  box-shadow: var(--ombre-page);
  overflow: hidden;
}

.feuillet-entete {
  padding: 1rem 1.25rem;
  background-color: var(--encre);
  background-image: var(--trame);
  color: var(--papier);
}

.feuillet-surtitre {
  color: rgba(239, 227, 200, 0.6);
}

.feuillet-titre {
  margin-top: 0.15rem;
  font-family: var(--display);
  font-size: 1.5rem;
  line-height: 1.05;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

.feuillet-corps {
  padding: 1.25rem;
}

.etat {
  padding: 1.5rem 0;
  color: var(--encre-pale);
  font-size: 0.95rem;
  line-height: 1.5;
}

.etat-erreur {
  color: var(--rouge);
  font-weight: 500;
}

.matchs {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  list-style: none;
}

.match {
  padding: 0.7rem 0.85rem;
  border-left: 4px solid var(--papier-bord);
  background: rgba(21, 28, 59, 0.045);
  border-radius: 0 6px 6px 0;
  transition: background-color 0.2s ease;
}

.match:hover {
  background: var(--papier-creux);
}

.match-joue {
  border-left-color: var(--vert);
}

.match-date {
  margin-bottom: 0.4rem;
  font-family: var(--chiffres);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--encre-pale);
}

.match-ligne {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.6rem;
}

.match-equipe {
  font-family: var(--condense);
  font-weight: 600;
  font-size: 0.92rem;
  line-height: 1.2;
  text-transform: uppercase;
  color: var(--encre);
}

.match-domicile {
  text-align: right;
}

.match-exterieur {
  text-align: left;
}

/* Le score : encadré comme un cachet imprimé */
.score {
  padding: 0.28rem 0.6rem;
  border-radius: 4px;
  background: var(--encre);
  color: var(--papier);
  font-family: var(--chiffres);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  font-size: 1rem;
  white-space: nowrap;
}

.score-tiret {
  padding: 0 0.22rem;
  opacity: 0.6;
}

.attente {
  padding: 0.28rem 0.6rem;
  border: 1px solid var(--papier-bord);
  border-radius: 4px;
  font-family: var(--condense);
  font-weight: 600;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--encre-pale);
  white-space: nowrap;
}
</style>
