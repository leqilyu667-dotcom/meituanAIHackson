<template>
  <div class="p-8">
    <div class="mb-6">
      <p class="eyebrow">DATA ASSISTANT</p>
      <h1 class="mt-1 text-2xl font-semibold text-ink">爆款报告</h1>
      <p class="mt-2 text-sm text-cocoa">一站式查看站内热度、同质对比、站外趋势，全面把握爆款动向</p>
    </div>

    <!-- 1. 站内最热试戴标签 -->
    <section class="card mb-6 p-6">
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-lg font-medium text-ink">站内最热试戴标签</h2>
        <div class="flex gap-1 rounded-full bg-cream p-1">
            <button
              v-for="dim in ['门店', '平台']"
              :key="dim"
              @click="scope = dim"
              class="rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300"
              :class="scope === dim ? 'bg-white text-ink shadow-soft' : 'text-cocoa'"
            >
              {{ dim }}
            </button>
          </div>
      </div>

      <p class="mb-4 text-sm font-medium text-cocoa">
        全维度（甲型+色调+风格+工艺+装饰）· TOP{{ displayList.length }} · 近7天
      </p>

      <div class="overflow-hidden rounded-2xl border border-divider">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-divider bg-cream/50 text-left text-xs text-cocoa">
              <th class="w-14 px-4 py-2.5 font-medium">排名</th>
              <th class="px-4 py-2.5 font-medium">标签组合</th>
              <th class="px-4 py-2.5 text-right font-medium">试戴量</th>
              <th class="px-4 py-2.5 text-right font-medium">订单量</th>
              <th class="px-4 py-2.5 text-right font-medium">综合热度分</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, i) in displayList"
              :key="i"
              class="border-b border-divider last:border-0 transition hover:bg-cream/30"
            >
              <td class="px-4 py-3">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                  :class="i < 3 ? 'bg-primary-500 text-white' : 'bg-cream text-cocoa'"
                >
                  {{ i + 1 }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-ink">
                    {{ item.tags.shape }} · {{ item.tags.tone }} · {{ item.tags.style }}
                    <span class="text-cocoa/60"> · </span>
                    <span :class="item.tags.craft ? 'text-ink' : 'text-cocoa/40'">{{ item.tags.craft || '—' }}</span>
                    <span class="text-cocoa/60"> · </span>
                    <span :class="item.tags.decor ? 'text-ink' : 'text-cocoa/40'">{{ item.tags.decor || '—' }}</span>
                  </span>
                  <span
                    v-if="isBasic(item)"
                    class="shrink-0 rounded-full bg-cream px-1.5 py-0.5 text-[10px] text-cocoa"
                  >基础款</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right text-cocoa">{{ item.tryOnCount }}</td>
              <td class="px-4 py-3 text-right text-cocoa">{{ item.orderCount }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <div class="h-1.5 w-16 overflow-hidden rounded-full bg-cream">
                    <div
                      class="h-full rounded-full bg-primary-500"
                      :style="{ width: scorePercent(item) + '%' }"
                    />
                  </div>
                  <span class="w-16 text-right text-xs font-medium text-primary-600">
                    {{ formatScore(heatScore(item)) }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6">
        <p class="mb-3 text-sm font-medium text-cocoa">近7天试戴 & 订单趋势</p>
        <TrendChart :data="trendData" />
      </div>
    </section>

    <!-- 2. 本店/同质店铺对比 -->
    <section class="card mb-6 p-6">
      <h2 class="mb-4 text-lg font-medium text-ink">本店 / 同质店铺对比</h2>
      <p class="mb-4 text-xs text-cocoa">对比范围：{{ storeInfo.city }}{{ storeInfo.district }} · 同规模 {{ storeInfo.scale }} · 近7天</p>

      <div class="grid gap-4 lg:grid-cols-4">
        <div v-for="item in comparisonMetrics" :key="item.label" class="rounded-2xl bg-cream/40 p-4 text-center">
          <p class="text-xs text-cocoa">{{ item.label }}</p>
          <div class="mt-2 flex items-end justify-center gap-0.5">
            <span class="text-xl font-semibold text-ink">{{ item.my }}</span>
            <span class="text-xs text-cocoa">{{ item.unit }}</span>
          </div>
          <div class="mt-3 flex items-center justify-center gap-2 text-xs">
            <span class="text-cocoa">同质均值</span>
            <span class="font-medium text-ink">{{ item.peer }}{{ item.unit }}</span>
            <span class="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
              :class="item.compare >= 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'"
            >
              {{ item.compare >= 0 ? '+' : '' }}{{ item.compare }}%
            </span>
          </div>
        </div>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <div class="rounded-2xl border border-success/20 bg-success/5 p-5">
          <div class="flex items-center gap-2">
            <svg class="h-5 w-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <h4 class="text-sm font-medium text-ink">本店优势标签</h4>
          </div>
          <div class="mt-3 space-y-2">
            <div v-for="(item, i) in peerComparison.myAdvantageTags" :key="i" class="rounded-xl bg-white p-3">
              <TagBadge :tags="item.tags" />
              <div class="mt-2 flex items-center gap-3 text-xs text-cocoa">
                <span>本店占比 <strong class="text-success">{{ item.myShare }}%</strong></span>
                <span>同质均值 <strong>{{ item.peerShare }}%</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-warning/20 bg-warning/5 p-5">
          <div class="flex items-center gap-2">
            <svg class="h-5 w-5 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <h4 class="text-sm font-medium text-ink">缺失热门标签</h4>
          </div>
          <div class="mt-3 space-y-2">
            <div v-for="(item, i) in peerComparison.myMissingTags" :key="i" class="rounded-xl bg-white p-3">
              <TagBadge :tags="item.tags" />
              <div class="mt-2 flex items-center gap-3 text-xs text-cocoa">
                <span>平台占比 <strong>{{ item.peerShare }}%</strong></span>
                <span class="text-error">热度上涨 <strong>{{ item.heatRise }}%</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. 站外最热素材 -->
    <section class="card p-6">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-ink">站外最热素材</h2>
        <button @click="triggerNewScrape" :disabled="scraping" class="rounded-full bg-white px-4 py-2 text-xs font-medium text-primary-600 shadow-soft transition hover:bg-primary-50 disabled:opacity-50">
          {{ scraping ? '抓取中...' : '刷新列表' }}
        </button>
      </div>

      <!-- Config bar: display mode -->
      <div v-if="!configEditing" class="mb-5 rounded-2xl bg-cream/40 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-ink">小龙虾素材助手🦞</p>
            <p class="mt-1 text-xs text-cocoa">
              抓取周期：每周限用1次 · 关键词：{{ configKeywords.join('、') }} · 高互动优先
            </p>
          </div>
          <button @click="openConfigEdit" class="rounded-full bg-white px-4 py-2 text-xs font-medium text-primary-600 shadow-soft transition hover:bg-primary-50">
            修改配置
          </button>
        </div>
      </div>

      <!-- Config bar: edit mode -->
      <div v-else class="mb-5 rounded-2xl bg-cream/40 p-4">
        <p class="text-sm font-medium text-ink">修改抓取配置</p>
        <div class="mt-3 space-y-3">
          <div>
            <label class="text-xs text-cocoa">搜索关键词（最多3个，空格分隔组合搜索）</label>
            <div class="mt-1 flex flex-wrap gap-2">
              <span v-for="(kw, i) in editKeywords" :key="i"
                class="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs shadow-sm">
                {{ kw }}
                <button @click="removeKeyword(i)" class="text-cocoa/50 hover:text-error">&times;</button>
              </span>
              <input
                v-if="editKeywords.length < 3"
                v-model="newKeyword"
                @keydown.enter="addKeyword"
                placeholder="输入关键词回车添加"
                class="rounded-full border border-divider bg-white px-3 py-1 text-xs outline-none focus:border-primary-400 w-40"
              />
            </div>
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-1.5 text-xs text-cocoa">
              最低点赞
              <input v-model.number="editMinLikes" type="number" class="w-20 rounded-lg border border-divider px-2 py-1 text-xs" />
            </label>
          </div>
          <div class="flex items-center gap-2">
            <button @click="saveConfig" class="rounded-full bg-primary-500 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-primary-600">
              保存
            </button>
            <button @click="cancelConfigEdit" class="rounded-full bg-white px-4 py-1.5 text-xs text-cocoa transition hover:bg-cream">
              取消
            </button>
          </div>
        </div>
      </div>

      <!-- Material action bar -->
      <div class="mb-3 flex items-center justify-between">
        <p class="text-sm font-medium text-cocoa">
          全部素材（{{ totalCount }}）
          <span v-if="managing && selectedIds.size" class="ml-2 text-primary-600">已选 {{ selectedIds.size }} 项</span>
        </p>
        <div class="flex items-center gap-2">
          <template v-if="managing">
            <button @click="toggleSelectAll" class="rounded-full bg-white px-3 py-1.5 text-xs text-cocoa shadow-sm transition hover:bg-cream">
              {{ isAllSelected ? '取消全选' : '全选' }}
            </button>
            <button
              v-if="selectedIds.size"
              @click="batchDelete"
              :disabled="deleting"
              class="rounded-full bg-error px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {{ deleting ? '删除中...' : `批量删除（${selectedIds.size}）` }}
            </button>
            <button @click="exitManage" class="rounded-full bg-white px-3 py-1.5 text-xs text-cocoa shadow-sm transition hover:bg-cream">
              完成
            </button>
          </template>
          <button v-else @click="managing = true" class="rounded-full bg-white px-3 py-1.5 text-xs text-cocoa shadow-sm transition hover:bg-cream">
            管理
          </button>
        </div>
      </div>

      <div v-if="xhsLoading" class="py-12 text-center text-cocoa">
        <p class="text-lg">⏳</p>
        <p class="mt-2">加载中...</p>
      </div>

      <div v-else-if="!xhsMaterials.length" class="py-8 text-center text-cocoa">
        <p class="text-lg">📭</p>
        <p class="mt-2">暂无素材</p>
        <p class="mt-1 text-xs">点击刷新按钮检查是否有新素材入库</p>
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="item in xhsMaterials"
          :key="item.id"
          class="group overflow-hidden rounded-3xl border bg-white shadow-soft transition hover:shadow-card"
          :class="managing && selectedIds.has(item.id) ? 'border-primary-400 ring-2 ring-primary-200' : 'border-divider'"
        >
          <div class="relative">
            <img :src="item.image" alt="" class="aspect-square w-full object-cover" />
            <label
              v-if="managing"
              class="absolute left-3 top-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white"
              @click.stop
            >
              <input
                type="checkbox"
                :checked="selectedIds.has(item.id)"
                @change="toggleSelect(item.id)"
                class="h-4 w-4 rounded accent-primary-500"
              />
            </label>
            <span
              class="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-medium"
              :class="item.reviewStatus === 'pending' ? 'bg-warning/90 text-white' : item.reviewStatus === 'approved' ? 'bg-success/90 text-white' : item.reviewStatus === 'rejected' ? 'bg-error/90 text-white' : 'bg-cocoa/80 text-white'"
            >
              {{ item.reviewStatus === 'pending' ? '待审' : item.reviewStatus === 'approved' ? '已通过' : item.reviewStatus === 'rejected' ? '已驳回' : '暂存' }}
            </span>
          </div>
          <div class="p-4">
            <TagBadge :tags="item.aiTags" />
            <div class="mt-2 flex items-center gap-3 text-xs text-cocoa">
              <span>点赞 {{ item.likes }}</span>
            </div>
            <a :href="item.source" target="_blank" class="mt-1 block truncate text-xs text-primary-600 underline">
              查看原文
            </a>
            <button
              @click="openReview(item)"
              class="btn-primary mt-3 w-full rounded-[18px] py-2 text-sm"
            >
              复审
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-1.5">
        <button
          @click="goToPage(1)"
          :disabled="currentPage <= 1"
          class="rounded-lg px-2.5 py-1.5 text-xs text-cocoa transition hover:bg-cream disabled:opacity-30"
        >
          首页
        </button>
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="rounded-lg px-2.5 py-1.5 text-xs text-cocoa transition hover:bg-cream disabled:opacity-30"
        >
          ‹
        </button>
        <button
          v-for="p in visiblePages"
          :key="p"
          @click="goToPage(p)"
          class="h-7 w-7 rounded-lg text-xs font-medium transition"
          :class="p === currentPage
            ? 'bg-primary-500 text-white shadow-sm'
            : 'text-cocoa hover:bg-cream'"
        >
          {{ p }}
        </button>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="rounded-lg px-2.5 py-1.5 text-xs text-cocoa transition hover:bg-cream disabled:opacity-30"
        >
          ›
        </button>
        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage >= totalPages"
          class="rounded-lg px-2.5 py-1.5 text-xs text-cocoa transition hover:bg-cream disabled:opacity-30"
        >
          末页
        </button>
      </div>
    </section>

    <ReviewModal
      :visible="reviewVisible"
      :material="currentMaterial"
      @close="reviewVisible = false"
      @review="handleReview"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TagBadge from '../../components/merchant/TagBadge.vue'
import TrendChart from '../../components/merchant/TrendChart.vue'
import ReviewModal from '../../components/merchant/ReviewModal.vue'
import {
  storeInfo,
  hotTags as hotTagsData,
  trendData as trendMockData,
  peerComparison,
  calcHeatScore
} from '../../data/merchantMockData'
import { fetchXhsMaterials, submitReview, deleteMaterials } from '../../data/api'

const scope = ref('门店')

const hotTags = ref(hotTagsData)
const trendData = ref(trendMockData)

const displayList = computed(() => {
  return [...hotTags.value]
    .sort((a, b) => calcHeatScore(b) - calcHeatScore(a))
    .slice(0, 10)
})

const isBasic = (item) => {
  return !item.tags.craft || !item.tags.decor
}

const heatScore = (item) => calcHeatScore(item)

const scorePercent = (item) => {
  const max = displayList.value.length > 0 ? calcHeatScore(displayList.value[0]) : 1
  return Math.min((calcHeatScore(item) / max) * 100, 100)
}

const formatScore = (s) => {
  if (s >= 10000) return (s / 10000).toFixed(1) + '万'
  if (s >= 1000) return (s / 1000).toFixed(1) + 'k'
  return String(s)
}

const comparisonMetrics = [
  { label: '营收总额', my: '5.62万', peer: '4.82万', unit: '', compare: 17 },
  { label: '客流量', my: '312', peer: '268', unit: '人', compare: 16 },
  { label: '客单价', my: '180', peer: '179', unit: '元', compare: 1 },
  { label: '订单完成率', my: '90', peer: '87', unit: '%', compare: 3 }
]

// XHS materials from API
const xhsMaterials = ref([])
const xhsLoading = ref(false)
const reviewVisible = ref(false)
const currentMaterial = ref({})
const statusFilter = ref('')

// Pagination
const pageSize = 9
const currentPage = ref(1)
const totalCount = ref(0)
const totalPages = computed(() => Math.max(Math.ceil(totalCount.value / pageSize), 1))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function goToPage(p) {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p
    loadMaterials()
  }
}

// Selection
const managing = ref(false)
const selectedIds = ref(new Set())
const deleting = ref(false)

function exitManage() {
  managing.value = false
  selectedIds.value = new Set()
}

const isAllSelected = computed(() => {
  return xhsMaterials.value.length > 0 && xhsMaterials.value.every(m => selectedIds.value.has(m.id))
})

function toggleSelect(id) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedIds.value = next
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(xhsMaterials.value.map(m => m.id))
  }
}

