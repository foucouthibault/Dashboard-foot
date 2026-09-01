<script setup lang="ts">
import { computed } from 'vue'
import ChampionshipsSelector from '@/components/ChampionshipsSelector.vue'

// L'album porte l'année de la saison en cours, comme sur une couverture imprimée
const edition = computed<string>(() => {
  const debut = new Date().getFullYear()
  return `${debut}-${String(debut + 1).slice(2)}`
})
</script>

<template>
  <div class="home-view">
    <header class="couverture">
      <div class="couverture-texte">
        <p class="surtitre couverture-surtitre">Collection officielle</p>

        <h1 class="couverture-titre">Foot</h1>

        <p class="couverture-edition">Édition {{ edition }}</p>
      </div>

      <span class="couverture-foil" aria-hidden="true">★</span>
    </header>

    <section class="page-album">
      <p class="surtitre">Les championnats</p>
      <p class="page-consigne">
        Ouvrez un championnat pour voir son classement, ses buteurs et sa dernière journée.
      </p>

      <ChampionshipsSelector />
    </section>
  </div>
</template>

<style scoped>
.home-view {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}

/* ── La couverture ───────────────────────────────────────────────────── */
.couverture {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2.5rem;
  padding: 3rem 2.5rem 2.5rem;
  border-radius: var(--rayon-page);
  background-color: var(--encre);
  background-image: var(--trame);
  box-shadow: var(--ombre-page);
}

/* Filet rouge en haut de couverture, comme le bord d'une jaquette */
.couverture::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 10px;
  background: var(--rouge);
}

.couverture-surtitre {
  color: rgba(239, 227, 200, 0.65);
}

.couverture-titre {
  margin: 0.35rem 0 0;
  font-family: var(--display);
  font-size: clamp(3.5rem, 15vw, 8.5rem);
  line-height: 0.86;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--papier);
  /* Décalage de repérage : le rouge n'est pas tout à fait calé sur le marine */
  text-shadow: 3px -2px 0 var(--rouge);
}

.couverture-edition {
  display: inline-block;
  margin-top: 1.25rem;
  padding: 0.3rem 0.85rem;
  background: var(--rouge);
  color: var(--papier);
  font-family: var(--condense);
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

/* Le sceau brillant de couverture — le seul foil de la page */
.couverture-foil {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 132px;
  height: 132px;
  border-radius: 50%;
  background: var(--foil);
  color: #2a1f05;
  font-size: 3.2rem;
  transform: rotate(-8deg);
  box-shadow: var(--ombre-vignette);
}

/* ── La page de vignettes ────────────────────────────────────────────── */
.page-album {
  margin-top: 3rem;
}

.page-consigne {
  margin: 0.4rem 0 1.75rem;
  max-width: 46ch;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--encre-pale);
}

@media (max-width: 640px) {
  .home-view {
    padding: 1.5rem 1rem 3rem;
  }

  .couverture {
    gap: 1rem;
    padding: 2.25rem 1.5rem 2rem;
  }

  .couverture-foil {
    width: 58px;
    height: 58px;
    font-size: 1.4rem;
  }
}
</style>
