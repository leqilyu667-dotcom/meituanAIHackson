<template>
  <div class="p-8">
    <div class="mb-6">
      <p class="eyebrow">OPERATIONS ASSISTANT</p>
      <h1 class="mt-1 text-2xl font-semibold text-ink">爆款素材生成</h1>
      <p class="mt-2 text-sm text-cocoa">基于平台爆款分析与小红书热门素材，AI 一键生成美甲款式并上架</p>
    </div>

    <!-- 1. 站内 & 站外推荐（并列） -->
    <div class="mb-6 grid gap-6 lg:grid-cols-2">
      <!-- 站内爆款标签 -->
      <section class="card flex flex-col p-5">
        <h3 class="text-sm font-medium text-ink">站内热门</h3>
        <p class="mt-1 text-xs text-cocoa">近7天高热标签组合，点击快速填入</p>
        <div class="mt-3 flex flex-1 flex-col gap-2">
          <button
            v-for="(item, i) in topHotTags"
            :key="i"
            @click="fillTags(item.tags)"
            class="flex w-full flex-1 items-center rounded-xl border border-divider bg-white px-4 py-3 text-left transition hover:border-primary-300 hover:shadow-soft"
          >
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
              :class="i < 3 ? 'bg-primary-500 text-white' : 'bg-cream text-cocoa'"
            >{{ i + 1 }}</span>
            <span class="ml-3">
              <TagBadge :tags="item.tags" />
            </span>
            <span class="ml-auto flex items-center gap-3 text-[11px] text-cocoa">
              <span>试戴 {{ item.tryOnCount }}</span>
              <span>订单 {{ item.orderCount }}</span>
            </span>
            <span
              class="ml-3 shrink-0 rounded-full px-2 py-0.5 text-[11px] text-primary-600"
              :class="isTagFilled(item.tags) ? 'bg-primary-50' : 'bg-cream'"
            >
              {{ isTagFilled(item.tags) ? '已填入' : '点击填入' }}
            </span>
          </button>
        </div>
      </section>

      <!-- 站外灵感 -->
      <section class="card flex flex-col p-5">
        <h3 class="text-sm font-medium text-ink">站外灵感</h3>
        <p class="mt-1 text-xs text-cocoa">小红书高互动美甲笔记，点击填入标签（{{ totalItems }} 条，第 {{ currentPage }}/{{ totalPages }} 页）</p>
        <div class="mt-3 grid flex-1 auto-rows-fr gap-4 sm:grid-cols-3">
          <div
            v-for="item in paginatedItems"
            :key="item.id"
            class="flex h-full flex-col overflow-hidden rounded-2xl border border-divider bg-white transition hover:shadow-soft"
          >
            <div class="aspect-[4/3] w-full shrink-0 overflow-hidden">
              <img :src="item.image" class="h-full w-full object-cover" />
            </div>
            <div class="flex flex-1 flex-col p-3">
              <div class="flex items-center justify-between text-[11px] text-cocoa">
                <span>👍 {{ item.likes }}</span>
              </div>
              <div class="mt-2 flex min-h-[28px] items-center">
                <TagBadge :tags="item.aiTags" />
              </div>
              <button
                @click="fillTags(item.aiTags)"
                class="mt-auto w-full rounded-[14px] border py-2 text-xs font-medium transition"
                :class="isTagFilled(item.aiTags)
                  ? 'border-primary-300 bg-primary-50 text-primary-600'
                  : 'border-primary-300 text-primary-600 hover:bg-primary-50'"
              >
                {{ isTagFilled(item.aiTags) ? '✓ 已填入标签' : '填入此标签' }}
              </button>
              <button
                @click="fillFromXhs(item)"
                class="mt-1.5 w-full rounded-[14px] border border-primary-300 bg-primary-50 py-2 text-xs font-medium text-primary-600 transition hover:bg-primary-100"
              >
                灵感填入
              </button>
            </div>
          </div>

          <!-- Empty placeholder cards to keep grid stable -->
          <div
            v-for="n in (6 - paginatedItems.length)"
            :key="'empty-' + n"
            class="flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-divider bg-cream/30 text-xs text-cocoa/50"
          >
            <p>暂无素材</p>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-4 flex items-center justify-center gap-1.5">
          <button
            @click="changePage(1)"
            :disabled="currentPage <= 1"
            class="rounded-lg px-2.5 py-1.5 text-xs text-cocoa transition hover:bg-cream disabled:opacity-30"
          >
            首页
          </button>
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="rounded-lg px-2.5 py-1.5 text-xs text-cocoa transition hover:bg-cream disabled:opacity-30"
          >
            ‹
          </button>
          <button
            v-for="p in visiblePages"
            :key="p"
            @click="changePage(p)"
            class="h-7 w-7 rounded-lg text-xs font-medium transition"
            :class="p === currentPage
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-cocoa hover:bg-cream'"
          >
            {{ p }}
          </button>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="rounded-lg px-2.5 py-1.5 text-xs text-cocoa transition hover:bg-cream disabled:opacity-30"
          >
            ›
          </button>
          <button
            @click="changePage(totalPages)"
            :disabled="currentPage >= totalPages"
            class="rounded-lg px-2.5 py-1.5 text-xs text-cocoa transition hover:bg-cream disabled:opacity-30"
          >
            末页
          </button>
        </div>
      </section>
    </div>

    <!-- 2. 自定义标签组合 + 生成方式 -->
    <section class="card mb-6 p-6">
      <div class="mb-4 flex items-center gap-2 rounded-2xl bg-cream/50 p-1 w-fit">
        <button
          @click="generateMode = 'formula'"
          class="rounded-xl px-4 py-2 text-sm font-medium transition-all"
          :class="generateMode === 'formula' ? 'bg-white text-ink shadow-sm' : 'text-cocoa hover:text-ink'"
        >热门配方生成</button>
        <button
          @click="generateMode = 'inspire'"
          class="rounded-xl px-4 py-2 text-sm font-medium transition-all"
          :class="generateMode === 'inspire' ? 'bg-white text-ink shadow-sm' : 'text-cocoa hover:text-ink'"
        >灵感同款生成</button>
      </div>

      <p class="mb-4 text-xs text-cocoa">
        {{ generateMode === 'formula' ? '选择五维标签组合生成爆款素材，核心三维必选' : '上传参考图或从小红书素材选图，AI 自动识图提取标签后生成同款素材' }}
      </p>

      <!-- 灵感同款生成：参考图展示 -->
      <div v-if="generateMode === 'inspire' && inspireImage" class="mb-4 overflow-hidden rounded-2xl border border-divider bg-white">
        <div class="aspect-[16/9] w-full overflow-hidden bg-cream/30">
          <img :src="inspireImage" class="h-full w-full object-cover" />
        </div>
        <div class="flex items-center justify-between p-3">
          <p class="text-sm font-medium text-ink">参考图</p>
          <button
            @click="inspireImage = null"
            class="rounded-[14px] border border-divider px-3 py-1 text-xs text-cocoa transition hover:text-error"
          >移除</button>
        </div>
      </div>

      <!-- 灵感同款生成：无图片提示 -->
      <div v-if="generateMode === 'inspire' && !inspireImage" class="mb-4 rounded-xl bg-cream/30 py-12 text-center">
        <p class="text-3xl mb-3">🖼️</p>
        <p class="text-sm text-cocoa">从上方「站外灵感」点击「灵感填入」选择参考图</p>
        <p class="mt-1 text-xs text-cocoa/60">直接参考图片样式生成同款美甲素材</p>
      </div>

      <!-- 标签选择（仅爆款配方模式） -->
      <div v-if="generateMode === 'formula'" class="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div v-for="dim in tagDimensions" :key="dim.key">
          <label class="text-xs font-medium text-cocoa">
            {{ dim.name }}
            <span v-if="dim.required" class="text-error">*</span>
            <span v-else class="text-cocoa/40">（可选）</span>
          </label>
          <select
            v-model="tags[dim.key]"
            class="input-field mt-1 w-full text-sm"
          >
            <option value="">{{ dim.required ? '请选择' : '不限' }}</option>
            <option
              v-for="opt in labelSystem[dim.key]"
              :key="opt"
              :value="opt"
            >
              {{ opt }}
            </option>
          </select>
        </div>
      </div>

      <!-- 商品名编辑 & 平台建议 -->
      <div class="mt-4 rounded-xl bg-cream/40 p-4">
        <label class="text-xs text-cocoa">商品名称</label>
        <div class="mt-1.5 flex items-center gap-2">
          <input
            v-model="customName"
            type="text"
            class="input-field flex-1 text-sm"
            placeholder="请输入或选择建议名称"
          />
          <button
            v-if="customName !== autoName"
            @click="customName = autoName"
            class="shrink-0 text-xs text-primary-600 underline"
          >
            恢复默认
          </button>
        </div>
        <div v-if="nameSuggestions.length" class="mt-3">
          <p class="mb-2 text-xs text-cocoa">平台建议名称：</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(s, i) in nameSuggestions"
              :key="i"
              @click="customName = s"
              class="rounded-full border px-3 py-1.5 text-xs transition"
              :class="customName === s
                ? 'border-primary-500 bg-primary-50 text-primary-600'
                : 'border-divider text-cocoa hover:border-primary-300'"
            >
              {{ s }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-4 flex items-center gap-3">
        <button
          @click="generate"
          :disabled="!canGenerate || generating"
          class="btn-primary rounded-[18px] px-8 py-2.5 text-sm font-medium"
          :class="(canGenerate && !generating) ? '' : 'cursor-not-allowed opacity-50'"
        >
          <span v-if="generating" class="flex items-center gap-2">
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-30"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
            AI 生成中...
          </span>
          <span v-else>AI 生成素材</span>
        </button>
      </div>
      <p v-if="timeoutError" class="mt-2 text-xs text-error">{{ timeoutError }}</p>
    </section>

    <!-- 3. 生成结果 -->
    <section v-if="generatedItem" class="card mb-6 p-6">
      <h2 class="mb-4 text-lg font-medium text-ink">生成结果</h2>

      <div class="mx-auto max-w-sm overflow-hidden rounded-3xl border border-divider bg-white shadow-soft">
        <div class="aspect-square w-full overflow-hidden bg-cream/30">
          <img v-if="generatedItem.image" :src="generatedItem.image" class="h-full w-full object-cover" />
          <div v-else class="flex h-full w-full items-center justify-center" :style="{ background: generatedGradient }">
            <p class="text-4xl">💅</p>
          </div>
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <input
                  v-model="generatedItem.name"
                  type="text"
                  class="text-sm font-medium text-ink bg-transparent outline-none border-b border-transparent hover:border-divider focus:border-primary-300"
                />
              </div>
              <div class="mt-1.5">
                <TagBadge :tags="generatedItem.tags" />
              </div>
            </div>
            <span
              class="shrink-0 rounded-full px-2 py-1 text-[11px] font-medium"
              :class="generatedItem.published ? 'bg-success/10 text-success' : 'bg-cream text-cocoa'"
            >
              {{ generatedItem.published ? '已上架' : '待上架' }}
            </span>
          </div>

          <div class="mt-4 flex gap-2">
            <button
              @click="regenerate"
              class="flex-1 rounded-[18px] border border-divider bg-white py-2 text-sm text-cocoa transition hover:bg-cream"
            >
              重新生成
            </button>
            <button
              @click="toggleFavResult"
              class="rounded-[18px] border px-3 py-2 text-sm transition"
              :class="generatedItem.favorited ? 'border-primary-300 bg-primary-50 text-primary-600' : 'border-divider text-cocoa hover:bg-cream'"
            >
              {{ generatedItem.favorited ? '★ 已收藏' : '☆ 收藏' }}
            </button>
            <button
              v-if="!generatedItem.published"
              @click="publish"
              class="flex-1 rounded-[18px] bg-success py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              一键上架
            </button>
            <span
              v-else
              class="flex-1 rounded-[18px] bg-success/10 py-2 text-center text-sm font-medium text-success"
            >
              已上架至门店
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. 历史记录 -->
    <section v-if="publishedItems.length" class="card p-6">
      <h2 class="mb-4 text-lg font-medium text-ink">
        最近上架
        <span class="text-sm font-normal text-cocoa">（{{ publishedItems.length }}）</span>
      </h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(item, i) in publishedItems"
          :key="i"
          class="overflow-hidden rounded-2xl border border-divider bg-white shadow-soft"
        >
          <div
            class="flex aspect-square items-center justify-center"
            :style="{ background: item.gradient }"
          >
            <p class="text-3xl">💅</p>
          </div>
          <div class="p-3">
            <p class="text-xs font-medium text-ink truncate">{{ item.name }}</p>
            <TagBadge :tags="item.tags" />
            <p class="mt-1 text-[11px] text-success">已上架</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. 素材库 -->
    <section class="card p-6">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-medium text-ink">
            素材库
            <span class="text-sm font-normal text-cocoa">（{{ libraryTotal }}）</span>
          </h2>
          <p class="mt-1 text-xs text-cocoa">AI 生成素材后点击收藏，即自动存入素材库，方便随时取用</p>
        </div>
        <button
          @click="loadLibrary"
          class="text-xs text-primary-600 underline"
        >刷新</button>
      </div>

      <div v-if="libraryLoading" class="flex justify-center py-8">
        <svg class="h-5 w-5 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-30"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>

      <div v-else-if="libraryItems.length === 0" class="py-8 text-center text-sm text-cocoa">
        暂无素材，生成后将自动存入此处
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="item in libraryItems"
          :key="item.id"
          class="overflow-hidden rounded-2xl border border-divider bg-white shadow-soft transition hover:shadow-soft"
        >
          <div class="aspect-square w-full overflow-hidden bg-cream/30">
            <img v-if="item.imageUrl" :src="item.imageUrl" class="h-full w-full object-cover" />
            <div v-else class="flex h-full w-full items-center justify-center text-3xl">💅</div>
          </div>
          <div class="p-3">
            <p class="text-xs font-medium text-ink truncate">{{ item.name || '未命名' }}</p>
            <TagBadge :tags="item.tags" />
            <div class="mt-2 flex gap-1.5">
              <button
                @click="libraryPublish(item)"
                :disabled="item.publishing"
                class="flex-1 rounded-[12px] bg-success py-1 text-[11px] font-medium text-white transition hover:opacity-90 disabled:opacity-40"
              >上架</button>
              <button
                @click="libraryDelete(item)"
                class="rounded-[12px] border border-error/20 px-2 py-1 text-[11px] text-cocoa transition hover:text-error"
              >删除</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import TagBadge from '../../components/merchant/TagBadge.vue'
import { labelSystem, hotTags, calcHeatScore } from '../../data/merchantMockData'
import { fetchXhsMaterials, generateDesignImage, createDesign, saveToLibrary, fetchLibrary, deleteLibraryMaterial, toggleFavorite } from '../../data/api'

const tagDimensions = [
  { key: 'shape', name: '甲型', required: true },
  { key: 'tone', name: '色调', required: true },
  { key: 'style', name: '风格', required: true },
  { key: 'craft', name: '工艺', required: false },
  { key: 'decor', name: '装饰元素', required: false }
]

const emptyTags = () => ({ shape: '', tone: '', style: '', craft: '', decor: '' })
const tags = ref(emptyTags())
const customName = ref('')
const generateMode = ref('formula')
const inspireImage = ref(null)
const generating = ref(false)
const timeoutError = ref('')
const generatedItem = ref(null)
const publishedItems = ref([])
const topHotTags = computed(() => {
  return [...hotTags]
    .sort((a, b) => calcHeatScore(b) - calcHeatScore(a))
    .slice(0, 5)
})

const pageSize = 6
const maxPages = 10
const currentPage = ref(1)
const allXhsItems = ref([])

const totalItems = computed(() => allXhsItems.value.length)
const totalPages = computed(() => Math.min(Math.ceil(allXhsItems.value.length / pageSize) || 1, maxPages))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return allXhsItems.value.slice(start, start + pageSize)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function changePage(p) {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p
  }
}

