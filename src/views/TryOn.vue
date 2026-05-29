<template>
  <div class="phone-shell pb-32">
    <header class="px-5 pb-3 pt-5">
      <div class="flex items-center gap-3">
        <button @click="$router.back()" class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white shadow-soft">
          <svg class="h-5 w-5 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div class="flex-1">
          <p class="eyebrow">AI TRY-ON</p>
          <h1 class="text-[22px] font-medium leading-[30px] text-ink">智能试戴</h1>
        </div>
        <!-- 当前款式名 -->
        <div v-if="selectedStyle" class="rounded-2xl bg-primary-100 px-3 py-1.5 text-center">
          <p class="text-[11px] text-primary-700 font-medium truncate max-w-[72px]">{{ selectedStyle.name }}</p>
        </div>
      </div>
    </header>

    <main class="px-5 space-y-4">

      <!-- ═══ 双图卡片 ═══ -->
      <section class="grid grid-cols-2 gap-3">
        <!-- 手/脚照片 -->
        <div class="overflow-hidden rounded-3xl bg-white shadow-card">
          <div class="flex items-center justify-between px-3 pt-3">
            <span class="text-xs font-medium text-primary-600">✋ 我的手</span>
            <button v-if="handImage" @click="triggerHandUpload" class="rounded-full bg-cream px-2.5 py-1 text-[11px] font-medium text-primary-700">更换</button>
          </div>
          <div class="flex justify-center pb-3">
            <div
              class="relative aspect-[3/4] min-h-[220px] w-[calc(100%-24px)] overflow-hidden rounded-2xl"
              :class="handImage ? 'bg-cream' : 'border-2 border-dashed border-primary-200 bg-primary-50/40'"
            >
              <img v-if="handImage" :src="handImage" alt="" class="h-full w-full object-cover" />
              <div v-else class="grid h-full place-items-center p-2">
                <div class="flex w-full flex-col gap-2">
                  <button @click="triggerHandCamera" class="flex items-center justify-center gap-1 rounded-xl bg-blush py-2.5 text-xs font-medium text-primary-700 active:scale-95 transition">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                    </svg>
                    拍照
                  </button>
                  <button @click="triggerHandUpload" class="flex items-center justify-center gap-1 rounded-xl bg-blush py-2.5 text-xs font-medium text-primary-700 active:scale-95 transition">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                    </svg>
                    相册
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 美甲款式 -->
        <div class="overflow-hidden rounded-3xl bg-white shadow-card">
          <div class="flex items-center justify-between px-3 pt-3">
            <span class="text-xs font-medium text-primary-600">💅 美甲款式</span>
            <button v-if="designImage" @click="openStyleGallery" class="rounded-full bg-cream px-2.5 py-1 text-[11px] font-medium text-cocoa">更换</button>
          </div>
          <div class="flex justify-center pb-3">
            <div
              class="relative aspect-[3/4] min-h-[220px] w-[calc(100%-24px)] overflow-hidden rounded-2xl"
              :class="designImage ? 'bg-cream' : 'border-2 border-dashed border-primary-200 bg-primary-50/40'"
            >
              <img v-if="designImage" :src="designImage" alt="" class="h-full w-full object-cover" />
              <div v-else class="grid h-full place-items-center p-2">
                <div class="flex w-full flex-col gap-2">
                  <button @click="openStyleGallery" class="flex items-center justify-center gap-1.5 rounded-xl bg-blush py-2.5 text-xs font-medium text-primary-700 active:scale-95 transition">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                    款式库
                  </button>
                  <button @click="triggerDesignUpload" class="flex items-center justify-center gap-1.5 rounded-xl bg-blush py-2.5 text-xs font-medium text-primary-700 active:scale-95 transition">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                    </svg>
                    相册
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ 美甲师选择（可选）═══ -->
      <section class="rounded-3xl bg-white p-4 shadow-soft">
        <button @click="showArtists = !showArtists" class="flex w-full items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-ink">选择美甲师</span>
            <span class="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] text-primary-700">可选</span>
            <span v-if="selectedArtist" class="flex items-center gap-1 text-xs text-cocoa">
              <span
                class="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                :class="badgeClass(selectedArtist.badge?.style)"
              >{{ selectedArtist.badge?.text }}</span>
              {{ selectedArtist.name }} · {{ selectedArtist.salonName }}
            </span>
          </div>
          <svg class="h-4 w-4 text-cocoa transition-transform" :class="showArtists ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        <div v-if="showArtists" class="mt-3 flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
          <!-- 随机分配 -->
          <div
            @click="selectedArtist = null"
            class="w-[84px] shrink-0 cursor-pointer rounded-2xl px-2 pb-2.5 pt-2 text-center transition-all active:scale-95"
            :class="!selectedArtist ? 'bg-primary-100 ring-2 ring-primary-400' : 'bg-cream'"
          >
            <!-- 徽标占位，保持高度对齐 -->
            <div class="h-[18px]"></div>
            <div class="mx-auto mb-1.5 flex h-12 w-12 items-center justify-center rounded-full bg-primary-200 text-xl">
              🎲
            </div>
            <p class="text-[11px] font-semibold text-ink">随机</p>
            <p class="mt-0.5 text-[9px] text-cocoa">系统分配</p>
          </div>

          <!-- 美甲师列表 -->
          <div
            v-for="artist in nailArtists"
            :key="artist.id"
            @click="selectedArtist = artist"
            class="w-[84px] shrink-0 cursor-pointer rounded-2xl px-2 pb-2.5 pt-2 text-center transition-all active:scale-95"
            :class="selectedArtist?.id === artist.id ? 'bg-primary-100 ring-2 ring-primary-400' : 'bg-cream'"
          >
            <!-- 徽标 -->
            <div class="mb-1.5 flex h-[18px] items-center justify-center">
              <span
                v-if="artist.badge"
                class="rounded-full px-1.5 py-[2px] text-[9px] font-semibold leading-tight"
                :class="badgeClass(artist.badge.style)"
              >{{ artist.badge.text }}</span>
            </div>
            <!-- 头像 -->
            <div
              class="mx-auto mb-1.5 flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-white"
              :style="{ background: artist.avatarBg }"
            >
              {{ artist.name.charAt(0) }}
            </div>
            <!-- 姓名 -->
            <p class="truncate text-[11px] font-semibold text-ink">{{ artist.name }}</p>
            <!-- 职位 -->
            <p class="mt-0.5 truncate text-[10px] text-cocoa">{{ artist.title }}</p>
            <!-- 所属店铺 -->
            <p class="mt-0.5 truncate text-[9px] text-placeholder">{{ artist.salonName }}</p>
          </div>
        </div>
      </section>

      <!-- ═══ 款式切换快捷栏 ═══ -->
      <div class="flex items-center gap-2">
        <div class="flex flex-1 items-center gap-2 overflow-hidden rounded-full bg-white px-4 py-1.5 text-xs text-cocoa/60 shadow-soft">
          <span>手部</span>
          <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          <span class="truncate">{{ selectedStyle?.name || '美甲款式' }}</span>
          <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          <span>试戴效果</span>
        </div>
        <button @click="openStyleGallery" class="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-primary-600 shadow-soft transition active:scale-95">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          款式库
        </button>
      </div>

      <!-- ═══ 款式库 Gallery ═══ -->
      <section v-if="showStyleGallery">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-medium text-ink">选择款式</h3>
          <button @click="showStyleGallery = false" class="text-xs text-cocoa/60">收起</button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="style in nailStyles"
            :key="style.id"
            @click="selectStyle(style)"
            class="relative overflow-hidden rounded-2xl bg-white shadow-soft transition active:scale-95"
            :class="selectedStyle?.id === style.id ? 'ring-2 ring-primary-500' : ''"
          >
            <img :src="style.image" alt="" class="aspect-square w-full object-cover" />
            <div class="px-2 pb-2 pt-1.5">
              <p class="truncate text-[11px] font-medium text-ink">{{ style.name }}</p>
              <div class="mt-1 flex flex-wrap gap-0.5">
                <span v-for="tag in style.tags.slice(0, 2)" :key="tag" class="rounded-full bg-primary-50 px-1.5 py-0.5 text-[9px] text-primary-600">{{ tag }}</span>
              </div>
            </div>
          </button>
        </div>
      </section>

      <!-- ═══ AI 试戴按钮 ═══ -->
      <button
        @click="startTryOn"
        :disabled="!handImage || isTryOnRunning"
        class="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white transition"
        :class="handImage ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-glow active:scale-[0.98]' : 'cursor-not-allowed bg-divider text-cocoa/50'"
      >
        <svg v-if="isTryOnRunning" class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="31.4 31.4" stroke-linecap="round"/>
        </svg>
        <span v-else class="text-lg">✨</span>
        {{ isTryOnRunning ? 'AI 试戴中...' : '开始 AI 试戴' }}
      </button>

      <!-- ═══ 试戴效果 ═══ -->
      <section v-if="tryOnResult">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="section-title">试戴效果</h3>
          <span class="text-xs font-medium text-primary-600">{{ matchScore }}% 匹配</span>
        </div>
        <div class="relative overflow-hidden rounded-3xl shadow-card">
          <img :src="tryOnResult" alt="试戴效果" class="w-full object-cover" />
          <div class="absolute bottom-3 right-3 flex gap-2">
            <button @click="saveDesign" class="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-primary-600 shadow backdrop-blur">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </button>
            <button @click="showSharePanel = true" class="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-primary-600 shadow backdrop-blur">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
            </button>
          </div>
        </div>
        <!-- 去预约 CTA -->
        <button
          @click="goToBooking"
          class="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 py-3.5 text-[15px] font-semibold text-white shadow-glow transition active:scale-[0.98]"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          去预约 · 用这个款式
        </button>

        <!-- 美甲师推荐 -->
        <div v-if="selectedArtist" class="mt-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-soft">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white" :style="{ background: selectedArtist.avatarBg }">
            {{ selectedArtist.name.charAt(0) }}
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-1.5">
              <p class="text-sm font-medium text-ink">{{ selectedArtist.name }}</p>
              <span
                v-if="selectedArtist.badge"
                class="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                :class="badgeClass(selectedArtist.badge.style)"
              >{{ selectedArtist.badge.text }}</span>
            </div>
            <p class="text-xs text-cocoa">{{ selectedArtist.salonName }} · {{ selectedArtist.specialty }}</p>
            <p class="text-xs text-cocoa">好评 {{ selectedArtist.reviews }} 条</p>
          </div>
          <button @click="$router.push(`/artist/${selectedArtist.id}`)" class="rounded-full bg-primary-500 px-3 py-1.5 text-xs font-medium text-white shadow-glow">预约 TA</button>
        </div>
      </section>

    </main>

    <!-- 隐藏文件输入 -->
    <input ref="handCameraInput" type="file" accept="image/*" capture="environment" class="hidden" @change="onHandFileChange" />
    <input ref="handFileInput" type="file" accept="image/*" class="hidden" @change="onHandFileChange" />
    <input ref="designCameraInput" type="file" accept="image/*" capture="environment" class="hidden" @change="onDesignFileChange" />
    <input ref="designFileInput" type="file" accept="image/*" class="hidden" @change="onDesignFileChange" />

    <!-- 分享面板 -->
    <transition name="sheet">
      <div v-if="showSharePanel" class="fixed inset-0 z-50 flex flex-col justify-end">
        <div @click="showSharePanel = false" class="absolute inset-0 bg-ink/40 backdrop-blur-sm"></div>
        <div class="relative rounded-t-4xl bg-white p-5 shadow-card">
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
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { nailStyles, nailArtists } from '../data/mockData'

