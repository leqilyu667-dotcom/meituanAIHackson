<template>
  <div class="phone-shell pb-28">
    <header class="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      <div class="flex items-center gap-3 px-5 py-5">
        <button @click="goBack" class="grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink shadow-soft">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
        </button>
        <div class="min-w-0">
          <p class="eyebrow">NAIL DETAIL</p>
          <h1 class="truncate text-[22px] font-medium leading-[30px] text-ink">{{ style?.name }}</h1>
        </div>
        <button @click="toggleFavorite" class="ml-auto grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-soft" :class="isFavorited ? 'text-error' : 'text-cocoa'">
          <svg width="20" height="20" viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    </header>

    <main class="px-5 pt-2">
      <div class="relative mb-4 overflow-hidden rounded-3xl shadow-card">
        <img :src="style?.image" alt="" class="aspect-[4/5] w-full object-cover" />
        <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-ink/70 to-transparent p-4">
          <div class="flex items-center gap-2">
            <span class="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-primary-600">{{ style?.category }}</span>
            <span v-if="style?.isNew" class="rounded-full bg-primary-500/90 px-3 py-1 text-xs font-bold text-white">NEW</span>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <h2 class="text-xl font-medium text-ink">{{ style?.name }}</h2>
        <p class="mt-2 text-sm leading-relaxed text-cocoa">{{ style?.description }}</p>
        <div class="mt-4 flex items-center gap-4">
          <div class="flex items-center gap-1">
            <svg class="h-4 w-4 text-warning" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span class="text-sm font-medium text-ink">{{ style?.likes }}</span>
          </div>
          <span class="text-sm text-cocoa">人气收藏</span>
        </div>
      </div>

      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">适合场景</h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="scene in scenes" :key="scene" class="rounded-full bg-primary-50 px-4 py-2 text-sm text-cocoa">{{ scene }}</span>
        </div>
      </div>

      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">推荐搭配</h3>
        <div class="grid grid-cols-3 gap-3">
          <div v-for="item in recommendedItems" :key="item" class="text-center">
            <div class="aspect-square rounded-2xl bg-primary-50 flex items-center justify-center">
              <span class="text-3xl">{{ item.icon }}</span>
            </div>
            <p class="mt-2 text-xs text-cocoa">{{ item.name }}</p>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">相似款式</h3>
        <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <div
            v-for="similar in similarStyles"
            :key="similar.id"
            @click="goToNail(similar.id)"
            class="w-28 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-primary-50"
          >
            <img :src="similar.image" alt="" class="aspect-square w-full object-cover" />
            <p class="truncate p-2 text-xs font-medium text-ink">{{ similar.name }}</p>
          </div>
        </div>
      </div>

      <div class="h-32"></div>
    </main>

    <!-- Floating Try-On CTA -->
    <div class="fixed bottom-24 left-0 right-0 z-40 px-5">
      <div class="mx-auto max-w-md">
        <button @click="goToTryOn" class="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 py-3.5 text-sm font-semibold text-white shadow-glow transition active:scale-[0.97]">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          AI 试戴此款
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { nailStyles } from '../data/mockData'

const router = useRouter()
const route = useRoute()

const styleId = parseInt(route.params.id)
const style = computed(() => nailStyles.find(s => s.id === styleId))
const isFavorited = ref(false)

const scenes = ['日常通勤', '约会聚会', '婚礼伴娘', '度假旅行', '拍照出片']
const recommendedItems = [
  { icon: '💍', name: '细戒指' },
  { icon: '⌚', name: '金属表带' },
  { icon: '👛', name: '裸色包包' }
]

const similarStyles = computed(() => nailStyles.filter(s => s.id !== styleId).slice(0, 4))

const goBack = () => router.back()
const goToTryOn = () => router.push(`/tryon?style=${styleId}`)

const goToNail = (id) => {
  router.push(`/nail-detail/${id}`)
}

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
