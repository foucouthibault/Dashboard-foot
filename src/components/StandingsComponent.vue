<script setup lang="ts">
import type { StandingRow } from '@/types'

interface Props {
  rows: StandingRow[]
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
})

// Vignette manquante : la silhouette imprimée dans la case vide
const PLACEHOLDER_CREST =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23dfcea8" rx="4"/><circle cx="12" cy="12" r="6" fill="%23151c3b"/><circle cx="12" cy="12" r="3" fill="%23efe3c8"/></svg>'
</script>

<template>
  <div class="standings-container">
    <p v-if="props.loading" class="etat">Chargement du classement…</p>

    <p v-else-if="props.error" class="etat etat-erreur">
      {{ props.error }}
    </p>

    <p v-else-if="props.rows.length === 0" class="etat">
      Aucun classement publié pour cette saison. Choisissez une autre tranche sur l'étagère.
    </p>

    <table v-else class="tableau">
      <thead>
        <tr>
          <th scope="col" class="col-rang">N°</th>
          <th scope="col" class="col-equipe">Équipe</th>
          <th scope="col" class="col-joues">J</th>
          <th scope="col" class="col-bilan">V-N-D</th>
          <th scope="col" class="col-diff">Diff.</th>
          <th scope="col" class="col-points">Pts</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(row, index) in props.rows"
          :key="row.team.id"
          class="ligne"
          :class="{ 'ligne-leader': row.position === 1 }"
          :style="{ '--i': index }"
        >
          <td class="col-rang">
            <span class="rang numero-vignette" :class="{ foil: row.position === 1 }">
              {{ row.position }}
            </span>
          </td>

          <td class="col-equipe">
            <div class="equipe">
              <span class="ecusson">
                <img
                  :src="row.team.crest || PLACEHOLDER_CREST"
                  alt=""
                  width="24"
                  height="24"
                />
              </span>
              <span class="equipe-nom">{{ row.team.name }}</span>
            </div>
          </td>

          <td class="col-joues chiffre">{{ row.playedGames }}</td>

          <td class="col-bilan chiffre">
            <span class="bilan-v">{{ row.won }}</span
            ><span class="bilan-sep">·</span
            ><span class="bilan-n">{{ row.draw }}</span
            ><span class="bilan-sep">·</span
            ><span class="bilan-d">{{ row.lost }}</span>
          </td>

          <td
            class="col-diff chiffre"
            :class="{ positif: row.goalDifference > 0, negatif: row.goalDifference < 0 }"
          >
            {{ row.goalDifference > 0 ? '+' : '' }}{{ row.goalDifference }}
          </td>

          <td class="col-points chiffre points">{{ row.points }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.standings-container {
  width: 100%;
}

.etat {
  padding: 2.5rem 0;
  max-width: 44ch;
  color: var(--encre-pale);
  font-size: 1rem;
  line-height: 1.5;
}

.etat-erreur {
  color: var(--rouge);
  font-weight: 500;
}

/* ── La planche de vignettes ─────────────────────────────────────────── */
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

.tableau th.col-equipe {
  text-align: left;
}

/* Chaque ligne se pose comme une vignette qu'on colle */
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
  padding: 0.55rem 0.5rem;
  border-bottom: 1px solid rgba(21, 28, 59, 0.16);
  vertical-align: middle;
}

.ligne:nth-child(even) td {
  background: rgba(21, 28, 59, 0.045);
}

.ligne:hover td {
  background: var(--papier-creux);
}

/* Le leader : la vignette brillante de la page */
.ligne-leader td:first-child {
  box-shadow: inset 4px 0 0 var(--rouge);
}

/* ── Colonnes ────────────────────────────────────────────────────────── */
.col-rang {
  width: 3.25rem;
  text-align: center;
}

.col-equipe {
  width: auto;
}

.col-joues {
  width: 2.75rem;
}

.col-bilan {
  width: 5.5rem;
}

.col-diff {
  width: 3.75rem;
}

.col-points {
  width: 3.5rem;
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

.equipe {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

/* L'écusson serti dans sa case */
.ecusson {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  background: #fff;
  border-radius: 5px;
  box-shadow: var(--ombre-vignette);
}

.ecusson img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.equipe-nom {
  font-family: var(--condense);
  font-weight: 600;
  font-size: 1.02rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--encre);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ligne-leader .equipe-nom {
  font-weight: 700;
}

.chiffre {
  font-family: var(--chiffres);
  font-variant-numeric: tabular-nums;
  font-size: 0.92rem;
  text-align: center;
  color: var(--encre);
}

.bilan-v {
  color: var(--vert);
}

.bilan-d {
  color: var(--rouge);
}

.bilan-sep {
  padding: 0 0.18rem;
  color: var(--encre-pale);
}

.positif {
  color: var(--vert);
}

.negatif {
  color: var(--rouge);
}

.points {
  font-weight: 500;
  font-size: 1.05rem;
}

@media (max-width: 640px) {
  .tableau th {
    font-size: 0.62rem;
    letter-spacing: 0.12em;
  }

  .col-bilan {
    display: none;
  }

  .equipe-nom {
    font-size: 0.9rem;
  }

  .ecusson {
    width: 28px;
    height: 28px;
  }

  .ecusson img {
    width: 20px;
    height: 20px;
  }
}
</style>
