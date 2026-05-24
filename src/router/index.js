import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Discovery',
    component: () => import('../views/Discovery.vue')
  },
  {
    path: '/tryon',
    name: 'TryOn',
    component: () => import('../views/TryOn.vue')
  },
  {
    path: '/salon',
    name: 'Salon',
    component: () => import('../views/Salon.vue')
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('../views/Messages.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue')
  },
  {
    path: '/salon-detail/:id',
    name: 'SalonDetail',
    component: () => import('../views/SalonDetail.vue')
  },
  {
    path: '/design',
    name: 'Design',
    component: () => import('../views/Design.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
