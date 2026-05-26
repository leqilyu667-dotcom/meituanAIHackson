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
          <button @click="showNotifications = true" class="relative grid h-11 w-11 place-items-center rounded-full bg-white/85 text-primary-500 shadow-soft" aria-label="通知">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span class="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-error"></span>
          </button>
        </div>

        <div class="mt-5 flex gap-2">
          <div class="relative flex-1">
            <input
              v-model="searchQuery"
              class="input-field pl-11"
              placeholder="搜索法式、猫眼、春日花朵"
              @keyup.enter="goToSearch"
            />
            <svg class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cocoa/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <button @click="showFilterPanel = true" class="grid h-12 w-12 place-items-center rounded-2xl bg-primary-600 text-white shadow-soft" aria-label="筛选">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
          </button>
        </div>

        <section class="mt-5 cursor-pointer overflow-hidden rounded-3xl bg-[#2F2A26] text-white shadow-card" @click="goToTryOn">
          <div class="grid grid-cols-[1fr_136px] gap-2 p-4">
            <div class="flex min-h-40 flex-col justify-between py-1">
              <div>
                <p class="text-xs font-semibold text-primary-200">AI REAL TRY-ON</p>
                <h2 class="mt-2 text-[22px] font-medium leading-[30px]">上传手照，3 秒预览上手效果</h2>
                <p class="mt-2 text-[15px] leading-[22px] text-white/70">智能识别甲床、肤色和手型，推荐更显白的款式。</p>
              </div>
              <button class="mt-4 w-fit rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink">
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
        </div>
        <div v-if="filteredStyles.length === 0" class="py-12 text-center">
          <p class="text-sm text-cocoa">暂无匹配的款式</p>
        </div>
        <div v-else class="grid grid-cols-2 gap-3">
          <article
            v-for="style in filteredStyles"
            :key="style.id"
            class="group overflow-hidden rounded-3xl bg-white shadow-soft transition active:scale-[0.97]"
          >
            <div class="relative cursor-pointer" @click="goToNailDetail(style.id)">
              <img :src="style.image" alt="" class="aspect-[4/4.8] w-full object-cover" />
              <span v-if="style.isNew" class="absolute left-3 top-3 rounded-full bg-white/88 px-2.5 py-1 text-[11px] font-black text-primary-500">
                NEW
              </span>
            </div>
            <div class="cursor-pointer p-3" @click="goToNailDetail(style.id)">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <h4 class="truncate text-sm font-medium text-ink">{{ style.name }}</h4>
                  <p class="mt-0.5 truncate text-xs text-cocoa/70">{{ style.description }}</p>
                </div>
                <span class="rounded-full bg-primary-50 px-2 py-1 text-[11px] font-medium text-primary-600">{{ style.likes }}</span>
              </div>
              <button
                @click.stop="quickTryOn(style)"
                class="mt-2.5 flex w-full items-center justify-center gap-1 rounded-xl bg-primary-50 py-1.5 text-xs font-medium text-primary-700 transition active:scale-95 active:bg-primary-100"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                试戴
              </button>
            </div>
          </article>
        </div>
      </section>

    </main>

    <transition name="sheet">
      <div v-if="showFilterPanel" class="fixed inset-0 z-50 flex flex-col justify-end">
        <div @click="showFilterPanel = false" class="absolute inset-0 bg-ink/40 backdrop-blur-sm"></div>
        <div class="relative max-h-[70vh] overflow-y-auto rounded-t-4xl bg-white p-5 shadow-card">
          <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-divider"></div>
          <h3 class="mb-4 text-lg font-medium text-ink">筛选</h3>

          <div class="mb-4">
            <p class="mb-2 text-sm font-medium text-ink">甲型</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="s in ['不限', '圆形', '方圆形', '方形', '杏仁形', '椭圆形', '长方尖']"
                :key="s"
                @click="filterShape = s"
                class="rounded-full px-4 py-2 text-sm transition"
                :class="filterShape === s ? 'bg-primary-500 text-white' : 'bg-primary-50 text-cocoa'"
              >{{ s }}</button>
            </div>
          </div>

          <div class="mb-4">
            <p class="mb-2 text-sm font-medium text-ink">色系</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="c in ['不限', '粉色系', '裸色系', '红色系', '绿色系', '紫色系', '金色系']"
                :key="c"
                @click="filterColor = c"
                class="rounded-full px-4 py-2 text-sm transition"
                :class="filterColor === c ? 'bg-primary-500 text-white' : 'bg-primary-50 text-cocoa'"
              >{{ c }}</button>
            </div>
          </div>

          <div class="mb-4">
            <p class="mb-2 text-sm font-medium text-ink">排序</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="o in ['最热', '最新', '收藏最多']"
                :key="o"
                @click="sortBy = o"
                class="rounded-full px-4 py-2 text-sm transition"
                :class="sortBy === o ? 'bg-primary-500 text-white' : 'bg-primary-50 text-cocoa'"
              >{{ o }}</button>
            </div>
          </div>

          <div class="flex gap-3">
            <button @click="resetFilter" class="flex-1 btn-secondary">重置</button>
            <button @click="showFilterPanel = false" class="flex-1 btn-primary">确定</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="sheet">
      <div v-if="showNotifications" class="fixed inset-0 z-50 flex flex-col justify-end">
        <div @click="showNotifications = false" class="absolute inset-0 bg-ink/40 backdrop-blur-sm"></div>
        <div class="relative max-h-[70vh] overflow-y-auto rounded-t-4xl bg-white p-5 shadow-card">
          <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-divider"></div>
          <h3 class="mb-4 text-lg font-medium text-ink">消息通知</h3>
          <div class="space-y-3">
            <div v-for="n in notifications" :key="n.id" class="flex gap-3 rounded-2xl p-3" :class="n.read ? '' : 'bg-primary-50'">
              <div class="grid h-10 w-10 shrink-0 place-items-center rounded-full" :class="n.read ? 'bg-neutral-100' : 'bg-primary-200'">
                <svg class="h-5 w-5 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><circle cx="9" cy="8" r="4"/>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-ink">{{ n.title }}</p>
                <p class="mt-0.5 text-xs text-cocoa">{{ n.content }}</p>
                <p class="mt-1 text-[11px] text-placeholder">{{ n.time }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
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
const showFilterPanel = ref(false)
const showNotifications = ref(false)
const filterShape = ref('不限')
const filterColor = ref('不限')
const sortBy = ref('最热')

const notifications = ref([
  { id: 1, title: '春日新款上线', content: '10款春季限定美甲已上线，快来试戴吧！', time: '1小时前', read: false },
  { id: 2, title: '预约提醒', content: '您明天下午2点在 Nail Moment 有预约', time: '2小时前', read: false },
  { id: 3, title: '优惠券到账', content: '新人专享券已发放到您的账户', time: '1天前', read: true },
  { id: 4, title: '系统通知', content: 'NAILIA v1.0.0 已上线，欢迎体验 AI 试戴功能', time: '2天前', read: true }
])

const filteredStyles = computed(() => {
  const query = searchQuery.value.trim()
  return nailStyles.filter((style) => {
    const matchesCategory = activeCategory.value === '推荐' || style.category === activeCategory.value || style.description.includes(activeCategory.value)
    const matchesQuery = !query || `${style.name}${style.description}${style.category}`.includes(query)
    return matchesCategory && matchesQuery
  })
})

const resetFilter = () => {
  filterShape.value = '不限'
  filterColor.value = '不限'
  sortBy.value = '最热'
}

const goToNailDetail = (id) => {
  router.push(`/nail-detail/${id}`)
}

const quickTryOn = (style) => {
  router.push(`/tryon?style=${style.id}`)
}

const goToTryOn = () => {
  router.push('/tryon')
}

const goToSearch = () => {
  const q = searchQuery.value.trim()
  if (q) {
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.sheet-enter-active, .sheet-leave-active { transition: all 0.3s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .relative:last-child,
.sheet-leave-to .relative:last-child { transform: translateY(100%); }
</style>
