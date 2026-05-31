<template>
  <div class="phone-shell pb-36">
    <header class="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      <div class="flex items-center gap-3 px-5 py-5">
        <button @click="goBack" class="grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink shadow-soft">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
        </button>
        <div class="min-w-0">
          <p class="eyebrow">SALON DETAIL</p>
          <h1 class="truncate text-[22px] font-medium leading-[30px] text-ink">{{ salon?.name }}</h1>
        </div>
        <button @click="toggleLike" class="ml-auto grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink shadow-soft" :class="liked ? 'text-error' : 'text-cocoa'">
          <svg width="20" height="20" viewBox="0 0 24 24" :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    </header>

    <main class="px-5 pt-2">
      <div class="relative mb-4 overflow-hidden rounded-3xl shadow-soft">
        <img :src="salon?.image" alt="" class="h-48 w-full object-cover"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div class="absolute bottom-4 left-4 right-4">
          <h2 class="text-[22px] font-medium leading-[30px] text-white">{{ salon?.name }}</h2>
          <div class="mt-2 flex items-center gap-4 text-sm text-white/80">
            <span class="flex items-center gap-1">
              <svg class="h-4 w-4 text-warning" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {{ salon?.rating }}
            </span>
            <span>{{ salon?.reviews }}条评价</span>
            <span>{{ salon?.distance }}</span>
          </div>
        </div>
      </div>

      <!-- 服务项目 - 竖向商品列表 -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-ink">服务项目</h3>
          <button @click="showAllServices = !showAllServices" class="text-sm font-medium text-primary-600">
            {{ showAllServices ? '收起' : '查看全部' }}
          </button>
        </div>
        <div class="space-y-2.5">
          <div
            v-for="item in (showAllServices ? services : services.slice(0, 4))"
            :key="item.id"
            @click="selectService(item)"
            class="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-3 shadow-soft transition active:scale-[0.98]"
            :class="isSelected(item) ? 'ring-2 ring-primary-400' : ''"
          >
            <!-- 项目图 -->
            <div class="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
              <img :src="item.image" alt="" class="h-full w-full object-cover" />
            </div>
            <!-- 项目信息 -->
            <div class="min-w-0 flex-1">
              <h4 class="text-[15px] font-medium text-ink leading-snug">{{ item.name }}</h4>
              <p class="mt-0.5 text-xs text-cocoa/60 line-clamp-1">{{ item.desc }}</p>
              <div class="mt-1.5 flex items-baseline gap-1.5">
                <span class="text-xs text-cocoa/50 line-through">¥{{ item.originalPrice }}</span>
                <span class="text-lg font-semibold text-primary-600">¥{{ item.price }}</span>
              </div>
            </div>
            <!-- 折扣 & 抢购 -->
            <div class="flex shrink-0 flex-col items-end gap-2">
              <span class="rounded-full bg-error/10 px-2 py-0.5 text-[11px] font-semibold text-error">{{ item.discount }}</span>
              <button
                @click.stop="snapService(item)"
                class="rounded-full bg-primary-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-glow transition active:scale-95 hover:bg-primary-600"
              >
                抢购
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 美甲师列表 - 横向滑动 -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-ink">美甲师团队</h3>
          <button @click="showAllArtists = !showAllArtists" class="text-sm font-medium text-primary-600">
            {{ showAllArtists ? '收起' : '查看全部' }}
          </button>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          <div
            v-for="artist in (showAllArtists ? artists : artists.slice(0, 5))"
            :key="artist.id"
            @click="viewArtist(artist)"
            class="flex w-[130px] shrink-0 cursor-pointer flex-col items-center rounded-2xl bg-white p-3.5 shadow-soft text-center transition active:scale-[0.97]"
          >
            <!-- 头像 -->
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-semibold text-primary-600">
              {{ artist.avatar }}
            </div>
            <!-- 信息 -->
            <h4 class="mt-2.5 text-sm font-medium text-ink truncate w-full">{{ artist.name }}</h4>
            <p class="mt-0.5 text-xs text-cocoa">{{ artist.role }}</p>
            <div class="mt-1.5 flex items-center gap-1">
              <svg class="h-3 w-3 text-warning" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span class="text-xs font-medium text-cocoa">{{ artist.goodReviews }}好评</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 美甲题材库 / 灵感库 -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-ink">灵感合集</h3>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="theme in themes"
            :key="theme.id"
            @click="goToInspiration(theme)"
            class="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-soft transition active:scale-[0.97]"
          >
            <div class="relative">
              <img :src="theme.coverImage" alt="" class="aspect-[4/3] w-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent"></div>
              <div class="absolute bottom-0 inset-x-0 p-3">
                <h4 class="text-sm font-medium text-white">{{ theme.name }}</h4>
                <p class="mt-0.5 text-xs text-white/70">{{ theme.count }}款样式</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 店铺介绍 -->
      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">店铺介绍</h3>
        <p class="text-sm leading-relaxed text-cocoa">
          {{ salon?.name }}是一家专业的美甲沙龙，提供高品质的美甲服务。我们拥有经验丰富的美甲师团队，使用进口环保材料，为您打造最时尚、最精致的美甲作品。
        </p>
        <div class="mt-4 border-t border-divider pt-4">
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2 text-cocoa">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {{ salon?.location }}
            </div>
            <div class="flex items-center gap-2 text-cocoa">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              10:00-22:00
            </div>
          </div>
        </div>
      </div>

      <!-- 用户评价 -->
      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">用户评价</h3>
        <div v-for="review in reviews" :key="review.id" class="border-b border-divider pb-4 last:border-0 last:pb-0">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-medium text-primary-600">
              {{ review.name.charAt(0) }}
            </div>
            <div>
              <h4 class="text-sm font-medium text-ink">{{ review.name }}</h4>
              <div class="mt-0.5 flex items-center gap-1">
                <svg v-for="i in 5" :key="i" class="h-3 w-3" viewBox="0 0 24 24" :fill="i <= review.rating ? '#D9A15B' : '#ECE7E2'">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
            <span class="ml-auto text-xs text-cocoa">{{ review.date }}</span>
          </div>
          <p class="mt-2 text-sm text-cocoa">{{ review.content }}</p>
        </div>
      </div>
    </main>

    <div class="fixed bottom-28 left-0 right-0 z-40 px-4">
      <div class="mx-auto flex max-w-md gap-3 rounded-3xl border border-divider bg-white/95 px-4 py-3 shadow-card backdrop-blur">
        <div class="flex-1">
          <div class="text-xs text-cocoa">合计</div>
          <div class="text-lg font-medium text-primary-600">¥{{ totalPrice }}</div>
          <div v-if="selectedServices.length" class="text-xs text-cocoa">{{ selectedServices.length }}项服务</div>
        </div>
        <button @click="goToBooking" class="btn-primary">一键预约</button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="previewWork" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-8" @click="previewWork = null">
        <img :src="previewWork" alt="" class="max-h-[70vh] max-w-full rounded-3xl" />
      </div>
    </transition>

    <transition name="sheet">
      <div v-if="showGallery" class="fixed inset-0 z-50 flex flex-col bg-white">
        <div class="sticky top-0 z-10 flex items-center justify-between bg-white/95 px-5 py-4 backdrop-blur">
          <button @click="showGallery = false" class="grid h-10 w-10 place-items-center rounded-2xl bg-cream text-ink">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
            </svg>
          </button>
          <div class="text-center">
            <h2 class="text-lg font-medium text-ink">美甲师作品集</h2>
            <p class="text-xs text-cocoa">{{ salon?.name }} · {{ galleryWorks.length }}件作品</p>
          </div>
          <div class="w-10"></div>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-4">
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="(work, index) in galleryWorks"
              :key="index"
              @click="viewGalleryWork(work)"
              class="cursor-pointer overflow-hidden rounded-3xl bg-white shadow-soft"
            >
              <div class="relative">
                <img :src="work.url" alt="" class="aspect-square w-full object-cover" />
                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-3 pt-8">
                  <p class="text-sm font-medium text-white">{{ work.title }}</p>
                  <p class="text-xs text-white/70">{{ work.artist }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <transition name="fade">
          <div v-if="galleryPreview" class="fixed inset-0 z-[60] flex flex-col bg-ink" @click="galleryPreview = null">
            <div class="absolute left-4 right-4 top-12 z-10 flex items-center justify-between">
              <button @click.stop="galleryPreview = null" class="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              <span class="rounded-full bg-white/20 px-4 py-1.5 text-sm text-white backdrop-blur">{{ galleryPreview.title }}</span>
              <button @click.stop="shareWork(galleryPreview)" class="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
                </svg>
              </button>
            </div>
            <img :src="galleryPreview.url" alt="" class="h-full w-full object-contain p-8" />
            <div class="absolute bottom-8 left-4 right-4 rounded-3xl bg-white/15 p-4 backdrop-blur-lg">
              <p class="text-lg font-medium text-white">{{ galleryPreview.title }}</p>
              <p class="mt-1 text-sm text-white/70">{{ galleryPreview.artist }} · {{ galleryPreview.likes }}人喜欢</p>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { salons, nailArtists, inspirationThemes } from '../data/mockData'

const router = useRouter()
const route = useRoute()

const salonId = parseInt(route.params.id)
const salon = ref(salons.find(s => s.id === salonId))
const liked = ref(false)
const showAllServices = ref(false)
const previewWork = ref(null)
const showGallery = ref(false)
const galleryPreview = ref(null)

const services = ref([
  { id: 1, name: '日式美甲', desc: '精致日式工艺', price: 168, originalPrice: 268, discount: '6.3折', image: '/images/nails/nail-01.jpg' },
  { id: 2, name: '芭比美甲', desc: '甜美芭比风', price: 198, originalPrice: 298, discount: '6.6折', image: '/images/nails/nail-02.png' },
  { id: 3, name: '延长甲', desc: '自然延长塑形', price: 268, originalPrice: 398, discount: '6.7折', image: '/images/nails/nail-03.png' },
  { id: 4, name: '美甲款式', desc: '时尚潮流款式', price: 98, originalPrice: 168, discount: '5.8折', image: '/images/nails/nail-04.png' },
  { id: 5, name: '法式美甲', desc: '经典优雅法式', price: 128, originalPrice: 218, discount: '5.9折', image: '/images/nails/nail-05.png' },
  { id: 6, name: '足部美甲', desc: '精致足部护理', price: 188, originalPrice: 288, discount: '6.5折', image: '/images/nails/nail-06.png' },
  { id: 7, name: '猫眼美甲', desc: '磁石猫眼效果', price: 228, originalPrice: 358, discount: '6.4折', image: '/images/nails/nail-07.png' },
  { id: 8, name: '手部护理', desc: '深层滋润护理', price: 88, originalPrice: 158, discount: '5.6折', image: '/images/nails/nail-08.png' }
])

const selectedServices = ref([])

const artists = ref([])
const themes = ref([])

const works = ref([])

const allWorks = [
  { url: '/images/nails/nail-01.jpg', title: '春日花语', artist: '美甲师 Luna', likes: 326 },
  { url: '/images/nails/nail-03.png', title: '经典法式', artist: '美甲师 Luna', likes: 512 },
  { url: '/images/nails/nail-04.png', title: '鎏金闪粉', artist: '美甲师小雨', likes: 289 },
  { url: '/images/nails/nail-02.png', title: '裸感冰透', artist: '美甲师小雨', likes: 447 },
  { url: '/images/nails/nail-06.png', title: '星空渐变', artist: '美甲师 Luna', likes: 398 },
  { url: '/images/nails/nail-05.png', title: '复古酒红', artist: '美甲师 Nicole', likes: 275 },
  { url: '/images/nails/nail-08.png', title: '几何线条', artist: '美甲师 Nicole', likes: 356 },
  { url: '/images/nails/nail-12.png', title: '樱花物语', artist: '美甲师 Luna', likes: 482 }
]

const showAllArtists = ref(false)

const galleryWorks = computed(() => {
  // Return filtered artist works if available, otherwise all works
  return works.value.length ? works.value : allWorks
})

const reviews = [
  { id: 1, name: '小美', rating: 5, content: '服务非常好，美甲师很专业，效果超出预期！', date: '2天前' },
  { id: 2, name: '花花', rating: 5, content: '环境很舒适，做的款式很喜欢，下次还来！', date: '1周前' },
  { id: 3, name: '娜娜', rating: 4, content: '整体不错，就是等待时间有点长', date: '2周前' }
]

const totalPrice = computed(() => {
  return selectedServices.value.reduce((sum, s) => sum + s.price, 0)
})

const isSelected = (item) => selectedServices.value.some(s => s.id === item.id)

const goBack = () => router.back()

const toggleLike = () => {
  liked.value = !liked.value
}

const selectService = (service) => {
  const index = selectedServices.value.findIndex(s => s.id === service.id)
  if (index > -1) {
    selectedServices.value.splice(index, 1)
  } else {
    selectedServices.value.push(service)
  }
}

const snapService = (service) => {
  // 抢购：快捷选中并跳转预约
  if (!isSelected(service)) {
    selectedServices.value.push(service)
  }
  router.push(`/booking/${salonId}`)
}

const viewArtist = (artist) => {
  // 跳转美甲师详情页
  router.push(`/artist-detail/${artist.id}`)
}

const viewWork = (work) => {
  previewWork.value = work
}

const viewGalleryWork = (work) => {
  galleryPreview.value = work
}

const shareWork = (work) => {
  if (navigator.share) {
    navigator.share({ title: work.title, text: `${work.artist}的作品：${work.title}` })
  } else {
    alert(`已分享 ${work.title}`)
  }
}

const goToInspiration = (theme) => {
  router.push(`/tryon?theme=${theme.id}`)
}

const goToBooking = () => {
  if (selectedServices.value.length === 0) {
    alert('请先选择服务项目')
    return
  }
  router.push(`/booking/${salonId}`)
}

onMounted(() => {
  // 加载该店铺的美甲师
  artists.value = nailArtists.filter(a => a.salonId === salonId)
  // 加载灵感合集
  themes.value = inspirationThemes
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.sheet-enter-active, .sheet-leave-active { transition: all 0.35s ease; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
</style>
