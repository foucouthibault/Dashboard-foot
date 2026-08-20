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

// Placeholder pour les logos d'équipes
const PLACEHOLDER_CREST =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="%231A5F3F" rx="4"/><circle cx="12" cy="12" r="6" fill="%23FFFFFF"/><circle cx="12" cy="12" r="3" fill="%231A5F3F"/></svg>'
</script>

<template>
  <div class="standings-container">
    <div v-if="props.loading" class="loading">
      <div class="spinner"></div>
      <span>Chargement du classement...</span>
    </div>

    <div v-else-if="props.error" class="error">
      <span class="error-icon">⚠️</span>
      {{ props.error }}
    </div>

    <div v-else class="standings-wrapper">
      <table class="standings-table">
        <!-- En-tête -->
        <thead>
          <tr>
            <th class="header-col position-col">#</th>
            <th class="header-col team-col">Équipe</th>
            <th class="header-col matches-col">Joués</th>
            <th class="header-col record-col">V-N-D</th>
            <th class="header-col goals-col">+/-</th>
            <th class="header-col points-col">PTS</th>
          </tr>
        </thead>

        <!-- Corps du tableau -->
        <tbody>
          <tr
            v-for="(row, index) in props.rows"
            :key="row.team.id"
            class="team-row"
            :class="{
              'top-3': index < 3,
              even: index % 2 === 0,
            }"
          >
            <!-- Position -->
            <td class="position-col">
              <span class="position-badge" :class="{ 'top-3': index < 3 }">
                {{ row.position }}
              </span>
            </td>

            <!-- Équipe avec logo -->
            <td class="team-col">
              <div class="team-info">
                <img
                  :src="row.team.crest || PLACEHOLDER_CREST"
                  :alt="row.team.name"
                  class="team-crest"
                  width="24"
                  height="24"
                />
                <span class="team-name">{{ row.team.name }}</span>
              </div>
            </td>

            <!-- Matchs joués -->
            <td class="matches-col data-cell">
              {{ row.playedGames }}
            </td>

            <!-- Victoires-Nuls-Défaites -->
            <td class="record-col">
              <span class="record-item won">{{ row.won }}</span>
              <span class="record-separator">-</span>
              <span class="record-item draw">{{ row.draw }}</span>
              <span class="record-separator">-</span>
              <span class="record-item lost">{{ row.lost }}</span>
            </td>

            <!-- Différence de buts -->
            <td
              class="goals-col data-cell"
              :class="{ positive: row.goalDifference > 0, negative: row.goalDifference < 0 }"
            >
              {{ row.goalDifference > 0 ? '+' : '' }}{{ row.goalDifference }}
            </td>

            <!-- Points -->
            <td class="points-col data-cell">
              {{ row.points }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Import des polices Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;700&display=swap');



/* Conteneur principal */
.standings-container {
  width: 100%;
  font-family: 'Inter', sans-serif;
}

/* Titre stylisé */

/* Chargement */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: #E0E0E0;
  font-size: 1rem;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 215, 0, 0.3);
  border-top-color: #FFD700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Erreur */
.error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #D32F2F;
  font-size: 0.95rem;
  text-align: center;
  background: rgba(211, 47, 47, 0.1);
  border-radius: 8px;
}

.error-icon {
  font-size: 1.2rem;
}

/* Wrapper du tableau */
.standings-wrapper {
  position: relative;
}

/* Tableau */
.standings-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  font-size: 0.95rem;
  background: linear-gradient(180deg, #2E7D5A 0%, #1E5F7A 100%);
}

/* En-tête */
.standings-table thead {
  position: relative;
}

.standings-table thead tr {
  background: linear-gradient(135deg, rgba(46, 125, 90, 0.95) 0%, rgba(30, 95, 122, 0.95) 100%);
}

.standings-table th {
  color: #FFD700 !important;
  font-family: 'Bebas Neue', sans-serif;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  padding: 1rem 0.5rem;
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
  vertical-align: middle;
  white-space: nowrap;
}

.header-col {
  padding: 1rem 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  white-space: nowrap;
}

/* Lignes du tableau */
.team-row {
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.team-row:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
  box-shadow: inset 4px 0 0 #FFD700;
}

.team-row.even {
  background: rgba(255, 255, 255, 0.08);
}

.team-row.top-3 {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%);
}

/* Colonnes */
.position-col,
.team-col,
.matches-col,
.record-col,
.goals-col,
.points-col {
  padding: 1rem 0.5rem;
}

.position-col {
  width: 8%;
  text-align: center;
}

.team-col {
  width: 46%;
}

.matches-col {
  width: 8%;
  text-align: center;
}



.goals-col {
  width: 10%;
  text-align: center;
}

.points-col {
  width: 10%;
  text-align: center;
  padding: 1rem 0.5rem;
}

/* Badge de position */
.position-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  font-family: 'Roboto Mono', monospace;
  font-weight: 700;
  font-size: 0.9rem;
}

.position-badge.top-3 {
  background: #FFD700;
  color: #121212;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

/* Infos de l'équipe */
.team-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.team-crest {
  border-radius: 50%;
  object-fit: contain;
  background: #FFFFFF;
  padding: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.team-name {
  font-weight: 600;
  color: #FFFFFF;
  font-size: 0.95rem;
  flex: 1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  line-height: 1;
}

/* Cellules de données (utilisant Roboto Mono) */
.data-cell {
  font-family: 'Roboto Mono', monospace;
  font-weight: 700;
  color: #FFFFFF;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* Victoires-Nuls-Défaites */
.record-col {
  width: 18%;
  text-align: center;
  white-space: nowrap;
}

.record-item {
  font-family: 'Roboto Mono', monospace;
  font-weight: 700;
  color: #FFFFFF;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.record-item.won {
  color: #4caf50;
}

.record-item.draw {
  color: #ffc107;
}

.record-item.lost {
  color: #D32F2F;
}

.record-separator {
  color: rgba(255, 255, 255, 0.5);
}

/* Différence de buts */
.goals-col.positive {
  color: #4CAF50;
}

.goals-col.negative {
  color: #D32F2F;
}

/* Points (en or pour les 3 premiers) */
.points-col {
  font-size: 1.1rem;
  color: #FFD700;
}

.team-row:not(.top-3) .points-col {
  color: #FFFFFF;
}

/* Responsive */
@media (max-width: 768px) {

  .standings-table {
    font-size: 0.85rem;
  }

  .position-col {
    width: 8%;
  }

  .team-col {
    width: 46%;
  }

  .matches-col {
    width: 8%;
  }

  .record-col {
    width: 18%;
  }

  .goals-col {
    width: 10%;
  }

  .points-col {
    width: 10%;
  }

  .record-item {
    font-size: 0.8rem;
  }

  .team-name {
    font-size: 0.85rem;
  }
}
</style>
