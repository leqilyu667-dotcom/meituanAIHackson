<template>
  <div class="phone-shell pb-44">
    <header class="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      <div class="flex items-center gap-3 px-5 py-5">
        <button @click="goBack" class="grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink shadow-soft">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <p class="eyebrow">BOOKING</p>
          <h1 class="text-[22px] font-medium leading-[30px] text-ink">确认预约</h1>
        </div>
      </div>
    </header>

    <main class="px-5 pt-2">
      <div class="card mb-4">
        <div class="mb-3 flex items-center gap-3">
          <img :src="salon?.image" alt="" class="h-14 w-14 rounded-2xl object-cover" />
          <div>
            <h3 class="font-medium text-ink">{{ salon?.name }}</h3>
            <p class="text-sm text-cocoa">{{ salon?.location }} · {{ salon?.distance }}</p>
          </div>
        </div>
      </div>

      <!-- 已选款式 -->
      <div class="card mb-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-ink">已选款式</h3>
          <button @click="showStylePicker = true" class="text-sm font-medium text-primary-600">
            {{ selectedNailStyle ? '更换' : '选择款式' }}
          </button>
        </div>
        <div v-if="selectedNailStyle" class="flex items-center gap-3 rounded-2xl bg-primary-50 p-2.5">
          <img :src="selectedNailStyle.image" alt="" class="h-16 w-16 shrink-0 rounded-xl object-cover"/>
          <div class="min-w-0 flex-1">
            <p class="font-medium text-ink">{{ selectedNailStyle.name }}</p>
            <p class="mt-0.5 text-xs text-cocoa">{{ selectedNailStyle.description }}</p>
            <div class="mt-1.5 flex flex-wrap gap-1">
              <span v-for="tag in (selectedNailStyle.tags || []).slice(0, 3)" :key="tag" class="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] text-primary-700">{{ tag }}</span>
            </div>
          </div>
        </div>
        <div v-else class="flex items-center justify-center rounded-2xl border-2 border-dashed border-primary-200 py-6 text-sm text-placeholder">
          点击右上角选择参考款式
        </div>
      </div>

      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">已选服务</h3>
        <div v-if="selectedServices.length" class="space-y-2">
          <div v-for="s in selectedServices" :key="s.id" class="flex items-center justify-between rounded-xl bg-primary-50 p-3">
            <span class="text-sm text-ink">{{ s.name }}</span>
            <span class="text-sm font-medium text-primary-600">¥{{ s.price }}</span>
          </div>
          <div class="flex items-center justify-between border-t border-divider pt-3">
            <span class="font-medium text-ink">合计</span>
            <span class="text-lg font-medium text-primary-600">¥{{ totalPrice }}</span>
          </div>
        </div>
        <div v-else class="text-center text-sm text-cocoa py-4">暂未选择服务</div>
      </div>

      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">选择日期</h3>
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            v-for="d in dates"
            :key="d.key"
            @click="selectedDate = d.key"
            class="shrink-0 rounded-2xl px-4 py-3 text-center transition"
            :class="selectedDate === d.key ? 'bg-primary-500 text-white shadow-glow' : 'bg-primary-50 text-cocoa'"
          >
            <p class="text-xs">{{ d.weekday }}</p>
            <p class="mt-1 text-lg font-medium">{{ d.day }}</p>
            <p class="text-xs">{{ d.month }}</p>
          </button>
        </div>
      </div>

      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">选择时间</h3>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="t in timeSlots"
            :key="t"
            @click="selectedTime = t"
            class="rounded-xl py-3 text-center text-sm transition"
            :class="selectedTime === t ? 'bg-primary-500 text-white' : 'bg-primary-50 text-cocoa'"
          >
            {{ t }}
          </button>
        </div>
      </div>

      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">联系方式</h3>
        <input v-model="contactName" class="input-field mb-3" placeholder="您的姓名" />
        <input v-model="contactPhone" class="input-field" placeholder="手机号码" type="tel" />
      </div>

      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">备注</h3>
        <textarea
          v-model="remark"
          class="input-field min-h-[80px] resize-none"
          placeholder="有什么需要特别说明的吗？"
        ></textarea>
      </div>
    </main>

    <div class="fixed bottom-[90px] left-0 right-0 z-40 px-4">
      <div class="mx-auto max-w-md rounded-3xl border border-divider bg-white/95 px-4 py-3 shadow-card backdrop-blur flex gap-3">
        <div class="flex-1">
          <div class="text-xs text-cocoa">预约信息</div>
          <div class="text-sm text-ink">{{ selectedDate }} {{ selectedTime }}</div>
          <div class="text-lg font-medium text-primary-600">¥{{ totalPrice }}</div>
        </div>
        <button @click="confirmBooking" class="btn-primary">确认预约</button>
      </div>
    </div>

    <!-- 款式选择底单 -->
    <transition name="sheet">
      <div v-if="showStylePicker" class="fixed inset-0 z-50 flex flex-col justify-end">
        <div @click="showStylePicker = false" class="absolute inset-0 bg-ink/40 backdrop-blur-sm"></div>
        <div class="relative rounded-t-4xl bg-white px-5 pb-8 pt-5 shadow-card">
          <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-divider"></div>
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-medium text-ink">选择款式</h3>
            <button @click="showStylePicker = false" class="text-sm text-cocoa">关闭</button>
          </div>
          <div class="grid grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto scrollbar-hide pb-2">
            <button
              v-for="style in nailStyles"
              :key="style.id"
              @click="pickStyle(style)"
              class="overflow-hidden rounded-2xl bg-white shadow-soft transition active:scale-95"
              :class="selectedNailStyle?.id === style.id ? 'ring-2 ring-primary-500' : ''"
            >
              <img :src="style.image" alt="" class="aspect-square w-full object-cover"/>
              <div class="px-2 pb-2 pt-1.5">
                <p class="truncate text-[11px] font-medium text-ink">{{ style.name }}</p>
                <div class="mt-1 flex flex-wrap gap-0.5">
                  <span v-for="tag in (style.tags || []).slice(0, 2)" :key="tag" class="rounded-full bg-primary-50 px-1.5 py-0.5 text-[9px] text-primary-600">{{ tag }}</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showSuccess" class="fixed inset-0 z-50 grid place-items-center bg-ink/40 backdrop-blur-sm px-8">
        <div class="w-full max-w-sm rounded-4xl bg-white p-8 text-center shadow-card">
          <div class="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-success/15">
            <svg class="h-10 w-10 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 class="text-xl font-medium text-ink">预约成功！</h2>
          <p class="mt-2 text-sm text-cocoa">{{ salon?.name }} {{ selectedDate }} {{ selectedTime }}</p>
          <p class="text-sm text-cocoa">美甲师会提前与您联系确认</p>
          <div class="mt-6 flex gap-3">
            <button @click="goOrders" class="flex-1 btn-secondary">查看订单</button>
            <button @click="goBack" class="flex-1 btn-primary">返回</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { salons, nailStyles } from '../data/mockData'