const route = useRoute()
const router = useRouter()

const handImage = ref('')
const designImage = ref('')
const isTryOnRunning = ref(false)
const tryOnResult = ref('')
const selectedStyle = ref(nailStyles[0])
const selectedArtist = ref(null)
const showArtists = ref(false)
const showStyleGallery = ref(false)
const showSharePanel = ref(false)
const matchScore = ref(96)

// 统一入口：支持 styleId / style（款式库）、imageUrl（作品集直接试戴）
onMounted(() => {
  const imageUrl = route.query.imageUrl
  if (imageUrl) {
    designImage.value = decodeURIComponent(imageUrl)
    selectedStyle.value = null
    return
  }
  const styleId = parseInt(route.query.styleId || route.query.style)
  if (styleId) {
    const style = nailStyles.find(s => s.id === styleId)
    if (style) {
      selectedStyle.value = style
      designImage.value = style.image
      showStyleGallery.value = false
    }
  } else if (selectedStyle.value) {
    designImage.value = selectedStyle.value.image
  }
})

const handFileInput = ref(null)
const handCameraInput = ref(null)
const designFileInput = ref(null)
const designCameraInput = ref(null)

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

const readFile = (file) => new Promise((resolve) => {
  const reader = new FileReader()
  reader.onload = (e) => resolve(e.target.result)
  reader.readAsDataURL(file)
})