async function loadXhsInspirations() {
  try {
    const result = await fetchXhsMaterials({ reviewStatus: 'approved', limit: pageSize * maxPages, sort: 'likes' })
    allXhsItems.value = result.materials.map(m => ({
      id: m.id,
      image: m.image || m.thumbnail,
      likes: m.likes,
      aiTags: m.aiTags
    }))
    currentPage.value = 1
  } catch (err) {
    console.warn('Failed to load XHS inspirations:', err.message)
    allXhsItems.value = []
  }
}

// Library
const libraryItems = ref([])
const libraryTotal = ref(0)
const libraryLoading = ref(false)

async function loadLibrary() {
  libraryLoading.value = true
  try {
    const data = await fetchLibrary({ limit: 20 })
    libraryItems.value = data.materials
    libraryTotal.value = data.total
  } catch (err) {
    console.warn('Failed to load library:', err.message)
  } finally {
    libraryLoading.value = false
  }
}

async function libraryPublish(item) {
  item.publishing = true
  try {
    await createDesign({
      name: item.name || '素材库款式',
      tags: item.tags,
      coverImage: item.imageUrl
    })
    alert('已上架至货架管理')
  } catch (err) {
    alert('上架失败: ' + (err.response?.data?.message || err.message))
  } finally {
    item.publishing = false
  }
}

