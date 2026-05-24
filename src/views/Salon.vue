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
            type="text" 
            placeholder="搜索美甲店铺"
            class="input-field pl-10"
            v-model="searchQuery"
          />
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </div>
      <div class="px-5">
        <div class="flex gap-3 overflow-x-auto scrollbar-hide">
          <button 
            v-for="filter in filters" 
            :key="filter"
            @click="activeFilter = filter"
            class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300"
            :class="activeFilter === filter ? 'bg-primary-600 text-white shadow-glow' : 'bg-white text-cocoa shadow-soft'"
          >
            {{ filter }}
          </button>
        </div>
      </div>
    </header>

    <main class="px-5 pt-4">
      <div v-for="salon in salons" :key="salon.id" class="card mb-4 cursor-pointer" @click="goToSalonDetail(salon.id)">
        <div class="flex gap-3">
          <div class="w-24 h-28 flex-shrink-0">
            <img :src="salon.image" alt="" class="w-full h-full object-cover rounded-[20px]"/>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between">
              <div class="min-w-0">
                <h3 class="truncate font-medium text-ink">{{ salon.name }}</h3>
                <div class="flex items-center gap-1 mt-1">
                  <svg class="w-4 h-4 text-warning" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span class="text-sm font-medium text-ink">{{ salon.rating }}</span>
                  <span class="text-xs text-cocoa">({{ salon.reviews }})</span>
                </div>
              </div>
              <span class="ml-2 shrink-0 text-xs text-cocoa">{{ salon.distance }}</span>
            </div>
            <div class="flex flex-wrap gap-2 mt-2">
              <span 
                v-for="service in salon.services" 
                :key="service"
                class="px-2 py-1 bg-primary-50 text-cocoa text-xs rounded-full"
              >
                {{ service }}
              </span>
            </div>
            <div class="flex items-center gap-1 mt-2 text-xs text-cocoa">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {{ salon.location }}
            </div>
          </div>
        </div>
      </div>

      <div class="text-center py-8">
        <button class="btn-secondary">加载更多店铺</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { salons } from '../data/mockData'

const router = useRouter()

const searchQuery = ref('')
const activeFilter = ref('全部区域')
const filters = ['全部区域', '朝阳区', '海淀区', '西城区', '东城区', '丰台区']

const goToSalonDetail = (id) => {
  router.push(`/salon-detail/${id}`)
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
