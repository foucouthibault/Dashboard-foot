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

const { leagueData } = useLeagueData(props.competition)
</script>

<template>
  <div
    class="league-banner"
    :style="{
      background: `linear-gradient(135deg, ${leagueData.gradient.from}, ${leagueData.gradient.to})`,
    }"
    role="banner"
    :aria-label="`Bannière du championnat: ${leagueData.name}`"
  >
    <!-- Bouton de retour intégré -->
    <button type="button" class="banner-back-btn" @click="emit('back')" aria-label="Retour à tous les championnats">
      <span class="banner-back-icon">←</span>
    </button>

    <!-- Groupe logo + texte (centré) -->
    <div class="banner-center-group">
      <!-- Logo ou icône -->
      <div class="banner-logo">
        <img
          v-if="leagueData.emblem"
          :src="leagueData.emblem"
          :alt="`Logo ${leagueData.name}`"
          class="logo-image"
        />
        <span v-else class="logo-fallback">{{ leagueData.icon }}</span>
      </div>

      <!-- Contenu texte -->
      <div class="banner-content">
        <p class="banner-league-label">Championnat</p>
        <h1 class="banner-title">{{ leagueData.name }}</h1>
        <p v-if="props.season" class="banner-season">Saison {{ props.season }}</p>
      </div>
    </div>

    <!-- Décoration -->
    <div class="banner-decoration">
      <span class="decoration-icon">{{ leagueData.icon }}</span>
    </div>
  </div>
</template>



<style scoped>
.league-banner {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1;
  width: 100%;
  box-sizing: border-box;
}

/* Motif de terrain de foot authentique en arrière-plan */
.league-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    /* Texture d'herbe subtile */
    radial-gradient(ellipse at center, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
    /* Lignes du terrain - plus authentiques */
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 20px,
      rgba(255, 255, 255, 0.03) 20px,
      rgba(255, 255, 255, 0.03) 21px,
      transparent 21px,
      transparent 40px
    ),
    /* Cercle central */
    radial-gradient(circle at 50% 50%,
      rgba(255, 255, 255, 0.05) 45px,
      transparent 45px
    );
  opacity: 0.3;
  pointer-events: none;
}

/* Effet spotlight au survol */
.league-banner::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.league-banner:hover::after {
  opacity: 1;
  animation: spotlight 3s ease-out infinite;
}

@keyframes spotlight {
  0% { transform: translate(-50%, -50%) scale(0.8); }
  100% { transform: translate(-50%, -50%) scale(1.2); }
}

.banner-back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 40px;
  min-width: 40px;
  height: 40px;
  min-height: 40px;
  color: white;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  justify-self: start;
  text-align: center;
}

.banner-back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  transform: scale(1.05);
}

.banner-back-icon {
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
  transform: translateY(-1px);
}

.banner-logo {
  flex-shrink: 0;
}

.logo-image {
  height: 40px;
  width: auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.logo-fallback {
  font-size: 2rem;
}

.banner-center-group {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  justify-content: center;
  grid-column: 2;
}

.banner-content {
  text-align: left;
}

.banner-league-label {
  margin: 0 0 0.25rem 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  opacity: 0.8;
  font-family: 'Space Mono', monospace;
  font-weight: 400;
}

.banner-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  font-family: 'Anton', sans-serif;
  text-transform: uppercase;
}

.banner-season {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 400;
}

.banner-decoration {
  opacity: 0.8;
  justify-self: end;
}

.decoration-icon {
  font-size: 2rem;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-3px) rotate(2deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .league-banner {
    padding: 1rem;
    gap: 0.75rem;
    grid-template-columns: auto 1fr;
  }

  .banner-back-btn {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }

  .banner-center-group {
    gap: 1rem;
    grid-column: 1 / -1;
    justify-content: flex-start;
  }

  .banner-decoration {
    display: none;
  }

  .banner-title {
    font-size: 1.25rem;
  }

  .banner-season {
    font-size: 0.75rem;
  }

  .logo-image {
    height: 32px;
  }

  .logo-fallback {
    font-size: 1.5rem;
  }

  .banner-content {
    text-align: left;
  }
}

@media (max-width: 480px) {
  .league-banner {
    padding: 0.75rem;
    grid-template-columns: auto 1fr;
  }

  .banner-title {
    font-size: 1rem;
  }

  .banner-season {
    display: none;
  }

  .banner-center-group {
    gap: 0.5rem;
  }

  .logo-container {
    width: 40px;
    height: 40px;
  }

  .logo-image {
    height: 28px;
  }

  .logo-fallback {
    font-size: 1.25rem;
  }

  .banner-back-btn {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
}
</style>