async function libraryDelete(item) {
  if (!confirm('确定删除？')) return
  try {
    await deleteLibraryMaterial(item.id)
    libraryItems.value = libraryItems.value.filter(m => m.id !== item.id)
    libraryTotal.value--
  } catch (err) {
    console.error('Delete failed:', err.message)
  }
}

onMounted(() => {
  loadXhsInspirations()
  loadLibrary()
})

const canGenerate = computed(() => {
  if (generateMode.value === 'inspire') return !!inspireImage.value
  return tags.value.shape && tags.value.tone && tags.value.style
})

const autoName = computed(() => {
  const { tone, craft, shape } = tags.value
  const parts = [tone, craft, shape].filter(Boolean)
  return parts.length ? parts.join('') : ''
})

const nameSuggestions = computed(() => {
  const { tone, craft, shape, style, decor } = tags.value
  if (!tone || !shape) return []
  const names = new Set()
  const formulas = [
    [tone, craft, shape],
    [tone, style, shape],
    [craft, tone, shape],
    [tone, decor, craft, shape],
    [tone, craft, style, shape],
    [style, tone, craft, shape]
  ]
  for (const parts of formulas) {
    const filtered = parts.filter(Boolean)
    if (filtered.length >= 2) names.add(filtered.join(''))
  }
  return Array.from(names).slice(0, 4)
})

