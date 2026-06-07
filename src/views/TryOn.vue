<template>
  <div class="phone-shell min-h-screen flex flex-col pb-28">
    <!-- ═══ Header ═══ -->
    <header class="shrink-0 px-5 pt-4 pb-2">
      <div class="flex items-center gap-2">
        <button @click="$router.back()" class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white shadow-soft">
          <svg class="h-4 w-4 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span class="text-xs font-medium text-primary-600 tracking-wide">AI TRY-ON</span>
        <span class="text-base font-medium text-ink">智能试戴</span>
      </div>
    </header>

    <main class="flex-1 flex flex-col px-5 min-h-0">
      <!-- ═══ Dual Image Cards — compact ═══ -->
      <section class="shrink-0 grid grid-cols-2 gap-2.5">
        <!-- Hand -->
        <div class="overflow-hidden rounded-2xl bg-white shadow-soft">
          <div class="flex items-center justify-between px-2 pt-2">
            <span class="text-[11px] font-medium text-primary-600">✋ 我的手</span>
            <button v-if="handImage" @click="triggerHandUpload" class="text-[10px] text-primary-600">更换</button>
          </div>
          <div class="p-2 pt-1.5">
            <div class="relative aspect-[3/4] max-h-[180px] w-full overflow-hidden rounded-xl"
              :class="handImage ? 'bg-cream' : 'border-2 border-dashed border-primary-200 bg-primary-50/40'">
              <img v-if="handImage" :src="handImage" alt="手部照片" class="h-full w-full object-cover" />
              <div v-else class="grid h-full place-items-center p-2">
                <div class="flex w-full flex-col gap-1">
                  <button @click="triggerHandCamera" class="rounded-lg bg-blush py-2 text-[11px] font-medium text-primary-700 active:scale-95 transition">📷 拍照</button>
                  <button @click="triggerHandUpload" class="rounded-lg bg-blush py-2 text-[11px] font-medium text-primary-700 active:scale-95 transition">🖼️ 相册</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Design -->
        <div class="overflow-hidden rounded-2xl bg-white shadow-soft">
          <div class="flex items-center justify-between px-2 pt-2">
            <span class="text-[11px] font-medium text-primary-600">💅 美甲款式</span>
            <button v-if="designImage" @click="clearDesign" class="text-[10px] text-cocoa">更换</button>
          </div>
          <div class="p-2 pt-1.5">
            <div class="relative aspect-[3/4] max-h-[180px] w-full overflow-hidden rounded-xl"
              :class="designImage ? 'bg-cream' : 'border-2 border-dashed border-primary-200 bg-primary-50/40'">
              <img v-if="designImage" :src="designImage" alt="美甲款式" class="h-full w-full object-cover" />
              <div v-else class="grid h-full place-items-center p-2">
                <div class="flex w-full flex-col gap-1">
                  <button @click="triggerDesignCamera" class="rounded-lg bg-blush py-2 text-[11px] font-medium text-primary-700 active:scale-95 transition">📷 拍照</button>
                  <button @click="triggerDesignUpload" class="rounded-lg bg-blush py-2 text-[11px] font-medium text-primary-700 active:scale-95 transition">🖼️ 相册</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ Connector + Style Library ═══ -->
      <div class="shrink-0 flex items-center justify-center gap-2 py-2">
        <div class="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] text-cocoa/60 shadow-soft">
          <span>手部</span><span class="text-primary-300">→</span><span>美甲</span><span class="text-primary-300">→</span><span>试戴</span>
        </div>
        <button @click="openStyleGallery" class="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-primary-600 shadow-soft active:scale-95">款式库</button>
      </div>

      <!-- ═══ Style Gallery ═══ -->
      <section v-if="showStyleGallery" class="shrink-0 mb-1">
        <div class="grid grid-cols-4 gap-1.5">
          <button v-for="style in nailStyles" :key="style.id" @click="selectStyle(style)"
            class="overflow-hidden rounded-xl bg-white shadow-soft active:scale-95 transition"
            :class="selectedStyle.id === style.id ? 'ring-2 ring-primary-500' : ''">
            <img :src="style.image" alt="" class="aspect-square w-full object-cover" />
            <p class="truncate px-1 pb-1 text-[10px] font-medium text-ink">{{ style.name }}</p>
          </button>
        </div>
      </section>

      <!-- ═══ Try-On Button ═══ -->
      <button @click="startTryOn" :disabled="!handImage || isTryOnRunning"
        class="shrink-0 my-1.5 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white transition"
        :class="handImage ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-glow active:scale-[0.98]' : 'bg-divider text-cocoa/50'">
        <span>✨</span> {{ isTryOnRunning ? 'AI 试戴中...' : '开始 AI 试戴' }}
      </button>

      <!-- ═══ Result: Left Image + Right Info ═══ -->
      <section v-if="tryOnResult" class="flex-1 min-h-0 grid grid-cols-[1fr_130px] gap-2.5 pb-2">
        <!-- LEFT: Result Image -->
        <div class="overflow-hidden rounded-2xl bg-white shadow-soft flex flex-col">
          <div class="flex items-center justify-between px-2 pt-2">
            <span class="text-[11px] font-medium text-primary-600">✨ 试戴效果
              <span v-if="tryOnMode==='ai'" class="ml-1 text-[10px] text-success">🤖 AI</span>
              <span v-else-if="tryOnMode==='fallback'" class="ml-1 text-[10px] text-warning">⚠ 离线</span>
            </span>
            <span class="text-[10px] font-semibold text-primary-600">{{ matchScore }}% 匹配</span>
          </div>
          <div class="flex-1 p-2 pt-1.5 min-h-0">
            <div class="relative aspect-[3/4] max-h-full w-full overflow-hidden rounded-xl bg-cream mx-auto">
              <img :src="tryOnResult" alt="试戴效果" class="h-full w-full object-cover" />
            </div>
          </div>
        </div>

        <!-- RIGHT: Actions Column -->
        <div class="flex flex-col gap-2">
          <div class="flex gap-1.5">
            <button @click="saveDesign" class="flex-1 rounded-lg bg-white py-2 text-[10px] font-medium text-primary-600 shadow-soft active:scale-95">保存</button>
            <button @click="showSharePanel = true" class="flex-1 rounded-lg bg-white py-2 text-[10px] font-medium text-primary-600 shadow-soft active:scale-95">分享</button>
          </div>
          <div class="rounded-xl bg-white p-2.5 shadow-soft flex-1 flex flex-col justify-center gap-2">
            <p class="text-xs font-medium text-ink leading-tight">{{ selectedStyle?.name || '试戴款式' }}</p>
            <div class="space-y-1.5 text-[10px] text-cocoa">
              <div class="flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-success"></span>匹配度 {{ matchScore }}%</div>
              <div class="flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-primary-400"></span>支持到店调整</div>
              <div class="flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-warning"></span>免费卸甲一次</div>
            </div>
          </div>
          <button @click="showBookingModal = true"
            class="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-2.5 text-xs font-semibold text-white shadow-glow active:scale-[0.97]">
            📋 一键预约
          </button>
        </div>
      </section>
    </main>

    <!-- Hidden file inputs -->
    <input ref="handCameraInput" type="file" accept="image/*" capture="environment" class="hidden" @change="onHandFileChange" />
    <input ref="handFileInput" type="file" accept="image/*" class="hidden" @change="onHandFileChange" />
    <input ref="designCameraInput" type="file" accept="image/*" capture="environment" class="hidden" @change="onDesignFileChange" />
    <input ref="designFileInput" type="file" accept="image/*" class="hidden" @change="onDesignFileChange" />

    <!-- Booking Selection Modal -->
    <transition name="sheet">
      <div v-if="showBookingModal" class="fixed inset-0 z-[60] flex flex-col justify-end">
        <div @click="showBookingModal = false" class="absolute inset-0 bg-ink/40 backdrop-blur-sm"></div>
        <div class="relative max-h-[80vh] overflow-y-auto rounded-t-4xl bg-cream p-5 shadow-card max-w-md mx-auto w-full">
          <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-divider"></div>

          <!-- Step 1: 选择店铺 -->
          <template v-if="bookingStep === 1">
            <h3 class="mb-1 text-lg font-medium text-ink">选择店铺</h3>
            <p class="mb-4 text-xs text-cocoa">选择你想预约的美甲店铺</p>
            <div class="space-y-2.5">
              <div
                v-for="salon in salonsWithTags"
                :key="salon.id"
                @click="selectBookingSalon(salon)"
                class="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-3 shadow-soft transition active:scale-[0.98]"
                :class="selectedBookingSalon?.id === salon.id ? 'ring-2 ring-primary-400' : ''"
              >
                <img :src="salon.image" alt="" class="h-16 w-16 shrink-0 rounded-2xl object-cover" />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h4 class="text-sm font-medium text-ink">{{ salon.name }}</h4>
                    <span v-for="tag in salon.tags" :key="tag" class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="tagClass(tag)">{{ tag }}</span>
                  </div>
                  <div class="mt-1 flex items-center gap-2 text-xs text-cocoa">
                    <span class="flex items-center gap-0.5"><svg class="h-3 w-3 text-warning" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>{{ salon.rating }}</span>
                    <span>{{ salon.location }}</span>
                    <span>{{ salon.distance }}</span>
                  </div>
                </div>
                <svg v-if="selectedBookingSalon?.id === salon.id" class="h-5 w-5 shrink-0 text-primary-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              </div>
            </div>
            <button @click="bookingStep = 2" :disabled="!selectedBookingSalon" class="mt-4 w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition" :class="selectedBookingSalon ? 'bg-primary-500 shadow-glow active:scale-[0.98]' : 'bg-divider text-cocoa/50 cursor-not-allowed'">下一步 · 选择美甲师</button>
          </template>

          <!-- Step 2: 选择美甲师 -->
          <template v-if="bookingStep === 2">
            <div class="flex items-center gap-2 mb-4">
              <button @click="bookingStep = 1" class="grid h-8 w-8 place-items-center rounded-full bg-white text-ink shadow-soft"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg></button>
              <div><h3 class="text-lg font-medium text-ink">选择美甲师</h3><p class="text-xs text-cocoa">{{ selectedBookingSalon?.name }}</p></div>
            </div>
            <div class="space-y-2.5">
              <div v-for="artist in filteredBookingArtists" :key="artist.id" @click="selectedBookingArtist = artist" class="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-3 shadow-soft transition active:scale-[0.98]" :class="selectedBookingArtist?.id === artist.id ? 'ring-2 ring-primary-400' : ''">
                <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-600">{{ artist.avatar }}</div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h4 class="text-sm font-medium text-ink">{{ artist.name }}</h4>
                    <span class="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-600">{{ artist.role }}</span>
                    <span v-for="tag in artistBookingTags(artist)" :key="tag" class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="tagClass(tag)">{{ tag }}</span>
                  </div>
                  <div class="mt-1 flex items-center gap-3 text-xs text-cocoa">
                    <span>{{ artist.specialty }}</span>
                    <span class="flex items-center gap-0.5"><svg class="h-3 w-3 text-warning" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>{{ artist.goodReviews }}好评</span>
                  </div>
                </div>
                <svg v-if="selectedBookingArtist?.id === artist.id" class="h-5 w-5 shrink-0 text-primary-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              </div>
            </div>
            <div v-if="filteredBookingArtists.length === 0" class="py-8 text-center text-sm text-cocoa">该店铺暂无美甲师</div>
            <button @click="confirmBookingWithSelection" :disabled="!selectedBookingArtist" class="mt-4 w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition" :class="selectedBookingArtist ? 'bg-primary-500 shadow-glow active:scale-[0.98]' : 'bg-divider text-cocoa/50 cursor-not-allowed'">确认预约 · {{ selectedBookingArtist ? selectedBookingArtist.name : '' }}</button>
          </template>
        </div>
      </div>
    </transition>

    <!-- Share Panel -->
    <transition name="sheet">
      <div v-if="showSharePanel" class="fixed inset-0 z-[60] flex flex-col justify-end">
        <div @click="showSharePanel = false" class="absolute inset-0 bg-ink/40 backdrop-blur-sm"></div>
        <div class="relative rounded-t-4xl bg-white p-5 shadow-card max-w-md mx-auto w-full">
          <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-divider"></div>
          <h3 class="mb-4 text-lg font-medium text-ink">分享试戴效果</h3>
          <div class="grid grid-cols-4 gap-4">
            <button v-for="p in sharePlatforms" :key="p.name" @click="shareTo(p.name)" class="flex flex-col items-center gap-2">
              <div class="grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-2xl">{{ p.icon }}</div>
              <span class="text-xs text-cocoa">{{ p.name }}</span>
            </button>
          </div>
          <button @click="showSharePanel = false" class="mt-5 w-full rounded-2xl bg-cream py-3 text-sm text-cocoa">取消</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { nailStyles, salons, nailArtists, reservations } from '../data/mockData'

