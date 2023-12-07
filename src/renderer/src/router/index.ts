// Composables
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes = [] as RouteRecordRaw[]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