watch([() => tags.value.shape, () => tags.value.tone, () => tags.value.craft, () => tags.value.style], () => {
  if (autoName.value) {
    customName.value = autoName.value
  }
})

const fillTags = (newTags) => {
  tags.value = { ...tags.value, ...newTags }
}

const fillFromXhs = (item) => {
  generateMode.value = 'inspire'
  inspireImage.value = item.image
  fillTags(item.aiTags)
}

const isTagFilled = (t) => {
  return tags.value.shape === t.shape
    && tags.value.tone === t.tone
    && tags.value.style === t.style
    && tags.value.craft === t.craft
    && tags.value.decor === t.decor
}

const gradientMap = {
  '裸色': 'linear-gradient(135deg, #f5e6d8, #dcc5b0, #f0dcc8)',
  '红色系': 'linear-gradient(135deg, #d4454a, #b8303a, #e86060)',
  '亮色': 'linear-gradient(135deg, #ffd166, #ff9f43, #f7dc6f)',
  '冷色': 'linear-gradient(135deg, #a0c4f0, #7eb8da, #c5d9f0)',
  '金属': 'linear-gradient(135deg, #c0c0c0, #a8a8a8, #d4d4d4)',
  '魔镜粉': 'linear-gradient(135deg, #e8c4d0, #d4a8b8, #f0d8e0)',
  '透色': 'linear-gradient(135deg, #fce4ec, #f8d0d8, #ffeef2)'
}

