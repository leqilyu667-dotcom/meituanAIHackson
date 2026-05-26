<template>
  <div class="phone-shell pb-28">
    <header class="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      <div class="flex items-center gap-3 px-5 py-5">
        <button @click="goBack" class="grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink shadow-soft">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <p class="eyebrow">COUPONS</p>
          <h1 class="text-[22px] font-medium leading-[30px] text-ink">我的优惠券</h1>
        </div>
      </div>
    </header>

    <main class="px-5 pt-2">
      <div class="mb-4 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 p-5 text-white shadow-glow">
        <p class="text-sm text-white/70">可用优惠券</p>
        <p class="mt-1 text-3xl font-bold">{{ availableCount }}<span class="text-lg font-normal">张</span></p>
        <p class="mt-1 text-sm text-white/70">累计节省 ¥{{ totalSaved }}</p>
      </div>

      <div v-if="availableCoupons.length === 0 && usedCoupons.length === 0" class="py-20 text-center">
        <div class="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-primary-50">
          <svg class="h-10 w-10 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          </svg>
        </div>
        <p class="text-cocoa">暂无优惠券</p>
      </div>

      <div v-if="availableCoupons.length" class="mb-6">
        <h3 class="section-title mb-3">可使用</h3>
        <div v-for="c in availableCoupons" :key="c.id" class="card mb-3 flex gap-4">
          <div class="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary-600">
            <span class="text-xl font-bold">¥{{ c.amount }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="font-medium text-ink">{{ c.title }}</h4>
            <p class="mt-0.5 text-sm text-cocoa">{{ c.discount }}</p>
            <p class="mt-1 text-xs text-cocoa/60">{{ c.condition }} · {{ c.expireDate }}到期</p>
          </div>
          <button @click="useCoupon(c.id)" class="self-center rounded-full bg-primary-500 px-4 py-2 text-sm text-white">去使用</button>
        </div>
      </div>

      <div v-if="usedCoupons.length">
        <h3 class="section-title mb-3">已使用/已过期</h3>
        <div v-for="c in usedCoupons" :key="c.id" class="card mb-3 flex gap-4 opacity-50">
          <div class="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-neutral-100 text-cocoa">
            <span class="text-xl font-bold">¥{{ c.amount }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="font-medium text-ink">{{ c.title }}</h4>
            <p class="mt-0.5 text-sm text-cocoa">{{ c.discount }}</p>
            <p class="mt-1 text-xs text-cocoa/60">已使用</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { coupons } from '../data/mockData'

const router = useRouter()

const availableCoupons = computed(() => coupons.filter(c => !c.used))
const usedCoupons = computed(() => coupons.filter(c => c.used))
const availableCount = computed(() => availableCoupons.value.length)
const totalSaved = computed(() => usedCoupons.value.reduce((s, c) => s + c.amount, 0))

const goBack = () => router.back()
const useCoupon = (id) => { router.push('/salon') }
</script>