const route = useRoute()
const router = useRouter()

const handImage = ref('')
const designImage = ref('')
const isTryOnRunning = ref(false)
const tryOnResult = ref('')
const selectedStyle = ref(nailStyles[0])

// Pre-load style from query params
// /tryon?style=2           → 款式库指定款式
// /tryon?theme=3           → 灵感合集指定主题
// /tryon?workTitle=...&workImage=...  → 美甲师作品
onMounted(() => {
  const styleId = parseInt(route.query.style)
  const themeId = parseInt(route.query.theme)
  const workImage = route.query.workImage
  const workTitle = route.query.workTitle

  if (workImage) {
    // 美甲师作品 → 试戴
    designImage.value = decodeURIComponent(workImage)
    selectedStyle.value = { id: 0, name: decodeURIComponent(workTitle || '美甲作品'), image: designImage.value }
  } else if (themeId) {
    // 灵感合集 → 试戴（使用对应主题的第一张本地图片）
    const themeImages = [
      '/images/nails/nail-01.jpg', '/images/nails/nail-03.png', '/images/nails/nail-04.png',
      '/images/nails/nail-02.png', '/images/nails/nail-06.png', '/images/nails/nail-05.png',
      '/images/nails/nail-08.png', '/images/nails/nail-12.png'
    ]
    const img = themeImages[(themeId - 1) % themeImages.length]
    designImage.value = img
    selectedStyle.value = { id: themeId, name: '灵感款式', image: img }
  } else if (styleId) {
    const style = nailStyles.find(s => s.id === styleId)
    if (style) {
      selectedStyle.value = style
      designImage.value = style.image
    }
  }
})
const showStyleGallery = ref(false)
const showSharePanel = ref(false)
const matchScore = ref(96)