async function batchDelete() {
  const ids = [...selectedIds.value]
  if (!ids.length) return
  if (!confirm(`确定删除选中的 ${ids.length} 条素材吗？此操作同步移除爆款素材生成中的对应素材。`)) return

  deleting.value = true
  try {
    await deleteMaterials(ids)
    selectedIds.value = new Set()
    await loadMaterials()
  } catch (err) {
    console.error('Batch delete failed:', err)
    alert('删除失败: ' + (err.response?.data?.message || err.message))
  } finally {
    deleting.value = false
  }
}

// Config editing
const configEditing = ref(false)
const scraping = ref(false)

async function triggerNewScrape() {
  scraping.value = true
  try {
    const { triggerScrape } = await import('../../data/api')
    await triggerScrape()
    currentPage.value = 1
    await loadMaterials()
  } catch (err) {
    console.error('Failed to trigger scrape:', err)
  } finally {
    scraping.value = false
  }
}
const scrapeConfig = ref({ keywords: ['美甲爆款', '显白美甲', '春日美甲'], min_likes: 300 })
const editKeywords = ref([])
const newKeyword = ref('')
const editMinLikes = ref(300)
const configKeywords = computed(() => scrapeConfig.value.keywords || ['美甲爆款', '显白美甲', '春日美甲'])

