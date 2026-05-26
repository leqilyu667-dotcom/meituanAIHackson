<template>
  <div class="phone-shell bg-neutral-50 pb-20">
    <header class="bg-gradient-to-br from-primary-400 to-primary-600 px-4 pb-20 pt-8">
      <div class="flex items-center gap-4">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white backdrop-blur-sm">
          {{ userData.avatar }}
        </div>
        <div class="text-white">
          <h1 class="text-xl font-bold">{{ userData.name }}</h1>
          <p class="mt-1 text-sm text-white/80">精致生活，从美甲开始</p>
        </div>
        <button @click="editProfile" class="ml-auto rounded-full bg-white/20 px-4 py-2 text-sm text-white backdrop-blur-sm">编辑</button>
      </div>

      <div class="mt-6 grid grid-cols-4 gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
        <div class="cursor-pointer text-center" @click="goToTryon">
          <div class="text-2xl font-bold text-white">{{ userData.tryonCount }}</div>
          <div class="mt-1 text-xs text-white/80">试戴记录</div>
        </div>
        <div class="cursor-pointer text-center" @click="goToReservations">
          <div class="text-2xl font-bold text-white">{{ userData.reservationCount }}</div>
          <div class="mt-1 text-xs text-white/80">预约记录</div>
        </div>
        <div class="cursor-pointer text-center" @click="goToActualWorks">
          <div class="text-2xl font-bold text-white">{{ userData.recordCount }}</div>
          <div class="mt-1 text-xs text-white/80">实际做过</div>
        </div>
        <div class="cursor-pointer text-center" @click="goToFavorites">
          <div class="text-2xl font-bold text-white">{{ userData.favoriteCount }}</div>
          <div class="mt-1 text-xs text-white/80">收藏</div>
        </div>
      </div>
    </header>

    <main class="-mt-12 px-4">
      <!-- 预约记录 - prominent card -->
      <div class="card mb-4 cursor-pointer" @click="goToReservations">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="grid h-8 w-8 place-items-center rounded-full bg-primary-100">
              <svg class="h-4 w-4 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3 class="font-medium text-ink">预约记录</h3>
          </div>
          <svg class="h-5 w-5 text-cocoa" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
        <div class="space-y-2">
          <div v-for="r in upcomingReservations" :key="r.id" class="flex items-center gap-3 rounded-xl bg-cream p-3">
            <img :src="r.nailImage" alt="" class="h-12 w-12 shrink-0 rounded-xl object-cover" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-ink">{{ r.salonName }}</p>
              <p class="mt-0.5 text-xs text-cocoa">{{ r.service }} · {{ r.date }} {{ r.time }}</p>
            </div>
            <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium" :class="r.status === 'confirmed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'">{{ r.statusText }}</span>
          </div>
          <div v-if="upcomingReservations.length === 0" class="py-4 text-center text-sm text-cocoa">
            暂无进行中的预约
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="font-medium text-neutral-800">我的试戴</h3>
          <button @click="goToTryon" class="flex items-center gap-1 text-sm text-primary-500">
            全部
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="item in userData.tryonHistory"
            :key="item.id"
            class="relative cursor-pointer overflow-hidden rounded-xl"
            @click="viewImage(item.image)"
          >
            <img :src="item.image" alt="" class="aspect-square w-full object-cover"/>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="font-medium text-neutral-800">实际做过</h3>
          <button @click="goToActualWorks" class="flex items-center gap-1 text-sm text-primary-500">
            全部
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="item in userData.actualWorks"
            :key="item.id"
            class="relative cursor-pointer overflow-hidden rounded-xl"
            @click="viewImage(item.image)"
          >
            <img :src="item.image" alt="" class="aspect-square w-full object-cover"/>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="font-medium text-neutral-800">我的收藏</h3>
          <button @click="goToFavorites" class="flex items-center gap-1 text-sm text-primary-500">
            全部
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="item in userData.favorites"
            :key="item.id"
            class="relative cursor-pointer overflow-hidden rounded-xl"
            @click="viewImage(item.image)"
          >
            <img :src="item.image" alt="" class="aspect-square w-full object-cover"/>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="space-y-4">
          <button @click="goToReservations" class="flex w-full items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-neutral-50">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-500">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <span class="text-neutral-800">预约记录</span>
            <span v-if="upcomingCount" class="ml-auto mr-2 rounded-full bg-error px-2 py-0.5 text-[11px] text-white">{{ upcomingCount }}</span>
            <svg class="h-5 w-5 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <button @click="goToOrders" class="flex w-full items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-neutral-50">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-500">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7.5 19.5a2.121 2.121 0 0 1-3-3z"/>
              </svg>
            </div>
            <span class="text-neutral-800">我的订单</span>
            <svg class="ml-auto h-5 w-5 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <button @click="goToCoupons" class="flex w-full items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-neutral-50">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-500">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span class="text-neutral-800">我的优惠券</span>
            <svg class="ml-auto h-5 w-5 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <button @click="goToSettings" class="flex w-full items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-neutral-50">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-500">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <span class="text-neutral-800">设置</span>
            <svg class="ml-auto h-5 w-5 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <button @click="goToAbout" class="flex w-full items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-neutral-50">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-500">
                <circle cx="12" cy="12" r="10"/><path d="M8 15s1.5-2 4-2 4 2 4 2"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/>
              </svg>
            </div>
            <span class="text-neutral-800">关于我们</span>
            <svg class="ml-auto h-5 w-5 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </main>

    <transition name="fade">
      <div v-if="previewImage" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-8" @click="previewImage = null">
        <img :src="previewImage" alt="" class="max-h-[70vh] max-w-full rounded-3xl" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { userData, reservations } from '../data/mockData'

const router = useRouter()
const previewImage = ref(null)

const upcomingReservations = computed(() =>
  reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').slice(0, 3)
)

const upcomingCount = computed(() =>
  reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').length
)

const viewImage = (img) => { previewImage.value = img }
const editProfile = () => { alert('编辑资料功能') }

const goToReservations = () => { router.push('/reservations') }
const goToTryon = () => { router.push('/tryon-history') }
const goToActualWorks = () => { router.push('/orders') }
const goToFavorites = () => { router.push('/orders') }
const goToOrders = () => { router.push('/orders') }
const goToCoupons = () => { router.push('/coupons') }
const goToSettings = () => { router.push('/settings') }
const goToAbout = () => { router.push('/about') }
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
