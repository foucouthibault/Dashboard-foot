<script setup lang="ts">
</script>

<template>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;700&family=Space+Mono:wght@400;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
}
</style>

<style scoped>
.app-container {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #121212 0%, #1E5F7A 50%, #121212 100%);
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  color: #FFFFFF;
}
</style>
