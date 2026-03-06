import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ChampionshipView from '../views/ChampionshipView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/championship/:id',
      name: 'championship',
      component: ChampionshipView,
    },
  ],
})

export default router
