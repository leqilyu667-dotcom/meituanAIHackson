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
          <p class="eyebrow">ORDERS</p>
          <h1 class="text-[22px] font-medium leading-[30px] text-ink">我的订单</h1>
        </div>
      </div>
      <div class="px-5 pb-3">
        <div class="flex gap-2">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            class="rounded-full px-4 py-2 text-sm font-medium transition"
            :class="activeTab === tab ? 'bg-primary-600 text-white' : 'bg-white text-cocoa shadow-soft'"
          >
            {{ tab }}
          </button>
        </div>
      </div>
    </header>

    <main class="px-5 pt-4">
      <div v-if="filteredOrders.length === 0" class="py-20 text-center">
        <div class="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-primary-50">
          <svg class="h-10 w-10 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7.5 19.5a2.121 2.121 0 0 1-3-3z"/>
          </svg>
        </div>
        <p class="text-cocoa">暂无订单</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="order in filteredOrders" :key="order.id" class="card">
          <div class="mb-3 flex items-start justify-between">
            <h3 class="font-medium text-ink">{{ order.salonName }}</h3>
            <span
              class="rounded-full px-3 py-1 text-xs font-medium"
              :class="statusClass(order.status)"
            >
              {{ order.statusText }}
            </span>
          </div>
          <div class="flex gap-3">
            <img :src="order.image" alt="" class="h-20 w-20 shrink-0 rounded-2xl object-cover" />
            <div class="min-w-0 flex-1">
              <p class="text-sm text-ink">{{ order.service }}</p>
              <p class="mt-1 text-sm text-cocoa">{{ order.date }}</p>
              <p class="mt-1 text-lg font-medium text-primary-600">¥{{ order.price }}</p>
            </div>
          </div>
          <div v-if="order.status === 'upcoming'" class="mt-3 flex gap-2 border-t border-divider pt-3">
            <button @click="cancelOrder(order.id)" class="flex-1 rounded-full border border-divider py-2 text-sm text-cocoa">取消预约</button>
            <button @click="contactSalon(order.id)" class="flex-1 rounded-full bg-primary-500 py-2 text-sm text-white">联系店家</button>
          </div>
          <div v-else-if="order.status === 'completed'" class="mt-3 flex gap-2 border-t border-divider pt-3">
            <button @click="reorder(order.id)" class="flex-1 rounded-full border border-divider py-2 text-sm text-primary-600">再次预约</button>
            <button @click="writeReview(order.id)" class="flex-1 rounded-full bg-primary-500 py-2 text-sm text-white">写评价</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { orders } from '../data/mockData'

const router = useRouter()
const activeTab = ref('全部')
const tabs = ['全部', '待服务', '已完成', '已取消']

const statusMap = { '待服务': 'upcoming', '已完成': 'completed', '已取消': 'cancelled' }

const filteredOrders = computed(() => {
  if (activeTab.value === '全部') return orders
  return orders.filter(o => o.status === statusMap[activeTab.value])
})

const statusClass = (status) => ({
  completed: 'bg-success/15 text-success',
  upcoming: 'bg-primary-50 text-primary-600',
  cancelled: 'bg-neutral-100 text-cocoa'
}[status] || '')

const goBack = () => router.back()

const cancelOrder = (id) => {
  if (confirm('确定取消此预约吗？')) {
    alert('预约已取消')
  }
}

const contactSalon = (id) => {
  const order = orders.find(o => o.id === id)
  router.push(`/chat/1`)
}

const reorder = (id) => {
  router.push('/salon')
}

const writeReview = (id) => {
  alert('感谢您的评价！')
}
</script>
