<script setup lang="ts">
</script>

<template>
  <div class="app-container grain-papier">
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
