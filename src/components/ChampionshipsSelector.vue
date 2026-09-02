<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCompetitionsStore } from '@/stores/competitions'
import { PLACEHOLDER_EMBLEM } from '@/constants/placeholders'

const router = useRouter()
const competitionsStore = useCompetitionsStore()

onMounted(() => competitionsStore.fetchCompetitions())

const selectChampionship = (id: string): void => {
  router.push({ name: 'championship', params: { id } })
}
</script>

<template>
  <div class="championships-container">
    <p v-if="competitionsStore.loading" class="etat">Chargement des championnats…</p>

    <p v-else-if="competitionsStore.error" class="etat etat-erreur">
      {{ competitionsStore.error }}
    </p>

    <ul v-else class="planche">
      <li v-for="c in competitionsStore.competitions" :key="c.id">
        <button type="button" class="case vignette" @click="selectChampionship(String(c.id))">
          <span v-if="c.code" class="vignette-ref numero-vignette">{{ c.code }}</span>

          <span class="vignette-image">
            <img :src="c.emblem || PLACEHOLDER_EMBLEM" :alt="''" width="70" height="70" />
          </span>

          <span class="vignette-nom">{{ c.name }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.championships-container {
  width: 100%;
}

.etat {
  padding: 2.5rem 0;
  color: var(--encre-pale);
  font-size: 1rem;
}

/* La planche de l'album : une grille régulière, comme une page de cases */
.planche {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  list-style: none;
}

/* La case : un emplacement creux dans la page, qui attend sa vignette */
.vignette {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
  padding: 1.75rem 1rem 1.25rem;
  border: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.vignette-ref {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.2rem 0.5rem;
  border-radius: var(--rayon-case) 0 var(--rayon-case) 0;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
}

/* La vignette elle-même : collée de travers, elle se redresse au survol */
.vignette-image {
  display: grid;
  place-items: center;
  padding: 0.9rem;
  background: #fff;
  border-radius: 6px;
  box-shadow: var(--ombre-vignette);
  transform: rotate(-2.5deg);
  transition: transform 0.25s cubic-bezier(0.3, 1.4, 0.5, 1);
}

.vignette-image img {
  display: block;
  height: 96px;
  width: auto;
  object-fit: contain;
}

.vignette-nom {
  font-family: var(--condense);
  font-weight: 700;
  font-size: 1.05rem;
  line-height: 1.15;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-align: center;
  color: var(--encre);
}

.vignette:hover,
.vignette:focus-visible {
  transform: translateY(-3px);
  box-shadow: inset 0 0 0 2px var(--encre), var(--ombre-vignette);
}

.vignette:hover .vignette-image,
.vignette:focus-visible .vignette-image {
  transform: rotate(0deg) scale(1.04);
}

.vignette:active {
  transform: translateY(0);
}

@media (max-width: 900px) {
  .planche {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .planche {
    gap: 0.9rem;
  }

  .vignette-image img {
    height: 64px;
  }

  .vignette-nom {
    font-size: 0.9rem;
  }
}
</style>
