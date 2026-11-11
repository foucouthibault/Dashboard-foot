<script setup lang="ts">
import ServerStatusBanner from '@/components/ServerStatusBanner.vue'
</script>

<template>
  <div class="app-container grain-papier">
    <ServerStatusBanner />
    <RouterView />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  width: 100%;
  background: var(--papier);
  color: var(--encre);
}
</style>
