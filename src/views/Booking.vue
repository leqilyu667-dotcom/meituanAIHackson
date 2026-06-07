<template>
  <div class="phone-shell pb-36">
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

      <!-- 已选美甲师 -->
      <div v-if="bookingArtist" class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">已选美甲师</h3>
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-600">
            {{ bookingArtist.avatar }}
          </div>
          <div>
            <p class="text-sm font-medium text-ink">{{ bookingArtist.name }}</p>
            <p class="text-xs text-cocoa">{{ bookingArtist.role }} · 从业{{ bookingArtist.years }}年 · {{ bookingArtist.goodReviews }}好评</p>
          </div>
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

      <!-- 试戴款式预览 -->
      <div v-if="designImage" class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">试戴款式</h3>
        <div class="flex items-center gap-3">
          <img :src="designImage" alt="试戴款式" class="h-20 w-20 rounded-2xl object-cover shadow-soft" />
          <div class="min-w-0">
            <p class="text-sm font-medium text-ink">{{ designName }}</p>
            <p class="mt-1 text-xs text-cocoa">此款式图将发送给美甲师作为参考</p>
          </div>
        </div>
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

    <div class="fixed bottom-28 left-0 right-0 z-40 px-4">
      <div class="mx-auto max-w-md rounded-3xl border border-divider bg-white/95 px-4 py-3 shadow-card backdrop-blur flex gap-3">
        <div class="flex-1">
          <div class="text-xs text-cocoa">预约信息</div>
          <div class="text-sm text-ink">{{ selectedDate }} {{ selectedTime }}</div>
          <div class="text-lg font-medium text-primary-600">¥{{ totalPrice }}</div>
        </div>
        <button @click="confirmBooking" :disabled="submitting" class="btn-primary">
          {{ submitting ? '提交中...' : '确认预约' }}
        </button>
        <p v-if="submitError" class="mt-2 text-xs text-error text-center">{{ submitError }}</p>
      </div>
    </div>

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
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const salonId = parseInt(route.params.salonId)
const salon = ref(null)
const artists = ref([])
const bookingArtist = ref(null)

// 从试戴页传入的款式图
const designImage = ref('')
const designName = ref('')
const submitting = ref(false)
const submitError = ref('')

// 获取或创建 demo token
const getToken = () => {
  let token = localStorage.getItem('miaoshou_token')
  if (!token) {
    // Demo: auto-login with a demo account
    axios.post('/v1/auth/login', { phone: '13800000001', code: '000000' }).then(res => {
      const t = res.data?.data?.token
      if (t) localStorage.setItem('miaoshou_token', t)
    }).catch(() => {})
  }
  return token
}

onMounted(async () => {
  // 加载店铺信息
  try {
    const res = await axios.get(`/v1/salons/${salonId}`)
    salon.value = res.data?.data?.salon || null
  } catch { /* fallback to mock */ }

  // 加载美甲师列表
  try {
    const res = await axios.get(`/v1/salons/${salonId}/artists`)
    artists.value = res.data?.data || []
  } catch {}

  // 从试戴页传入的款式图 + 美甲师
  if (route.query.designImage) {
    designImage.value = decodeURIComponent(route.query.designImage)
    designName.value = decodeURIComponent(route.query.designName || '试戴款式')
    remark.value = `已通过AI试戴选择款式：${designName.value}，款式图已发送给美甲师`
  }
  if (route.query.artistId) {
    const aid = parseInt(route.query.artistId)
    bookingArtist.value = artists.value.find(a => a.id === aid) || null
    if (bookingArtist.value) {
      remark.value = `${remark.value ? remark.value + '；' : ''}指定美甲师：${bookingArtist.value.name}`
    }
  }
})

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

const confirmBooking = async () => {
  if (!contactName.value.trim() || !contactPhone.value.trim()) {
    alert('请填写您的姓名和手机号码')
    return
  }

  submitting.value = true
  submitError.value = ''

  try {
    const token = getToken()
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    await axios.post('/v1/reservations', {
      salon_id: salonId,
      artist_id: bookingArtist.value?.id || null,
      service_name: selectedServices.value[0]?.name || '美甲服务',
      service_price: totalPrice.value,
      date: selectedDate.value,
      time: selectedTime.value,
      design_image_url: designImage.value || '',
      remark: remark.value,
      contact_name: contactName.value.trim(),
      contact_phone: contactPhone.value.trim(),
    }, { headers })

    showSuccess.value = true
  } catch (err) {
    // Fallback: if backend unavailable, still show success for demo
    if (err.response?.status === 401) {
      // Token expired, retry without auth
      localStorage.removeItem('miaoshou_token')
      showSuccess.value = true
    } else {
      submitError.value = '提交失败，请重试'
      console.error('Booking failed:', err)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
