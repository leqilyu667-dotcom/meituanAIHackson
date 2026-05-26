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
          <p class="eyebrow">SEARCH</p>
          <h1 class="text-[22px] font-medium leading-[30px] text-ink">搜索结果</h1>
        </div>
      </div>
      <div class="px-5 pb-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            class="input-field pl-11"
            placeholder="搜索法式、猫眼、春日花朵"
            @keyup.enter="search"
          />
          <svg class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </div>
    </header>

    <main class="px-5 pt-2">
      <div v-if="results.length === 0" class="py-20 text-center">
        <div class="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-primary-50">
          <svg class="h-10 w-10 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <p class="text-cocoa">未找到"{{ searchQuery }}"相关结果</p>
        <p class="mt-1 text-sm text-placeholder">试试其他关键词吧</p>
      </div>

      <div v-else class="space-y-4">
        <p class="text-sm text-cocoa">找到 {{ results.length }} 个相关款式</p>

        <div class="grid grid-cols-2 gap-3">
          <article
            v-for="style in results"
            :key="style.id"
            @click="goToNail(style.id)"
            class="cursor-pointer overflow-hidden rounded-3xl bg-white shadow-soft"
          >
            <div class="relative">
              <img :src="style.image" alt="" class="aspect-[4/4.8] w-full object-cover" />
              <span v-if="style.isNew" class="absolute left-3 top-3 rounded-full bg-white/88 px-2.5 py-1 text-[11px] font-black text-primary-500">NEW</span>
            </div>
            <div class="p-3">
              <h4 class="truncate text-sm font-medium text-ink">{{ style.name }}</h4>
              <p class="mt-0.5 truncate text-xs text-cocoa/70">{{ style.description }}</p>
              <span class="mt-2 inline-block rounded-full bg-primary-50 px-2 py-1 text-[11px] font-medium text-primary-600">{{ style.likes }} 收藏</span>
            </div>
          </article>
        </div>
      </div>

      <div v-if="results.length" class="mt-6">
        <h3 class="section-title mb-3">相关店铺</h3>
        <div
          v-for="salon in relatedSalons"
          :key="salon.id"
          @click="goToSalon(salon.id)"
          class="card mb-3 cursor-pointer"
        >
          <div class="flex gap-3">
            <img :src="salon.image" alt="" class="h-20 w-20 shrink-0 rounded-2xl object-cover" />
            <div class="min-w-0 flex-1">
              <h4 class="font-medium text-ink">{{ salon.name }}</h4>
              <div class="mt-1 flex items-center gap-1">
                <svg class="h-4 w-4 text-warning" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span class="text-sm font-medium text-ink">{{ salon.rating }}</span>
              </div>
              <p class="mt-1 text-xs text-cocoa">{{ salon.location }} · {{ salon.distance }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { nailStyles, salons } from '../data/mockData'

const router = useRouter()
const route = useRoute()

const searchQuery = ref(route.query.q || '')
const results = ref([])

const search = () => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    results.value = []
    return
  }
  results.value = nailStyles.filter(s =>
    s.name.includes(query) || s.description.includes(query) || s.category.includes(query)
  )
}

const relatedSalons = computed(() => salons.slice(0, 2))

onMounted(() => { search() })

const goBack = () => router.back()
const goToNail = (id) => router.push(`/nail-detail/${id}`)
const goToSalon = (id) => router.push(`/salon-detail/${id}`)
</script>