const router = useRouter()
const route = useRoute()

const salonId = parseInt(route.params.salonId)
const salon = computed(() => salons.find(s => s.id === salonId))

const selectedNailStyle = ref(null)
const showStylePicker = ref(false)

onMounted(() => {
  const raw = sessionStorage.getItem('tryonStyle')
  if (raw) {
    const data = JSON.parse(raw)
    if (data.styleId) {
      selectedNailStyle.value = nailStyles.find(s => s.id === data.styleId) ?? null
    }
    if (!selectedNailStyle.value && data.image) {
      selectedNailStyle.value = { id: null, name: data.name, image: data.image, description: '试戴款式', tags: [] }
    }
  }
})

const pickStyle = (style) => {
  selectedNailStyle.value = style
  showStylePicker.value = false
}

const selectedServices = ref([
  { id: 1, name: '日式美甲', price: 168 }
])

const totalPrice = computed(() => selectedServices.value.reduce((s, item) => s + item.price, 0))

const now = new Date()
const dates = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(now.getTime() + i * 86400000)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return {
    key: `${d.getMonth() + 1}/${d.getDate()}`,
    weekday: i === 0 ? '今天' : i === 1 ? '明天' : weekdays[d.getDay()],
    day: d.getDate(),
    month: `${d.getMonth() + 1}月`
  }
})

const selectedDate = ref(dates[0].key)
const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const selectedTime = ref('14:00')
const contactName = ref('')
const contactPhone = ref('')
const remark = ref('')
const showSuccess = ref(false)

const goBack = () => router.back()
const goOrders = () => {
  showSuccess.value = false
  router.push('/orders')
}

const confirmBooking = () => {
  if (!contactName.value.trim() || !contactPhone.value.trim()) {
    alert('请填写您的姓名和手机号码')
    return
  }
  showSuccess.value = true
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.sheet-enter-active, .sheet-leave-active { transition: all 0.35s ease; }
.sheet-enter-from .relative, .sheet-leave-to .relative { transform: translateY(100%); }
.sheet-enter-from .absolute, .sheet-leave-to .absolute { opacity: 0; }
</style>
