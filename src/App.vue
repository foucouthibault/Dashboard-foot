<script setup lang="ts">
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 0;
}

.wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 2rem;
  max-width: 1280px;
  margin: 0 auto;
}

nav {
  display: flex;
  gap: 2rem;
}

nav a {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

nav a:hover {
  color: #0066cc;
}

nav a.router-link-active {
  color: #0066cc;
  font-weight: 600;
}

:global(#app > main),
:global(#app > div[data-v-app]) {
  padding: 2rem;
  max-width: 1280px;
  margin: 0 auto;
}
</style>
