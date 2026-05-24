<template>
  <div class="phone-shell pb-36">
    <header class="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      <div class="px-5 py-5 flex items-center gap-3">
        <button @click="goBack" class="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-soft text-ink">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"/>
            <path d="m12 19-7-7 7-7"/>
          </svg>
        </button>
        <div class="min-w-0">
          <p class="eyebrow">SALON DETAIL</p>
          <h1 class="truncate text-[22px] font-medium leading-[30px] text-ink">{{ salon?.name }}</h1>
        </div>
      </div>
    </header>

    <main class="px-5 pt-2">
      <div class="relative rounded-3xl overflow-hidden mb-4 shadow-soft">
        <img :src="salon?.image" alt="" class="w-full h-48 object-cover"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div class="absolute bottom-4 left-4 right-4">
          <h2 class="text-[22px] font-medium leading-[30px] text-white">{{ salon?.name }}</h2>
          <div class="flex items-center gap-4 mt-2 text-white/80 text-sm">
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4 text-warning" viewBox="0 0 24 24" fill="currentColor">
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
          <button class="text-sm font-medium text-primary-600">查看全部</button>
        </div>
        <div class="grid grid-cols-3 gap-3 mt-3">
          <div 
            v-for="item in services" 
            :key="item.id"
            class="text-center p-3 bg-primary-50 rounded-3xl transition"
            :class="selectedServices.some(service => service.id === item.id) ? 'ring-2 ring-primary-500 bg-white' : ''"
            @click="selectService(item)"
          >
            <div class="w-12 h-12 mx-auto mb-2 bg-primary-100 rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-600">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h4 class="text-sm font-medium text-ink">{{ item.name }}</h4>
            <p class="text-xs text-primary-600 mt-1">¥{{ item.price }}</p>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <h3 class="font-medium text-ink mb-3">店铺介绍</h3>
        <p class="text-sm text-cocoa leading-relaxed">
          {{ salon?.name }}是一家专业的美甲沙龙，提供高品质的美甲服务。我们拥有经验丰富的美甲师团队，使用进口环保材料，为您打造最时尚、最精致的美甲作品。
        </p>
        <div class="mt-4 pt-4 border-t border-divider">
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2 text-cocoa">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {{ salon?.location }}
            </div>
            <div class="flex items-center gap-2 text-cocoa">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              10:00-22:00
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="flex items-center justify-between">
          <h3 class="font-medium text-ink">美甲师作品</h3>
          <button class="text-sm font-medium text-primary-600">查看更多</button>
        </div>
        <div class="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          <div 
            v-for="(work, index) in works" 
            :key="index"
            class="w-20 flex-shrink-0"
          >
            <img :src="work" alt="" class="w-full aspect-square object-cover rounded-[20px]"/>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="font-medium text-ink mb-3">用户评价</h3>
        <div v-for="review in reviews" :key="review.id" class="pb-4 border-b border-divider last:border-0 last:pb-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
              {{ review.name.charAt(0) }}
            </div>
            <div>
              <h4 class="text-sm font-medium text-ink">{{ review.name }}</h4>
              <div class="flex items-center gap-1 mt-0.5">
                <svg v-for="i in 5" :key="i" class="w-3 h-3" viewBox="0 0 24 24" :fill="i <= review.rating ? '#D9A15B' : '#ECE7E2'">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
            <span class="text-xs text-cocoa ml-auto">{{ review.date }}</span>
          </div>
          <p class="text-sm text-cocoa mt-2">{{ review.content }}</p>
        </div>
      </div>
    </main>

    <div class="fixed bottom-20 left-0 right-0 z-40 px-4">
      <div class="mx-auto max-w-md rounded-3xl border border-divider bg-white/95 px-4 py-3 shadow-card backdrop-blur flex gap-3">
        <div class="flex-1">
          <div class="text-xs text-cocoa">合计</div>
          <div class="text-lg font-medium text-primary-600">¥{{ totalPrice }}</div>
        </div>
        <button @click="makeReservation" class="btn-primary">立即预约</button>
      </div>
    </div>
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

const services = ref([
  { id: 1, name: '日式美甲', price: 168 },
  { id: 2, name: '芭比美甲', price: 198 },
  { id: 3, name: '延长甲', price: 268 },
  { id: 4, name: '美甲款式', price: 98 },
  { id: 5, name: '法式美甲', price: 128 },
  { id: 6, name: '足部美甲', price: 188 }
])

const selectedServices = ref([])

const works = [
  'https://neeko-copilot.bytedance.net/api/text2image?prompt=beautiful%20nail%20art%20design%20pink%20flowers%20elegant&image_size=square',
  'https://neeko-copilot.bytedance.net/api/text2image?prompt=french%20manicure%20nails%20elegant%20white&image_size=square',
  'https://neeko-copilot.bytedance.net/api/text2image?prompt=glitter%20nails%20gold%20shimmer%20luxury&image_size=square',
  'https://neeko-copilot.bytedance.net/api/text2image?prompt=nude%20gel%20nails%20natural%20minimalist&image_size=square'
]

const reviews = [
  { id: 1, name: '小美', rating: 5, content: '服务非常好，美甲师很专业，效果超出预期！', date: '2天前' },
  { id: 2, name: '花花', rating: 5, content: '环境很舒适，做的款式很喜欢，下次还来！', date: '1周前' },
  { id: 3, name: '娜娜', rating: 4, content: '整体不错，就是等待时间有点长', date: '2周前' }
]

const totalPrice = computed(() => {
  return selectedServices.value.reduce((sum, service) => sum + service.price, 0)
})

const goBack = () => {
  router.back()
}

const selectService = (service) => {
  const index = selectedServices.value.findIndex(s => s.id === service.id)
  if (index > -1) {
    selectedServices.value.splice(index, 1)
  } else {
    selectedServices.value.push(service)
  }
}

const makeReservation = () => {
  if (selectedServices.value.length === 0) {
    alert('请先选择服务项目')
    return
  }
  alert('预约成功！')
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
