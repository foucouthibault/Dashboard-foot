<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useScorersStore } from '@/stores/scorers'
import { PLACEHOLDER_CREST } from '@/constants/placeholders'
import type { Scorer } from '@/types'

interface Props {
  championshipId: string
  limit?: number
  season?: string
}

const props = withDefaults(defineProps<Props>(), {
  championshipId: 'FL1',
  limit: 10,
  season: undefined,
})

const scorersStore = useScorersStore()

const scorers = computed<Scorer[]>(() =>
  scorersStore.getScorers(props.championshipId, props.limit, props.season),
)
const loading = computed<boolean>(() =>
  scorersStore.isLoading(props.championshipId, props.limit, props.season),
)
const error = computed<string | null>(() =>
  scorersStore.getError(props.championshipId, props.limit, props.season),
)

onMounted(() => scorersStore.fetchScorers(props.championshipId, props.limit, props.season))

watch(
  () => [props.championshipId, props.limit, props.season],
  () => scorersStore.fetchScorers(props.championshipId, props.limit, props.season),
)
</script>

<template>
  <div class="scorers-container">
    <p v-if="loading" class="etat">Chargement des buteurs…</p>

    <p v-else-if="error" class="etat etat-erreur">{{ error }}</p>

    <p v-else-if="scorers.length === 0" class="etat">
      Aucun buteur enregistré pour cette compétition.
    </p>

    <table v-else class="tableau">
      <thead>
        <tr>
          <th scope="col" class="col-rang">N°</th>
          <th scope="col" class="col-joueur">Joueur</th>
          <th scope="col" class="col-equipe">Équipe</th>
          <th scope="col" class="col-buts">Buts</th>
          <th scope="col" class="col-passes">Passes</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(scorer, index) in scorers"
          :key="scorer.player.id"
          class="ligne"
          :style="{ '--i': index }"
        >
          <td class="col-rang">
            <span class="rang numero-vignette" :class="{ foil: index === 0 }">{{ index + 1 }}</span>
          </td>

          <td class="col-joueur">
            <span class="joueur-nom">{{ scorer.player.name }}</span>
            <span class="joueur-pays">{{ scorer.player.nationality }}</span>
          </td>

          <td class="col-equipe">
            <div class="equipe">
              <span class="ecusson">
                <img
                  :src="scorer.team.crest || PLACEHOLDER_CREST"
                  alt=""
                  width="22"
                  height="22"
                />
              </span>
              <span class="equipe-nom">{{ scorer.team.name }}</span>
            </div>
          </td>

          <td class="col-buts chiffre buts">{{ scorer.goals }}</td>

          <td class="col-passes chiffre passes">{{ scorer.assists ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.scorers-container {
  width: 100%;
}

.etat {
  padding: 2.5rem 0;
  max-width: 44ch;
  color: var(--encre-pale);
  font-size: 1rem;
  line-height: 1.5;
}

.tableau {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.tableau th {
  padding: 0 0.5rem 0.6rem;
  border-bottom: 2px solid var(--encre);
  font-family: var(--condense);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-align: center;
  color: var(--encre-pale);
}

.tableau th.col-joueur,
.tableau th.col-equipe {
  text-align: left;
}

.ligne {
  animation: poser-vignette 0.34s cubic-bezier(0.2, 0.9, 0.3, 1) backwards;
  animation-delay: calc(var(--i) * 22ms);
}

@keyframes poser-vignette {
  from {
    opacity: 0;
    transform: translateY(-7px) rotate(-1.2deg);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.ligne td {
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid rgba(21, 28, 59, 0.16);
  vertical-align: middle;
}

.ligne:nth-child(even) td {
  background: rgba(21, 28, 59, 0.045);
}

.ligne:hover td {
  background: var(--papier-creux);
}

/* ── Colonnes ────────────────────────────────────────────────────────── */
.col-rang {
  width: 3.25rem;
  text-align: center;
}

.col-buts,
.col-passes {
  width: 4.25rem;
}

/* ── Contenu ─────────────────────────────────────────────────────────── */
.rang {
  display: inline-grid;
  place-items: center;
  min-width: 27px;
  height: 27px;
  padding: 0 0.3rem;
  border-radius: 4px;
  font-size: 0.85rem;
}

.joueur-nom {
  display: block;
  font-family: var(--condense);
  font-weight: 700;
  font-size: 1.02rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--encre);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.joueur-pays {
  display: block;
  margin-top: 1px;
  font-size: 0.76rem;
  color: var(--encre-pale);
}

.equipe {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.ecusson {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  background: #fff;
  border-radius: 5px;
  box-shadow: var(--ombre-vignette);
}

.ecusson img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.equipe-nom {
  font-family: var(--condense);
  font-weight: 600;
  font-size: 0.92rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--encre);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chiffre {
  font-family: var(--chiffres);
  font-variant-numeric: tabular-nums;
  text-align: center;
  color: var(--encre);
}

.buts {
  font-weight: 500;
  font-size: 1.15rem;
  color: var(--rouge);
}

.passes {
  font-size: 0.92rem;
  color: var(--encre-pale);
}

@media (max-width: 640px) {
  .tableau th {
    font-size: 0.62rem;
    letter-spacing: 0.12em;
  }

  .col-equipe {
    display: none;
  }

  .joueur-nom {
    font-size: 0.9rem;
  }
}
</style>