// ── 预约弹窗 ───────────────────────────────────────────
const showBookingModal = ref(false)
const bookingStep = ref(1)
const selectedBookingSalon = ref(null)
const selectedBookingArtist = ref(null)

// 用户上次做过的店铺ID（从预约记录取）
const lastSalonId = computed(() => {
  const last = reservations.find(r => r.status === 'completed')
  return last?.salonId || null
})

// 店铺列表带 tag
const salonsWithTags = computed(() => {
  return salons.map(s => {
    const tags = []
    if (s.id === lastSalonId.value) tags.push('上次做过')
    // 按距离排序取最前面几个
    const sorted = [...salons].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    if (sorted[0]?.id === s.id) tags.push('离你最近')
    if (s.rating >= 4.8) tags.push('最近好评')
    if (s.reviews >= 1000) tags.push('人气最高')
    return { ...s, tags }
  }).sort((a, b) => {
    // 上次做过的排最前
    if (a.id === lastSalonId.value) return -1
    if (b.id === lastSalonId.value) return 1
    return parseFloat(a.distance) - parseFloat(b.distance)
  })
})

// 当前选中店铺的美甲师
const filteredBookingArtists = computed(() => {
  if (!selectedBookingSalon.value) return []
  return nailArtists.filter(a => a.salonId === selectedBookingSalon.value.id)
})

