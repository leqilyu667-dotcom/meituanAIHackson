<template>
  <div class="phone-shell pb-28">
    <header class="sticky top-0 z-40 bg-cream/95 pb-3 backdrop-blur">
      <div class="px-5 py-5">
        <p class="eyebrow">SALON</p>
        <h1 class="mt-1 text-[22px] font-medium leading-[30px] text-ink">美甲店铺广场</h1>
      </div>
      <div class="px-5 pb-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            class="input-field pl-10"
            placeholder="搜索美甲店铺"
          />
          <svg class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </div>
      <div class="px-5">
        <div class="flex items-center justify-between">
          <div class="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              v-for="filter in filters"
              :key="filter"
              @click="activeFilter = filter"
              class="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition"
              :class="activeFilter === filter ? 'bg-primary-600 text-white shadow-glow' : 'bg-white text-cocoa shadow-soft'"
            >
              {{ filter }}
            </button>
          </div>
          <button @click="showSort = !showSort" class="ml-3 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white shadow-soft text-cocoa">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M6 12h12M10 18h4"/>
            </svg>
          </button>
        </div>
        <div v-if="showSort" class="mt-2 flex gap-2 rounded-2xl bg-white p-2 shadow-soft">
          <button
            v-for="s in sortOptions"
            :key="s.key"
            @click="currentSort = s.key; showSort = false"
            class="flex-1 rounded-xl py-2 text-center text-sm transition"
            :class="currentSort === s.key ? 'bg-primary-500 text-white' : 'text-cocoa'"
          >{{ s.label }}</button>
        </div>
      </div>
    </header>

    <main class="px-5 pt-4">
      <div v-if="filteredSalons.length === 0" class="py-20 text-center">
        <div class="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-primary-50">
          <svg class="h-10 w-10 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 10h16l-1.2-5.2A1 1 0 0 0 17.8 4H6.2a1 1 0 0 0-1 .8L4 10Z"/><path d="M6 10v9h12v-9"/><path d="M9 19v-5h6v5"/>
          </svg>
        </div>
        <p class="text-cocoa">暂无匹配的店铺</p>
        <button @click="activeFilter = '全部区域'; searchQuery = ''" class="mt-3 text-sm text-primary-600">清除筛选</button>
      </div>

      <div v-else>
        <div v-for="salon in paginatedSalons" :key="salon.id" class="card mb-4 cursor-pointer" @click="goToSalonDetail(salon.id)">
          <div class="flex gap-3">
            <div class="h-28 w-24 shrink-0">
              <img :src="salon.image" alt="" class="h-full w-full rounded-[20px] object-cover"/>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between">
                <div class="min-w-0">
                  <h3 class="truncate font-medium text-ink">{{ salon.name }}</h3>
                  <div class="mt-1 flex items-center gap-1">
                    <svg class="h-4 w-4 text-warning" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span class="text-sm font-medium text-ink">{{ salon.rating }}</span>
                    <span class="text-xs text-cocoa">({{ salon.reviews }})</span>
                  </div>
                </div>
                <span class="ml-2 shrink-0 text-xs text-cocoa">{{ salon.distance }}</span>
              </div>
              <div class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="service in salon.services"
                  :key="service"
                  class="rounded-full bg-primary-50 px-2 py-1 text-xs text-cocoa"
                >
                  {{ service }}
                </span>
              </div>
              <div class="mt-2 flex items-center gap-1 text-xs text-cocoa">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {{ salon.location }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasMore && filteredSalons.length > pageSize" class="py-8 text-center">
        <button @click="loadMore" class="btn-secondary">{{ loadingMore ? '加载中...' : '加载更多店铺' }}</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { salons } from '../data/mockData'

const router = useRouter()

const searchQuery = ref('')
const activeFilter = ref('全部区域')
const showSort = ref(false)
const currentSort = ref('rating')
const pageSize = ref(3)
const loadingMore = ref(false)

const filters = ['全部区域', '朝阳区', '海淀区', '西城区', '东城区', '丰台区']
const sortOptions = [
  { key: 'rating', label: '评分最高' },
  { key: 'distance', label: '距离最近' },
  { key: 'reviews', label: '评价最多' }
]

const hasMore = computed(() => filteredSalons.value.length > pageSize.value)

const filteredSalons = computed(() => {
  let list = [...salons]
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(s => s.name.toLowerCase().includes(q) || s.services.some(sv => sv.includes(q)) || s.location.includes(q))
  }
  if (activeFilter.value !== '全部区域') {
    list = list.filter(s => s.location === activeFilter.value)
  }
  if (currentSort.value === 'rating') {
    list.sort((a, b) => b.rating - a.rating)
  } else if (currentSort.value === 'distance') {
    list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
  } else if (currentSort.value === 'reviews') {
    list.sort((a, b) => b.reviews - a.reviews)
  }
  return list
})

const paginatedSalons = computed(() => filteredSalons.value.slice(0, pageSize.value))

const loadMore = () => {
  loadingMore.value = true
  setTimeout(() => {
    pageSize.value += 3
    loadingMore.value = false
  }, 600)
}

const goToSalonDetail = (id) => {
  router.push(`/salon-detail/${id}`)
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