const triggerHandCamera = () => handCameraInput.value?.click()
const triggerHandUpload = () => handFileInput.value?.click()
const triggerDesignUpload = () => designFileInput.value?.click()

const onHandFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  handImage.value = await readFile(file)
  e.target.value = ''
}

const onDesignFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  designImage.value = await readFile(file)
  selectedStyle.value = null
  e.target.value = ''
}

const badgeClass = (style) => ({
  last:      'bg-primary-500 text-white',
  available: 'bg-success/25 text-success',
  top:       'bg-warning/20 text-warning',
  value:     'bg-cocoa/15 text-cocoa'
}[style] ?? 'bg-primary-100 text-primary-700')

const openStyleGallery = () => {
  showStyleGallery.value = true
}

const selectStyle = (style) => {
  selectedStyle.value = style
  designImage.value = style.image
  showStyleGallery.value = false
  tryOnResult.value = ''
}

const startTryOn = () => {
  if (!handImage.value || isTryOnRunning.value) return
  isTryOnRunning.value = true
  tryOnResult.value = ''

  setTimeout(() => {
    tryOnResult.value = handImage.value
    matchScore.value = Math.floor(90 + Math.random() * 9)
    isTryOnRunning.value = false
  }, 2000)
}

const goToBooking = () => {
  sessionStorage.setItem('tryonStyle', JSON.stringify({
    image: designImage.value || selectedStyle.value?.image || '',
    name: selectedStyle.value?.name || '自定义款式',
    styleId: selectedStyle.value?.id ?? null
  }))
  router.push('/salon')
}

const saveDesign = () => alert('试戴效果已保存')

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
