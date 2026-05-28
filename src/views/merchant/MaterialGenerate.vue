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
        <h3 class="text-sm font-medium text-ink">站内爆款标签 TOP5</h3>
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

      <!-- 站外热门素材 -->
      <section class="card flex flex-col p-5">
        <h3 class="text-sm font-medium text-ink">站外热门素材</h3>
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

    <!-- 2. 自定义标签组合 -->
    <section class="card mb-6 p-6">
      <h2 class="mb-1 text-lg font-medium text-ink">自定义标签组合</h2>
      <p class="mb-4 text-xs text-cocoa">手动选择五维标签，核心三维必选</p>

      <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
        <button
          v-if="generating"
          @click="cancelGenerate"
          class="text-xs text-cocoa underline transition hover:text-error"
        >
          取消
        </button>
      </div>
      <p v-if="timeoutError" class="mt-2 text-xs text-error">{{ timeoutError }}</p>
    </section>

    <!-- 3. 生成结果 -->
    <section v-if="generatedItem" class="card mb-6 p-6">
      <h2 class="mb-4 text-lg font-medium text-ink">生成结果</h2>

      <div class="mx-auto max-w-sm overflow-hidden rounded-3xl border border-divider bg-white shadow-soft">
        <div
          class="relative flex aspect-square w-full items-center justify-center"
          :style="{ background: generatedGradient }"
        >
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-32 h-48 rounded-full bg-white/30 blur-3xl"></div>
          </div>
          <div class="relative text-center">
            <p class="text-4xl">💅</p>
            <p class="mt-2 text-xs text-ink/50">AI 生成预览图</p>
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

          <div class="mt-4 flex gap-3">
            <button
              @click="regenerate"
              class="flex-1 rounded-[18px] border border-divider bg-white py-2 text-sm text-cocoa transition hover:bg-cream"
            >
              重新生成
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import TagBadge from '../../components/merchant/TagBadge.vue'
import { labelSystem, hotTags, calcHeatScore } from '../../data/merchantMockData'
import { fetchXhsMaterials } from '../../data/api'

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
const generating = ref(false)
const timeoutError = ref('')
const generatedItem = ref(null)
const publishedItems = ref([])
let timer = null

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
    // Fetch all approved materials sorted by likes, up to 60 (10 pages × 6)
    const result = await fetchXhsMaterials({ reviewStatus: 'approved', limit: pageSize * maxPages, sort: 'likes' })
    allXhsItems.value = result.materials.map(m => ({
      id: m.id,
      image: m.image || m.thumbnail,
      likes: m.likes,
      aiTags: m.aiTags
    }))
    // Reset to page 1 on fresh load
    currentPage.value = 1
  } catch (err) {
    console.warn('Failed to load XHS inspirations:', err.message)
    allXhsItems.value = []
  }
}

onMounted(() => {
  loadXhsInspirations()
})

const canGenerate = computed(() => {
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

const generate = () => {
  timeoutError.value = ''
  generating.value = true

  const delay = 2000 + Math.random() * 1000
  timer = setTimeout(() => {
    generating.value = false
    if (delay > 10000) {
      timeoutError.value = '素材生成超时，请重新尝试'
      return
    }
    generatedItem.value = {
      name: customName.value || autoName.value,
      tags: { ...tags.value },
      gradient: gradientMap[tags.value.tone] || 'linear-gradient(135deg, #f5e6d8, #dcc5b0, #f0dcc8)',
      published: false
    }
  }, Math.min(delay, 10000))
}

const cancelGenerate = () => {
  clearTimeout(timer)
  generating.value = false
  timeoutError.value = '已取消生成'
}

const regenerate = () => {
  generatedItem.value = null
  generate()
}

const publish = () => {
  if (generatedItem.value) {
    generatedItem.value.published = true
    publishedItems.value.unshift({ ...generatedItem.value })
  }
}
</script>
