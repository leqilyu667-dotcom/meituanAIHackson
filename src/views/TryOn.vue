<template>
  <div class="phone-shell pb-32">
    <header class="px-5 pb-3 pt-5">
      <div class="flex items-center gap-3">
        <button @click="$router.back()" class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white shadow-soft">
          <svg class="h-5 w-5 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div>
          <p class="eyebrow">AI TRY-ON</p>
          <h1 class="text-[22px] font-medium leading-[30px] text-ink">智能试戴</h1>
        </div>
      </div>
    </header>

    <main class="px-5">
      <!-- ═══ Dual Image Cards ═══ -->
      <section class="grid grid-cols-2 gap-3">
        <!-- Hand Photo Card -->
        <div class="overflow-hidden rounded-3xl bg-white shadow-card">
          <div class="flex items-center justify-between px-3 pt-3">
            <span class="text-xs font-medium text-primary-600">✋ 我的手</span>
            <button v-if="handImage" @click="triggerHandUpload" class="rounded-full bg-cream px-2.5 py-1 text-[11px] font-medium text-primary-700">更换</button>
          </div>
          <div class="flex justify-center pb-3">
            <div
              class="relative aspect-[3/4] min-h-[240px] w-[calc(100%-24px)] overflow-hidden rounded-2xl"
              :class="handImage ? 'bg-cream' : 'border-2 border-dashed border-primary-200 bg-primary-50/40'"
            >
              <img v-if="handImage" :src="handImage" alt="手部照片" class="h-full w-full object-cover" />
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

        <!-- Nail Design Card -->
        <div class="overflow-hidden rounded-3xl bg-white shadow-card">
          <div class="flex items-center justify-between px-3 pt-3">
            <span class="text-xs font-medium text-primary-600">💅 美甲款式</span>
            <button v-if="designImage" @click="clearDesign" class="rounded-full bg-cream px-2.5 py-1 text-[11px] font-medium text-cocoa">更换</button>
          </div>
          <div class="flex justify-center pb-3">
            <div
              class="relative aspect-[3/4] min-h-[240px] w-[calc(100%-24px)] overflow-hidden rounded-2xl"
              :class="designImage ? 'bg-cream' : 'border-2 border-dashed border-primary-200 bg-primary-50/40'"
            >
              <img v-if="designImage" :src="designImage" alt="美甲款式" class="h-full w-full object-cover" />
              <div v-else class="grid h-full place-items-center p-2">
                <div class="flex w-full flex-col gap-2">
                  <button @click="triggerDesignCamera" class="flex items-center justify-center gap-1.5 rounded-xl bg-blush py-2.5 text-xs font-medium text-primary-700 active:scale-95 transition">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                    </svg>
                    拍照
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

      <!-- Connector + 款式库 shortcut -->
      <div class="flex items-center justify-center gap-3 py-5">
        <div class="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs text-cocoa/60 shadow-soft">
          <span>手部</span>
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          <span>美甲</span>
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          <span>试戴结果</span>
        </div>
        <button @click="openStyleGallery" class="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-primary-600 shadow-soft transition active:scale-95">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          款式库
        </button>
      </div>

      <!-- ═══ Style Gallery ═══ -->
      <section v-if="showStyleGallery" class="mt-4">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-medium text-ink">款式库</h3>
          <button @click="showStyleGallery = false" class="text-xs text-cocoa/60">收起</button>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="style in nailStyles"
            :key="style.id"
            @click="selectStyle(style)"
            class="relative overflow-hidden rounded-2xl bg-white shadow-soft transition active:scale-95"
            :class="selectedStyle.id === style.id ? 'ring-2 ring-primary-500' : ''"
          >
            <img :src="style.image" alt="" class="aspect-square w-full object-cover" />
            <p class="truncate px-1.5 pb-1.5 pt-1 text-[11px] font-medium text-ink">{{ style.name }}</p>
          </button>
        </div>
      </section>


      <!-- ═══ Try-On Button ═══ -->
      <button
        @click="startTryOn"
        :disabled="!handImage || isTryOnRunning"
        class="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white transition"
        :class="handImage ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-glow active:scale-[0.98]' : 'bg-divider text-cocoa/50 cursor-not-allowed'"
      >
        <svg v-if="isTryOnRunning" class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="31.4 31.4" stroke-linecap="round"/>
        </svg>
        <span v-else class="text-lg">✨</span>
        {{ isTryOnRunning ? 'AI 试戴中...' : '开始 AI 试戴' }}
      </button>

      <!-- ═══ Result ═══ -->
      <section v-if="tryOnResult" class="mt-6">
        <div class="flex items-center justify-between mb-3">
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
      </section>

    </main>

    <!-- Hidden file inputs: hand -->
    <input ref="handCameraInput" type="file" accept="image/*" capture="environment" class="hidden" @change="onHandFileChange" />
    <input ref="handFileInput" type="file" accept="image/*" class="hidden" @change="onHandFileChange" />

    <!-- Hidden file inputs: design -->
    <input ref="designCameraInput" type="file" accept="image/*" capture="environment" class="hidden" @change="onDesignFileChange" />
    <input ref="designFileInput" type="file" accept="image/*" class="hidden" @change="onDesignFileChange" />

    <!-- Share Panel -->
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
import { useRoute } from 'vue-router'
import { nailStyles } from '../data/mockData'

const route = useRoute()

const handImage = ref('')
const designImage = ref('')
const isTryOnRunning = ref(false)
const tryOnResult = ref('')
const selectedStyle = ref(nailStyles[0])

// Pre-load style from query param (e.g. /tryon?style=2)
onMounted(() => {
  const styleId = parseInt(route.query.style)
  if (styleId) {
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

// ── file reader helper ─────────────────────────────────
const readFile = (file) => new Promise((resolve) => {
  const reader = new FileReader()
  reader.onload = (e) => resolve(e.target.result)
  reader.readAsDataURL(file)
})

// ── hand photo ─────────────────────────────────────────
const triggerHandCamera = () => handCameraInput.value?.click()
const triggerHandUpload = () => handFileInput.value?.click()

const onHandFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  handImage.value = await readFile(file)
  // reset input so same file can be re-selected
  e.target.value = ''
}

// ── design image ───────────────────────────────────────
const triggerDesignCamera = () => designCameraInput.value?.click()
const triggerDesignUpload = () => designFileInput.value?.click()

const onDesignFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  designImage.value = await readFile(file)
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

// ── try-on ─────────────────────────────────────────────
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

// ── save / load ────────────────────────────────────────
const saveDesign = () => {
  alert('试戴效果已保存')
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
