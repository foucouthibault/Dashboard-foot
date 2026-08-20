<script setup lang="ts">
import { useLeagueData } from '@/composables/useLeagueData'
import type { Competition } from '@/types'

interface Props {
  competition: Competition
  season?: string
}

const props = defineProps<Props>()

const { leagueData } = useLeagueData(props.competition)
</script>

<template>
  <div
    class="league-badge"
    :style="{
      backgroundColor: leagueData.colors.bg,
      color: leagueData.colors.text,
      border: `2px solid ${leagueData.colors.border}`,
    }"
    role="region"
    :aria-label="`Championnat: ${leagueData.name}`"
  >
    <span class="league-icon" aria-hidden="true">{{ leagueData.icon }}</span>
    <span class="league-name">{{ leagueData.name }}</span>
    <span v-if="props.season" class="season-text">[{{ props.season }}]</span>
  </div>
</template>

<style scoped>
.league-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  min-width: fit-content;
}

.league-badge:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.league-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.league-name {
  font-size: 0.875rem;
  letter-spacing: 0.02em;
}

.season-text {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* Pour les très petits écrans */
@media (max-width: 640px) {
  .league-badge {
    padding: 0.5rem;
  }
  .league-name {
    font-size: 0.8rem;
  }
  .season-text {
    display: none;
  }
}

/* Cache le texte de saison sur les petits écrans */
@media (max-width: 768px) {
  .season-text {
    display: none;
  }
}
</style>