const generatedGradient = computed(() => {
  return gradientMap[tags.value.tone] || 'linear-gradient(135deg, #f5e6d8, #dcc5b0, #f0dcc8)'
})

function buildPrompt() {
  const t = tags.value
  const craftDecor = [t.craft, t.decor].filter(Boolean).join('、') || '简约纯色'
  return `小红书ins风美甲款式主图，高清商业摄影，奶白色哑光ins风桌面背景，带极淡的肌理质感，暖调柔光打光，带轻微柔焦氛围感，光影柔和通透，无刺眼硬阴影。模特双手平行自然放置、掌心向下，双手不交叉、不重叠，10根手指完整舒展、均匀分开，指缝间距一致，无手指扭曲、粘连、缺失或遮挡；（手部解剖结构完全正确，关节、指骨比例协调自然），无关节肿大、手指畸形、皮肤扭曲；皮肤细腻均匀，无多余纹理或瑕疵。画面焦点100%锁定在美甲款式上，清晰展示美甲细节；甲型为${t.shape}，整体主色调为${t.tone}，风格定位${t.style}，带有${craftDecor}工艺细节；美甲色彩通透还原准确，光泽感自然高级，碎钻/闪粉的反光细腻真实，指甲边缘干净利落，无溢胶、毛边等瑕疵；无多余饰品、水印、文字或杂乱元素，构图居中，画面干净清爽，适配美甲店铺上架与小红书分享场景。`
}

