<script setup lang="ts">
import { useLeagueData } from '@/composables/useLeagueData'
import type { Competition } from '@/types'

interface Props {
  competition: Competition
  season?: string
}

interface Emits {
  (e: 'back'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Getter : la bannière suit le championnat courant même sans remontage du composant
const { leagueData } = useLeagueData(() => props.competition)
</script>

<template>
  <header class="bandeau">
    <button type="button" class="retour" @click="emit('back')">
      <span class="retour-fleche" aria-hidden="true">←</span>
      Championnats
    </button>

    <div
      class="titre-bloc"
      :style="{ backgroundColor: leagueData.colors.bg, color: leagueData.colors.text }"
    >
      <span class="ecusson">
        <img
          v-if="leagueData.emblem"
          :src="leagueData.emblem"
          alt=""
          class="ecusson-image"
        />
        <span v-else class="ecusson-defaut" aria-hidden="true">{{ leagueData.icon }}</span>
      </span>

      <div class="titre-texte">
        <h1 class="titre">{{ leagueData.name }}</h1>
        <p v-if="props.season" class="saison">Saison {{ props.season }}</p>
      </div>
    </div>

    <span
      class="filet"
      :style="{ backgroundColor: leagueData.colors.accent || leagueData.colors.border }"
      aria-hidden="true"
    ></span>
  </header>
</template>

<style scoped>
.bandeau {
  width: 100%;
}

/* Le retour : nommé par sa destination, pas par une flèche seule */
.retour {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.8rem 0.4rem 0.6rem;
  margin-bottom: 1rem;
  border: 2px solid var(--encre);
  border-radius: 999px;
  background: transparent;
  color: var(--encre);
  font-family: var(--condense);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.retour:hover {
  background: var(--encre);
  color: var(--papier);
}

.retour-fleche {
  font-size: 1rem;
  line-height: 1;
}

/* Le bandeau de tête de page : un aplat saturé aux couleurs de la ligue */
.titre-bloc {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem 1.75rem;
  border-radius: var(--rayon-page) var(--rayon-page) 0 0;
  background-image: var(--trame);
  box-shadow: var(--ombre-page);
}

.ecusson {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 68px;
  height: 68px;
  background: #fff;
  border-radius: 8px;
  box-shadow: var(--ombre-vignette);
}

.ecusson-image {
  width: 46px;
  height: 46px;
  object-fit: contain;
}

.ecusson-defaut {
  font-size: 2rem;
}

.titre {
  font-family: var(--display);
  font-size: clamp(1.6rem, 4.5vw, 2.75rem);
  line-height: 0.95;
  letter-spacing: 0.005em;
  text-transform: uppercase;
  /* Le repérage décalé, comme sur la couverture */
  text-shadow: 2px -2px 0 rgba(216, 39, 44, 0.9);
}

.saison {
  margin-top: 0.5rem;
  font-family: var(--chiffres);
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  opacity: 0.85;
}

/* Le filet coloré qui ferme la tête de page */
.filet {
  display: block;
  height: 8px;
  border-radius: 0 0 var(--rayon-page) var(--rayon-page);
}

@media (max-width: 640px) {
  .titre-bloc {
    gap: 0.9rem;
    padding: 1.1rem 1.1rem;
  }

  .ecusson {
    width: 52px;
    height: 52px;
  }

  .ecusson-image {
    width: 34px;
    height: 34px;
  }

  .saison {
    font-size: 0.78rem;
  }
}
</style>