// 美甲师 tag
const artistBookingTags = (artist) => {
  const tags = []
  if (lastSalonId.value && artist.salonId === lastSalonId.value && reservations.some(r => r.artistName.includes(artist.name) && r.status === 'completed')) {
    tags.push('上次做过')
  }
  if (artist.goodReviews >= 400) tags.push('最近好评')
  if (artist.years >= 8) tags.push('资深')
  return tags
}

// tag 样式
const tagClass = (tag) => {
  const map = {
    '离你最近': 'bg-success/10 text-success',
    '上次做过': 'bg-warning/10 text-warning',
    '最近好评': 'bg-primary-100 text-primary-700',
    '人气最高': 'bg-error/10 text-error',
    '资深': 'bg-primary-100 text-primary-700'
  }
  return map[tag] || 'bg-primary-50 text-primary-600'
}

const selectBookingSalon = (salon) => {
  selectedBookingSalon.value = salon
  selectedBookingArtist.value = null
}

const confirmBookingWithSelection = () => {
  if (!selectedBookingArtist.value || !selectedBookingSalon.value) return
  const salonId = selectedBookingSalon.value.id
  const name = selectedStyle.value?.name || '试戴款式'
  const img = designImage.value || tryOnResult.value
  showBookingModal.value = false
  router.push(`/booking/${salonId}?designImage=${encodeURIComponent(img)}&designName=${encodeURIComponent(name)}&artistId=${selectedBookingArtist.value.id}`)
}

// ── file input refs ────────────────────────────────────
const handFileInput = ref(null)
const handCameraInput = ref(null)
const designFileInput = ref(null)
const designCameraInput = ref(null)