async function loadConfig() {
  try {
    const { fetchScrapeConfig } = await import('../../data/api')
    const config = await fetchScrapeConfig()
    scrapeConfig.value = config
  } catch (err) {
    console.warn('Failed to load scrape config:', err.message)
  }
}

function openConfigEdit() {
  editKeywords.value = [...scrapeConfig.value.keywords]
  editMinLikes.value = scrapeConfig.value.min_likes || 300
  newKeyword.value = ''
  configEditing.value = true
}

function cancelConfigEdit() {
  configEditing.value = false
}

function addKeyword() {
  const kw = newKeyword.value.trim()
  if (kw && editKeywords.value.length < 3) {
    editKeywords.value.push(kw)
    newKeyword.value = ''
  }
}

function removeKeyword(i) {
  editKeywords.value.splice(i, 1)
}

async function saveConfig() {
  try {
    const { updateScrapeConfig } = await import('../../data/api')
    const merged = {
      ...scrapeConfig.value,
      keywords: editKeywords.value.length ? editKeywords.value : ['美甲爆款', '春日美甲'],
      min_likes: editMinLikes.value,
      updated_by: 'admin'
    }
    await updateScrapeConfig(merged)
    scrapeConfig.value = merged
    configEditing.value = false
  } catch (err) {
    console.error('Failed to save config:', err.message)
  }
}

