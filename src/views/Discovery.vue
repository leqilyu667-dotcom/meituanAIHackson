<template>
  <div class="phone-shell pb-28">
    <header class="relative overflow-hidden px-5 pb-6 pt-5">
      <div class="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_20%_0%,#F3E6DD,transparent_40%),linear-gradient(135deg,#F8F6F4,#FFFFFF_58%,#F3E6DD)]"></div>
      <div class="relative">
        <div class="flex items-center justify-between">
          <div>
            <p class="eyebrow">NAILIA AI</p>
            <h1 class="mt-1 text-[28px] font-semibold leading-9 text-ink">今天想做哪种美甲？</h1>
          </div>
          <button class="grid h-11 w-11 place-items-center rounded-full bg-white/85 text-primary-500 shadow-soft" aria-label="通知">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
        </div>

        <div class="mt-5 flex gap-2">
          <div class="relative flex-1">
            <input v-model="searchQuery" class="input-field pl-11" placeholder="搜索法式、猫眼、春日花朵" />
            <svg class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cocoa/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <button class="grid h-12 w-12 place-items-center rounded-2xl bg-primary-600 text-white shadow-soft" aria-label="筛选">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
          </button>
        </div>

        <section class="mt-5 overflow-hidden rounded-3xl bg-[#2F2A26] text-white shadow-card">
          <div class="grid grid-cols-[1fr_136px] gap-2 p-4">
            <div class="flex min-h-40 flex-col justify-between py-1">
              <div>
                <p class="text-xs font-semibold text-primary-200">AI REAL TRY-ON</p>
                <h2 class="mt-2 text-[22px] font-medium leading-[30px]">上传手照，3 秒预览上手效果</h2>
                <p class="mt-2 text-[15px] leading-[22px] text-white/70">智能识别甲床、肤色和手型，推荐更显白的款式。</p>
              </div>
              <button @click="goToTryOn" class="mt-4 w-fit rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink">
                立即试戴
              </button>
            </div>
            <div class="relative min-h-44 overflow-hidden rounded-3xl bg-primary-100">
              <img :src="featuredStyle.image" alt="" class="h-full w-full object-cover" />
              <div class="absolute bottom-2 left-2 right-2 rounded-2xl bg-white/82 px-3 py-2 backdrop-blur">
                <p class="truncate text-xs font-medium text-ink">{{ featuredStyle.name }}</p>
                <p class="truncate text-[11px] text-cocoa">{{ featuredStyle.description }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </header>

    <main class="px-5">
      <section>
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="activeCategory = cat"
            class="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition"
            :class="activeCategory === cat ? 'bg-primary-600 text-white shadow-glow' : 'bg-white text-cocoa shadow-soft'"
          >
            {{ cat }}
          </button>
        </div>
      </section>

      <section class="mt-6">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="section-title">热门设计款</h3>
          <button @click="goToDesign" class="text-sm font-medium text-primary-600">自定义</button>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <article
            v-for="style in filteredStyles"
            :key="style.id"
            @click="selectStyle(style)"
            class="overflow-hidden rounded-3xl bg-white shadow-soft"
          >
            <div class="relative">
              <img :src="style.image" alt="" class="aspect-[4/4.8] w-full object-cover" />
              <span v-if="style.isNew" class="absolute left-3 top-3 rounded-full bg-white/88 px-2.5 py-1 text-[11px] font-black text-primary-500">
                NEW
              </span>
            </div>
            <div class="p-3">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                <h4 class="truncate text-sm font-medium text-ink">{{ style.name }}</h4>
                  <p class="mt-0.5 truncate text-xs text-cocoa/70">{{ style.description }}</p>
                </div>
                <span class="rounded-full bg-primary-50 px-2 py-1 text-[11px] font-medium text-primary-600">{{ style.likes }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="mt-6 rounded-3xl bg-white p-4 shadow-soft">
        <div class="flex items-center gap-3">
          <div class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-500">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 3v18M5 8h14M7 16h10" />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-medium text-ink">肤色显白智能推荐</h3>
            <p class="text-sm text-cocoa/70">根据手部照片自动匹配色系和甲型。</p>
          </div>
          <button @click="goToTryOn" class="rounded-[18px] bg-primary-500 px-4 py-2 text-sm font-medium text-white">开始</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { nailStyles, categories } from '../data/mockData'

const router = useRouter()
const searchQuery = ref('')
const activeCategory = ref('推荐')
const featuredStyle = ref(nailStyles[0])

const filteredStyles = computed(() => {
  const query = searchQuery.value.trim()
  return nailStyles.filter((style) => {
    const matchesCategory = activeCategory.value === '推荐' || style.category === activeCategory.value || style.description.includes(activeCategory.value)
    const matchesQuery = !query || `${style.name}${style.description}${style.category}`.includes(query)
    return matchesCategory && matchesQuery
  })
})

const selectStyle = (style) => {
  featuredStyle.value = style
}

const goToTryOn = () => {
  router.push('/tryon')
}

const goToDesign = () => {
  router.push('/design')
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
