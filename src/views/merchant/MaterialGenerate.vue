<template>
  <div class="p-8">
    <div class="mb-6">
      <p class="eyebrow">OPERATIONS ASSISTANT</p>
      <h1 class="mt-1 text-2xl font-semibold text-ink">爆款素材生成</h1>
      <p class="mt-2 text-sm text-cocoa">选择热门标签组合，AI 自动生成美甲款式素材，一键上架至门店</p>
    </div>

    <!-- 标签选择 -->
    <section class="card mb-6 p-6">
      <h2 class="mb-4 text-lg font-medium text-ink">标签组合</h2>
      <p class="mb-4 text-xs text-cocoa">选择标签后自动生成商品名称，核心三维必选</p>

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

      <!-- 商品名预览 -->
      <div class="mt-4 rounded-xl bg-cream/40 p-3">
        <span class="text-xs text-cocoa">商品名预览：</span>
        <span class="text-sm font-medium text-ink">{{ productName || '—' }}</span>
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

    <!-- 生成结果 -->
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
              <p class="text-sm font-medium text-ink">{{ generatedItem.name }}</p>
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

    <!-- 历史生成记录 -->
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
import { ref, computed } from 'vue'
import TagBadge from '../../components/merchant/TagBadge.vue'
import { labelSystem } from '../../data/merchantMockData'

const tagDimensions = [
  { key: 'shape', name: '甲型', required: true },
  { key: 'tone', name: '色调', required: true },
  { key: 'style', name: '风格', required: true },
  { key: 'craft', name: '工艺', required: false },
  { key: 'decor', name: '装饰元素', required: false }
]

const emptyTags = () => ({ shape: '', tone: '', style: '', craft: '', decor: '' })
const tags = ref(emptyTags())
const generating = ref(false)
const timeoutError = ref('')
const generatedItem = ref(null)
const publishedItems = ref([])
let timer = null

const canGenerate = computed(() => {
  return tags.value.shape && tags.value.tone && tags.value.style
})

const productName = computed(() => {
  const { tone, craft, shape, style } = tags.value
  const parts = [tone, craft, shape, style].filter(Boolean)
  return parts.length ? `「${parts.join(' · ')}」` : ''
})

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

const generateName = () => {
  const { tone, craft, shape } = tags.value
  const parts = [tone, craft, shape].filter(Boolean)
  return parts.join('') + '甲'
}

const generate = () => {
  timeoutError.value = ''
  generating.value = true

  // Simulate AI generation with 2-3s delay
  const delay = 2000 + Math.random() * 1000
  timer = setTimeout(() => {
    generating.value = false
    if (delay > 10000) {
      timeoutError.value = '素材生成超时，请重新尝试'
      return
    }
    generatedItem.value = {
      name: generateName(),
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