async function loadMaterials() {
  xhsLoading.value = true
  try {
    const result = await fetchXhsMaterials({
      reviewStatus: statusFilter.value || undefined,
      limit: pageSize,
      offset: (currentPage.value - 1) * pageSize
    })
    xhsMaterials.value = result.materials
    totalCount.value = result.total
  } catch (err) {
    console.error('Failed to load XHS materials:', err)
  } finally {
    xhsLoading.value = false
  }
}

function openReview(item) {
  currentMaterial.value = {
    id: item.id,
    image: item.image || item.thumbnail,
    source: item.source,
    likes: item.likes,
    aiTags: item.aiTags,
    source_id: item.source
  }
  reviewVisible.value = true
}

async function handleReview(result) {
  try {
    const actionMap = { approved: 'approve', rejected: 'reject', deferred: 'pending' }
    const action = actionMap[result.status] || result.status

    await submitReview(result.id, {
      action,
      reason: result.reason || '',
      reasonCategory: result.reasonCategory || '',
      tags: result.tags,
      operator: 'platform_ops',
      operatorRole: 'platform_ops'
    })

    await loadMaterials()
  } catch (err) {
    console.error('Review submission failed:', err)
    alert('复审提交失败: ' + (err.response?.data?.message || err.message))
  }
}

onMounted(() => {
  loadMaterials()
  loadConfig()
})
</script>
