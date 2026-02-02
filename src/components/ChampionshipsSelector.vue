<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllChampionships } from '@/api/competitions.ts'

/**
 * Interface pour un championnat
 */
interface Championship {
  id: string
  name: string
  emblem?: string
}

/**
 * Interface pour la réponse API des championnats
 */
interface ICompetitionResponse {
  id: string
  name: string
  emblem?: string | null
  [key: string]: unknown
}

const emit = defineEmits<{
  championshipSelected: [id: string]
}>()

const championships = ref<Championship[]>([])
const loading = ref(true)
const selectedChampionship = ref<string>('FL1')

const placeholder =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="12">No logo</text></svg>'

/**
 * Charge les championnats au montage du composant
 */
onMounted(async (): Promise<void> => {
  try {
    const data = await getAllChampionships() as ICompetitionResponse[]
    championships.value = data.map((c: ICompetitionResponse): Championship => ({
      id: c.id,
      name: c.name,
      emblem: c.emblem ?? undefined
    }))
  } catch (err) {
    console.error('Erreur lors du chargement des championnats', err)
  } finally {
    loading.value = false
  }
})

/**
 * Sélectionne un championnat et émet l'événement
 * @param id - L'ID du championnat sélectionné
 */
const selectChampionship = (id: string): void => {
  selectedChampionship.value = id
  emit('championshipSelected', id)
}
</script>

<template>
  <div class="championships-container">
    <div v-if="loading" class="loading">Chargement des championnats...</div>
    <ul v-else class="championships-list">
      <li
        class="championship-item"
        :class="{ active: selectedChampionship === c.id }"
        v-for="c in championships"
        :key="c.id"
        @click="selectChampionship(c.id)"
      >
        <img
          :src="c.emblem || placeholder"
          :alt="c.name"
          width="80"
          height="80"
        />
        <div class="championship-name">{{ c.name }}</div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.championships-container {
  padding: 12px;
}
.loading {
  padding: 12px;
  color: #2c3e50;
  text-align: center;
}
.championships-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
}
.championship-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  background: #fafafa;
  min-width: 200px;
  cursor: pointer;
  transition: all 0.2s;
}
.championship-item:hover {
  background: #f0f0f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.championship-item.active {
  background: #e3f2fd;
  border: 2px solid #0066cc;
}
.championship-name {
  font-weight: 600;
}
</style>
