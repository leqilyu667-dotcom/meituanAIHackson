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
    path: '/tryon-history',
    name: 'TryOnHistory',
    component: () => import('../views/TryOnHistory.vue')
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
    path: '/nail-detail/:id',
    name: 'NailDetail',
    component: () => import('../views/NailDetail.vue')
  },
  {
    path: '/chat/:id',
    name: 'ChatDetail',
    component: () => import('../views/ChatDetail.vue')
  },
  {
    path: '/booking/:salonId',
    name: 'Booking',
    component: () => import('../views/Booking.vue')
  },
  {
    path: '/search',
    name: 'SearchResult',
    component: () => import('../views/SearchResult.vue')
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/Orders.vue')
  },
  {
    path: '/coupons',
    name: 'Coupons',
    component: () => import('../views/Coupons.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/reservations',
    name: 'Reservations',
    component: () => import('../views/Reservations.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
