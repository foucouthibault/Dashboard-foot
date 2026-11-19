<script setup lang="ts">
import { computed } from 'vue'
import { formatAge, useServerStatusStore } from '@/stores/serverStatus'

// Réveil mesuré : environ 1 min 40 s (README du backend, section déploiement).
const WAKE_UP_MESSAGE =
  "Le serveur se réveille, cela peut prendre jusqu'à 2 minutes… Les données arrivent dès qu'il répond."

const status = useServerStatusStore()

const message = computed(() => {
  if (status.isRateLimited) {
    return `Trop de demandes en ce moment : les données seront de nouveau disponibles dans ${status.retryAfterSeconds} s. Rechargez la page passé ce délai.`
  }
  if (status.isWakingUp) return WAKE_UP_MESSAGE
  if (status.staleAgeSeconds !== null) {
    return `Le service de données est momentanément indisponible : les informations affichées datent d'il y a ${formatAge(status.staleAgeSeconds)}.`
  }
  return null
})
</script>

<template>
  <div class="statut-serveur" role="status" aria-live="polite">
    <p
      v-if="message"
      class="statut-message"
      :class="{ quota: status.isRateLimited, ancien: !status.isRateLimited && !status.isWakingUp }"
    >
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
.statut-serveur {
  position: sticky;
  top: 0;
  z-index: 10;
}

.statut-message {
  margin: 0;
  padding: 0.6rem 1rem;
  background: var(--encre);
  color: var(--papier);
  font-family: var(--texte);
  font-size: 0.95rem;
  text-align: center;
  box-shadow: var(--ombre-vignette);
}

.statut-message.quota {
  background: var(--rouge);
}

.statut-message.ancien {
  background: var(--papier);
  color: var(--encre);
  border-bottom: 2px solid var(--encre);
}
</style>
