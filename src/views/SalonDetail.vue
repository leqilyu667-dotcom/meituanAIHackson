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

      <div class="card mb-4">
        <div class="flex items-center justify-between">
          <h3 class="font-medium text-ink">服务项目</h3>
          <button @click="showAllServices = !showAllServices" class="text-sm font-medium text-primary-600">
            {{ showAllServices ? '收起' : '查看全部' }}
          </button>
        </div>
        <div class="mt-3 grid grid-cols-3 gap-3">
          <div
            v-for="item in (showAllServices ? services : services.slice(0, 6))"
            :key="item.id"
            @click="selectService(item)"
            class="cursor-pointer rounded-3xl p-3 text-center transition"
            :class="isSelected(item) ? 'ring-2 ring-primary-500 bg-white' : 'bg-primary-50'"
          >
            <div class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-600">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h4 class="text-sm font-medium text-ink">{{ item.name }}</h4>
            <p class="mt-1 text-xs text-primary-600">¥{{ item.price }}</p>
          </div>
        </div>
      </div>

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

      <div class="card mb-4">
        <div class="flex items-center justify-between">
          <h3 class="font-medium text-ink">美甲师作品</h3>
          <button @click="showGallery = true" class="text-sm font-medium text-primary-600">查看更多</button>
        </div>
        <div class="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
          <div
            v-for="(work, index) in works"
            :key="index"
            @click="viewWork(work)"
            class="w-20 shrink-0 cursor-pointer"
          >
            <img :src="work" alt="" class="aspect-square w-full rounded-[20px] object-cover"/>
          </div>
        </div>
      </div>

      <div class="card">
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

    <div class="fixed bottom-20 left-0 right-0 z-40 px-4">
      <div class="mx-auto flex max-w-md gap-3 rounded-3xl border border-divider bg-white/95 px-4 py-3 shadow-card backdrop-blur">
        <div class="flex-1">
          <div class="text-xs text-cocoa">合计</div>
          <div class="text-lg font-medium text-primary-600">¥{{ totalPrice }}</div>
          <div v-if="selectedServices.length" class="text-xs text-cocoa">{{ selectedServices.length }}项服务</div>
        </div>
        <button @click="goToBooking" class="btn-primary">立即预约</button>
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
            <p class="text-xs text-cocoa">{{ salon?.name }} · {{ works.length }}件作品</p>
          </div>
          <div class="w-10"></div>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-4">
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="(work, index) in allWorks"
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
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { salons } from '../data/mockData'

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
  { id: 1, name: '日式美甲', price: 168 },
  { id: 2, name: '芭比美甲', price: 198 },
  { id: 3, name: '延长甲', price: 268 },
  { id: 4, name: '美甲款式', price: 98 },
  { id: 5, name: '法式美甲', price: 128 },
  { id: 6, name: '足部美甲', price: 188 },
  { id: 7, name: '猫眼美甲', price: 228 },
  { id: 8, name: '手部护理', price: 88 }
])

const selectedServices = ref([])

const works = [
  'https://neeko-copilot.bytedance.net/api/text2image?prompt=beautiful%20nail%20art%20design%20pink%20flowers%20elegant&image_size=square',
  'https://neeko-copilot.bytedance.net/api/text2image?prompt=french%20manicure%20nails%20elegant%20white&image_size=square',
  'https://neeko-copilot.bytedance.net/api/text2image?prompt=glitter%20nails%20gold%20shimmer%20luxury&image_size=square',
  'https://neeko-copilot.bytedance.net/api/text2image?prompt=nude%20gel%20nails%20natural%20minimalist&image_size=square'
]

const allWorks = [
  { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=beautiful%20nail%20art%20design%20pink%20flowers%20elegant&image_size=square', title: '春日花语', artist: '美甲师 Luna', likes: 326 },
  { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=french%20manicure%20nails%20elegant%20white&image_size=square', title: '经典法式', artist: '美甲师 Luna', likes: 512 },
  { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=glitter%20nails%20gold%20shimmer%20luxury&image_size=square', title: '鎏金闪粉', artist: '美甲师小雨', likes: 289 },
  { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=nude%20gel%20nails%20natural%20minimalist&image_size=square', title: '裸感冰透', artist: '美甲师小雨', likes: 447 },
  { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=gradient%20nails%20purple%20blue%20ombre%20elegant&image_size=square', title: '星空渐变', artist: '美甲师 Luna', likes: 398 },
  { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=red%20wine%20color%20nails%20elegant%20autumn%20matte&image_size=square', title: '复古酒红', artist: '美甲师 Nicole', likes: 275 },
  { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=minimalist%20nail%20art%20gold%20line%20geometric%20design&image_size=square', title: '几何线条', artist: '美甲师 Nicole', likes: 356 },
  { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=cute%20nail%20art%20cherry%20blossom%20japanese%20style&image_size=square', title: '樱花物语', artist: '美甲师 Luna', likes: 482 }
]

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

const goToBooking = () => {
  if (selectedServices.value.length === 0) {
    alert('请先选择服务项目')
    return
  }
  router.push(`/booking/${salonId}`)
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.sheet-enter-active, .sheet-leave-active { transition: all 0.35s ease; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
</style>
