<template>
  <div class="phone-shell pb-44">
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
        <button @click="toggleLike" class="ml-auto grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-soft" :class="liked ? 'text-error' : 'text-cocoa'">
          <svg width="20" height="20" viewBox="0 0 24 24" :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    </header>

    <main class="px-5 pt-2 space-y-4">

      <!-- 商家头图 + 名称 + 评分 + 距离 -->
      <div class="relative overflow-hidden rounded-3xl shadow-soft">
        <img :src="salon?.image" alt="" class="h-48 w-full object-cover"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"></div>
        <div class="absolute bottom-4 left-4 right-4">
          <h2 class="text-[22px] font-medium leading-[30px] text-white">{{ salon?.name }}</h2>
          <div class="mt-2 flex items-center gap-4 text-sm text-white/85">
            <span class="flex items-center gap-1">
              <svg class="h-4 w-4 text-warning" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {{ salon?.rating }}
            </span>
            <span>{{ salon?.reviews }}条评价</span>
            <span class="flex items-center gap-1">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {{ salon?.distance }}
            </span>
          </div>
        </div>
      </div>

      <!-- 服务项目：竖向列表式商品卡片 -->
      <div>
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-[17px] font-medium text-ink">服务项目</h3>
          <button @click="showAllServices = !showAllServices" class="flex items-center gap-1 text-sm font-medium text-primary-600">
            {{ showAllServices ? '收起' : '查看全部' }}
            <svg class="h-4 w-4 transition-transform" :class="showAllServices ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in displayedServices"
            :key="item.id"
            class="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-soft transition-all"
            :class="isSelected(item) ? 'ring-2 ring-primary-400' : ''"
          >
            <img :src="item.image" alt="" class="h-[76px] w-[76px] shrink-0 rounded-2xl object-cover"/>
            <div class="min-w-0 flex-1">
              <h4 class="text-[15px] font-medium text-ink">{{ item.name }}</h4>
              <p class="mt-0.5 text-xs text-cocoa">{{ item.desc }}</p>
              <div class="mt-2 flex items-center gap-2">
                <span class="text-[16px] font-semibold text-warning">¥{{ item.price }}</span>
                <span class="text-xs text-placeholder line-through">¥{{ item.originalPrice }}</span>
                <span class="rounded-full bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold text-warning">{{ item.discount }}</span>
              </div>
            </div>
            <button
              @click="selectService(item)"
              class="shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-all active:scale-95"
              :class="isSelected(item)
                ? 'bg-primary-200 text-primary-700'
                : 'bg-warning text-white shadow-glow'"
            >
              {{ isSelected(item) ? '已选✓' : '抢购' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 美甲师列表：横向滑动卡片 -->
      <div>
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-[17px] font-medium text-ink">美甲师</h3>
          <span class="text-xs text-cocoa">{{ artists.length }}位在岗</span>
        </div>

        <div class="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          <div
            v-for="artist in artists"
            :key="artist.id"
            @click="goToArtist(artist)"
            class="w-[90px] shrink-0 cursor-pointer rounded-3xl bg-white p-3 text-center shadow-soft transition-all active:scale-95"
          >
            <div
              class="mx-auto mb-2 flex h-[52px] w-[52px] items-center justify-center rounded-full text-xl font-semibold text-white"
              :style="{ background: artist.avatarBg }"
            >
              {{ artist.name.charAt(0) }}
            </div>
            <h4 class="truncate text-xs font-medium text-ink">{{ artist.name }}</h4>
            <p class="mt-0.5 truncate text-[10px] text-cocoa">{{ artist.title }}</p>
            <div class="mt-1.5 flex items-center justify-center gap-0.5">
              <svg class="h-3 w-3 text-warning" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span class="text-[10px] text-cocoa">{{ artist.reviews }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 灵感库：竖向列表，和服务项目卡片样式统一 -->
      <div>
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-[17px] font-medium text-ink">灵感库</h3>
          <span class="text-xs text-cocoa">点击可试戴</span>
        </div>

        <div class="space-y-3">
          <div
            v-for="style in inspirations"
            :key="style.id"
            class="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-soft"
          >
            <div class="relative shrink-0">
              <img :src="style.image" alt="" class="h-[76px] w-[76px] rounded-2xl object-cover"/>
              <div v-if="style.isNew" class="absolute -right-1 -top-1 rounded-full bg-warning px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                NEW
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="text-[15px] font-medium text-ink">{{ style.name }}</h4>
              <p class="mt-0.5 text-xs text-cocoa">{{ style.description }}</p>
              <div class="mt-2 flex flex-wrap gap-1">
                <span
                  v-for="tag in style.tags"
                  :key="tag"
                  class="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-700"
                >{{ tag }}</span>
              </div>
            </div>
            <button
              @click="goToTryOn(style)"
              class="shrink-0 rounded-full bg-primary-500 px-3.5 py-2 text-sm font-medium text-white shadow-glow transition-all active:scale-95"
            >
              试戴
            </button>
          </div>
        </div>
      </div>

    </main>

    <!-- 底部：合计金额 + 立即预约 -->
    <div class="fixed bottom-[90px] left-0 right-0 z-40 px-4">
      <div class="mx-auto flex max-w-md items-center gap-3 rounded-3xl border border-divider bg-white/95 px-4 py-3 shadow-card backdrop-blur">
        <div class="flex-1">
          <div class="text-xs text-cocoa">合计</div>
          <div class="text-[18px] font-semibold text-warning">
            ¥{{ totalPrice || 0 }}
          </div>
          <div v-if="selectedServices.length" class="text-xs text-cocoa">已选 {{ selectedServices.length }} 项服务</div>
          <div v-else class="text-xs text-cocoa">请选择服务项目</div>
        </div>
        <button @click="goToBooking" class="btn-primary">立即预约</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { salons, nailStyles, nailArtists } from '../data/mockData'

const router = useRouter()
const route = useRoute()

const salonId = parseInt(route.params.id)
const salon = ref(salons.find(s => s.id === salonId))
const liked = ref(false)
const showAllServices = ref(false)

const services = ref([
  { id: 1, name: '日式美甲', desc: '精细日系风格，持久不脱色', price: 128, originalPrice: 168, discount: '7.6折', image: '/images/nails/nail-02.png' },
  { id: 2, name: '芭比美甲', desc: '甜美梦幻，网红爆款', price: 158, originalPrice: 198, discount: '8折', image: '/images/nails/nail-01.jpg' },
  { id: 3, name: '法式美甲', desc: '经典法式，优雅百搭', price: 98, originalPrice: 128, discount: '7.7折', image: '/images/nails/nail-03.png' },
  { id: 4, name: '延长甲', desc: '水晶甲/光疗甲，增长塑形', price: 218, originalPrice: 268, discount: '8.1折', image: '/images/nails/nail-04.png' },
  { id: 5, name: '猫眼美甲', desc: '立体光泽，高级感十足', price: 178, originalPrice: 228, discount: '7.8折', image: '/images/nails/nail-05.png' },
  { id: 6, name: '足部美甲', desc: '修型打磨，基础护理', price: 148, originalPrice: 188, discount: '7.9折', image: '/images/nails/nail-06.png' },
  { id: 7, name: '手部护理', desc: '去角质+滋润保湿', price: 68, originalPrice: 88, discount: '7.7折', image: '/images/nails/nail-02.png' },
  { id: 8, name: '美甲款式', desc: '自选图案，定制创作', price: 78, originalPrice: 98, discount: '8折', image: '/images/nails/nail-03.png' }
])

const selectedServices = ref([])

const artists = computed(() => {
  const filtered = nailArtists.filter(a => a.salonId === salonId)
  return filtered.length ? filtered : nailArtists
})

const inspirations = computed(() => nailStyles)

const displayedServices = computed(() =>
  showAllServices.value ? services.value : services.value.slice(0, 4)
)

const totalPrice = computed(() =>
  selectedServices.value.reduce((sum, s) => sum + s.price, 0)
)

const isSelected = (item) => selectedServices.value.some(s => s.id === item.id)

const selectService = (item) => {
  const idx = selectedServices.value.findIndex(s => s.id === item.id)
  if (idx > -1) {
    selectedServices.value.splice(idx, 1)
  } else {
    selectedServices.value.push(item)
  }
}

const goBack = () => router.back()
const toggleLike = () => { liked.value = !liked.value }

const goToArtist = (artist) => {
  router.push(`/artist/${artist.id}`)
}

const goToTryOn = (style) => {
  router.push({ path: '/tryon', query: { styleId: style.id } })
}

const goToBooking = () => {
  if (!selectedServices.value.length) {
    alert('请先选择服务项目')
    return
  }
  router.push(`/booking/${salonId}`)
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
