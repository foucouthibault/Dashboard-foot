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
    class="hero-card-wrapper"
  >
    <div
      class="hero-card"
      :style="{
        backgroundColor: leagueData.colors.bg,
        color: leagueData.colors.text,
        border: `3px solid ${leagueData.colors.accent}`,
      }"
      role="region"
      :aria-label="`Carte du championnat: ${leagueData.name}`"
    >
      <!-- Bouton de retour -->
      <button
        type="button"
        class="card-back-btn"
        @click="emit('back')"
        aria-label="Retour à tous les championnats"
      >
        <span class="card-back-icon">←</span>
      </button>

      <!-- Contenu de la carte -->
      <div class="card-content">
        <!-- Section du logo/icône -->
        <div class="card-logo-section">
          <div class="logo-container">
            <img
              v-if="leagueData.emblem"
              :src="leagueData.emblem"
              :alt="`Logo ${leagueData.name}`"
              class="logo-image"
            />
            <div v-else class="logo-fallback">
              <span class="fallback-icon">{{ leagueData.icon }}</span>
            </div>
          </div>
        </div>

        <!-- Section des informations -->
        <div class="card-info-section">
          <h1 class="card-title">{{ leagueData.name }}</h1>
          <p v-if="props.season" class="card-season">Saison {{ props.season }}</p>
          <div class="card-meta">
            <span class="meta-item">
              <span class="meta-icon">⚽</span>
              <span class="meta-text">Football</span>
            </span>
          </div>
        </div>

        <!-- Décoration -->
        <div class="card-decoration">
          <div class="decoration-pattern"></div>
          <span class="decoration-icon">{{ leagueData.icon }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-card-wrapper {
  padding: 1rem 2rem;
  width: 100%;
  box-sizing: border-box;
}

.hero-card {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.hero-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 15px 30px rgba(0, 0, 0, 0.25),
    0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-back-btn {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.card-back-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: white;
  transform: scale(1.05);
}

.card-back-icon {
  line-height: 1;
}

.card-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  width: 100%;
}

.card-logo-section {
  flex-shrink: 0;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.logo-image {
  max-width: 60px;
  max-height: 60px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.logo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.fallback-icon {
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.card-info-section {
  flex: 1;
  min-width: 300px;
}

.card-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  font-family: 'Inter', sans-serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  line-height: 1.2;
}

.card-season {
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 400;
}

.card-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.8;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

.meta-icon {
  font-size: 1rem;
}

.meta-text {
  font-weight: 500;
}

.card-decoration {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.decoration-pattern {
  width: 60px;
  height: 80px;
  background-image: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 5px,
      rgba(255, 255, 255, 0.15) 5px,
      rgba(255, 255, 255, 0.15) 10px
    );
  opacity: 0.5;
}

.decoration-icon {
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* Responsive */
@media (max-width: 900px) {
  .hero-card {
    padding: 1.5rem;
  }

  .card-content {
    gap: 1.5rem;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .logo-container {
    width: 60px;
    height: 60px;
  }

  .fallback-icon {
    font-size: 2rem;
  }

  .decoration-icon {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .hero-card {
    flex-direction: column;
    padding: 1.5rem;
    text-align: center;
  }

  .card-back-btn {
    top: 0.5rem;
    left: 0.5rem;
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .card-content {
    flex-direction: column;
    gap: 1rem;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .card-season {
    font-size: 0.875rem;
  }

  .card-meta {
    justify-content: center;
  }

  .card-decoration {
    position: static;
    transform: none;
    right: auto;
    top: auto;
    flex-direction: row;
    gap: 1rem;
  }

  .decoration-pattern {
    display: none;
  }

  .decoration-icon {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-card-wrapper {
    padding: 0.5rem;
  }

  .hero-card {
    padding: 1rem;
  }

  .card-title {
    font-size: 1.25rem;
  }

  .card-season {
    display: none;
  }

  .logo-container {
    width: 50px;
    height: 50px;
  }

  .fallback-icon {
    font-size: 1.5rem;
  }
}
</style>
