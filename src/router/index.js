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
  },
  // --- Merchant Routes ---
  {
    path: '/merchant',
    name: 'MerchantHome',
    component: () => import('../views/merchant/Home.vue')
  },
  {
    path: '/merchant/daily-report',
    name: 'MerchantDashboard',
    component: () => import('../views/merchant/Dashboard.vue')
  },
  {
    path: '/merchant/trend-analysis',
    name: 'MerchantTrendAnalysis',
    component: () => import('../views/merchant/TrendAnalysis.vue')
  },
  {
    path: '/merchant/operation-advice',
    name: 'MerchantOperationAdvice',
    component: () => import('../views/merchant/OperationAdvice.vue')
  },
  {
    path: '/merchant/revenue-calc',
    name: 'MerchantRevenueCalc',
    component: () => import('../views/merchant/RevenueCalc.vue')
  },
  {
    path: '/merchant/material-generate',
    name: 'MerchantMaterialGenerate',
    component: () => import('../views/merchant/MaterialGenerate.vue')
  },
  {
    path: '/merchant/appointment',
    name: 'MerchantAppointment',
    component: () => import('../views/merchant/Appointment.vue')
  },
  {
    path: '/merchant/product-manage',
    name: 'MerchantProductManage',
    component: () => import('../views/merchant/ProductManage.vue')
  },
  {
    path: '/merchant/product-manage/:id',
    name: 'MerchantProductDetail',
    component: () => import('../views/merchant/ProductDetail.vue')
  },
  {
    path: '/merchant/messages',
    name: 'MerchantMessages',
    component: () => import('../views/merchant/Messages.vue')
  },
  {
    path: '/merchant/profile',
    name: 'MerchantProfile',
    component: () => import('../views/merchant/Profile.vue')
  },
  {
    path: '/merchant/order-history',
    name: 'MerchantOrderHistory',
    component: () => import('../views/merchant/OrderHistory.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