// ── share config ───────────────────────────────────────
const sharePlatforms = [
  { name: '微信', icon: '💬' },
  { name: '朋友圈', icon: '🟢' },
  { name: '小红书', icon: '📕' },
  { name: '微博', icon: '🔴' },
  { name: '保存图片', icon: '💾' },
  { name: '复制链接', icon: '🔗' },
  { name: '抖音', icon: '🎵' },
  { name: '更多', icon: '⋯' }
]

// ── file reader with compression ────────────────────────
const MAX_IMG_DIM = 1024 // max width/height for API

const readFileCompressed = (file) => new Promise((resolve) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width <= MAX_IMG_DIM && height <= MAX_IMG_DIM) {
        resolve(e.target.result)
        return
      }
      const ratio = Math.min(MAX_IMG_DIM / width, MAX_IMG_DIM / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
})

// ── hand photo ─────────────────────────────────────────
const triggerHandCamera = () => handCameraInput.value?.click()
const triggerHandUpload = () => handFileInput.value?.click()

const onHandFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  handImage.value = await readFileCompressed(file)
  e.target.value = ''
}

// ── design image ───────────────────────────────────────
const triggerDesignCamera = () => designCameraInput.value?.click()
const triggerDesignUpload = () => designFileInput.value?.click()

const onDesignFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  designImage.value = await readFileCompressed(file)
  e.target.value = ''
}

// ── style gallery ──────────────────────────────────────
const openStyleGallery = () => {
  showStyleGallery.value = true
}

const selectStyle = (style) => {
  selectedStyle.value = style
  designImage.value = style.image
  showStyleGallery.value = false
  tryOnResult.value = ''
}

const clearDesign = () => {
  designImage.value = ''
  tryOnResult.value = ''
}

const tryOnMode = ref('') // '' | 'ai' | 'fallback'

// ── try-on (real AI) ───────────────────────────────────
const startTryOn = async () => {
  if (!handImage.value || isTryOnRunning.value) return
  isTryOnRunning.value = true
  tryOnResult.value = ''
  tryOnMode.value = ''

  try {
    let token = localStorage.getItem('miaoshou_token')
    if (!token) {
      const loginRes = await axios.post('/v1/auth/login', { phone: '13800000001', code: '000000' })
      token = loginRes.data?.data?.token
      if (token) localStorage.setItem('miaoshou_token', token)
    }

    const labels = selectedStyle.value?.labels || {}
    const res = await axios.post('/v1/tryon/generate', {
      hand_image_url: handImage.value,
      design_image_url: designImage.value || selectedStyle.value?.image || '',
      labels,
    }, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 300000, // 5 min timeout for AI generation
    })

    const data = res.data?.data
    tryOnResult.value = data?.result_url || (designImage.value || handImage.value)
    matchScore.value = data?.match_score || 95
    tryOnMode.value = data?.mode || 'fallback'
    console.log('AI try-on done:', data?.mode, data?.result_url)
  } catch (err) {
    console.error('AI try-on failed:', err?.response?.status, err?.message, err?.code)
    tryOnResult.value = designImage.value || handImage.value
    matchScore.value = Math.floor(85 + Math.random() * 10)
    tryOnMode.value = 'fallback'
    if (err?.code === 'ECONNABORTED') alert('AI 试戴超时，请重试')
    else if (err?.response?.status === 401) {
      localStorage.removeItem('miaoshou_token')
      alert('登录已过期，请重试')
    } else if (err?.code === 'ERR_NETWORK' || err?.response?.status === 413) {
      alert('图片过大，请缩小图片或使用款式库选图')
    }
  } finally {
    isTryOnRunning.value = false
  }
}

// ── save / load ────────────────────────────────────────
const saveDesign = () => {
  alert('试戴效果已保存')
}

// ── 一键预约弹窗控制 ──────────────────────────────────
const goToBooking = () => {
  // Reset modal state
  bookingStep.value = 1
  selectedBookingSalon.value = null
  selectedBookingArtist.value = null
  showBookingModal.value = true
}

// ── share ──────────────────────────────────────────────
const shareTo = (platform) => {
  showSharePanel.value = false
  if (platform === '复制链接') {
    navigator.clipboard?.writeText(window.location.href)
    alert('链接已复制')
  } else if (platform === '保存图片') {
    alert('图片已保存到相册')
  } else {
    alert(`已分享到${platform}`)
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.sheet-enter-active, .sheet-leave-active { transition: all 0.3s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from div:last-child,
.sheet-leave-to div:last-child { transform: translateY(100%); }
</style>