function buildInspirePrompt() {
  return '以参考图中的美甲款式、甲型、配色与工艺细节为灵感，生成全新原创的小红书ins风美甲款式图，适配店铺上架与分享场景。要求：高清商业摄影，奶白色哑光极简桌面背景，暖调柔光打光，带轻微柔焦氛围感，光影柔和通透；模特**双手自然轻搭在一起**，完整舒展十只手指，清晰展示美甲细节；美甲色彩通透还原准确，光泽感自然高级，碎钻/闪粉反光细腻真实，指甲边缘干净利落，无溢胶、毛边瑕疵；手部为100%原创生成，**不复用参考图的任何手部特征、背景元素或细节**，无版权纠纷风险；画面无水印、无文字、无杂乱元素，构图居中清爽。'
}

const generate = async () => {
  timeoutError.value = ''
  generating.value = true

  try {
    const prompt = generateMode.value === 'inspire' ? buildInspirePrompt() : buildPrompt()
    const result = await generateDesignImage(prompt)
    generatedItem.value = {
      name: customName.value || autoName.value,
      tags: { ...tags.value },
      image: result.imageUrl,
      gradient: gradientMap[tags.value.tone] || 'linear-gradient(135deg, #f5e6d8, #dcc5b0, #f0dcc8)',
      published: false,
      favorited: false
    }
  } catch (err) {
    timeoutError.value = '素材生成失败，请重试'
    console.error('Generate failed:', err.message)
  } finally {
    generating.value = false
  }
}

async function toggleFavResult() {
  const item = generatedItem.value
  if (!item) return
  // If not yet saved to library, save now then toggle
  if (!item.libraryId) {
    try {
      const libResult = await saveToLibrary({
        name: item.name,
        imageUrl: item.image,
        tags: item.tags
      })
      item.libraryId = libResult.id
    } catch (err) {
      alert('收藏失败，素材未入库')
      return
    }
  }
  try {
    const result = await toggleFavorite(item.libraryId)
    item.favorited = result.isFavorite
    loadLibrary()
  } catch (err) {
    console.error('Toggle favorite failed:', err.message)
  }
}

const regenerate = () => {
  generatedItem.value = null
  generate()
}

const publish = async () => {
  if (generatedItem.value) {
    try {
      await createDesign({
        name: generatedItem.value.name,
        tags: generatedItem.value.tags,
        coverImage: generatedItem.value.image,
        operator: 'ai_generate'
      })
      generatedItem.value.published = true
      publishedItems.value.unshift({ ...generatedItem.value })
    } catch (err) {
      alert('上架失败: ' + (err.response?.data?.message || err.message))
    }
  }
}
</script>
