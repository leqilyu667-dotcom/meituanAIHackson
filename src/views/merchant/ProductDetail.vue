<template>
  <div class="p-8">
    <!-- Back -->
    <router-link
      to="/merchant/product-manage"
      class="mb-4 inline-flex items-center gap-1.5 text-sm text-cocoa transition hover:text-ink"
    >
      ‹ 返回货架管理
    </router-link>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="h-6 w-6 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-30"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <span class="ml-3 text-sm text-cocoa">加载中...</span>
    </div>

    <template v-else-if="design">
      <!-- Header -->
      <div class="mb-6">
        <p class="eyebrow">DESIGN DETAIL</p>
        <h1 class="mt-1 text-2xl font-semibold text-ink">{{ design.name }}</h1>
        <div class="mt-2 flex items-center gap-3">
          <TagBadge :tags="design.tags" />
          <span
            class="rounded-full px-2 py-0.5 text-[11px] font-medium"
            :class="design.isListed ? 'bg-success/10 text-success' : 'bg-cream text-cocoa'"
          >
            {{ design.isListed ? '已上架' : '已下架' }}
          </span>
          <span v-if="design.isPinned" class="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] text-primary-600">
            已置顶
          </span>
        </div>
        <p class="mt-1 text-xs text-cocoa">售价 ¥{{ design.price }} · 创建于 {{ design.createdAt }}</p>
      </div>

      <!-- Sales hero cards -->
      <section class="mb-6 grid grid-cols-2 gap-4">
        <div class="card p-5">
          <p class="text-xs text-cocoa">累计销量</p>
          <p class="mt-2 text-3xl font-bold text-ink">{{ stats.totalOrders }} <span class="text-sm font-normal text-cocoa">单</span></p>
          <p class="mt-1 text-xs text-cocoa/60">近7天</p>
        </div>
        <div class="card p-5">
          <p class="text-xs text-cocoa">累计营收</p>
          <p class="mt-2 text-3xl font-bold text-ink">¥{{ stats.totalRevenue.toLocaleString() }}</p>
          <p class="mt-1 text-xs text-cocoa/60">近7天</p>
        </div>
      </section>

      <!-- 7-day daily sales chart -->
      <section class="card mb-6 p-5">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-ink">近7天每日销量</h3>
          <span class="text-[11px] text-cocoa/60">订单量 · 营收</span>
        </div>

        <!-- Chart area -->
        <div class="mt-4">
          <!-- Y-axis max line -->
          <div class="flex items-end gap-2" style="height: 160px">
            <!-- Y-axis labels -->
            <div class="flex shrink-0 flex-col justify-between h-full pb-6 mr-1">
              <span class="text-[10px] text-cocoa/50">{{ maxDailyOrders }}</span>
              <span class="text-[10px] text-cocoa/50">{{ Math.round(maxDailyOrders * 0.5) }}</span>
              <span class="text-[10px] text-cocoa/50">0</span>
            </div>

            <!-- Bars -->
            <div
              v-for="(day, i) in stats.dailyOrders"
              :key="i"
              class="relative flex flex-1 flex-col items-center justify-end"
              style="height: 100%"
            >
              <!-- Value label on top -->
              <div
                class="mb-1 text-[10px] font-medium text-ink transition-opacity"
                :style="{ marginBottom: Math.max((day.orders / maxDailyOrders) * 132, 4) + 8 + 'px' }"
              >
                {{ day.orders }}
              </div>

              <!-- Order bar -->
              <div
                class="relative w-full max-w-[32px] rounded-t-md bg-primary-400 transition-all duration-500"
                :style="{ height: Math.max((day.orders / maxDailyOrders) * 132, 2) + 'px' }"
              >
                <!-- Revenue tooltip on hover (shown as text below) -->
              </div>

              <!-- Revenue label below bar -->
              <span class="mt-1 text-[10px] text-cocoa/60">¥{{ day.revenue }}</span>

              <!-- Day label -->
              <span class="mt-1 text-[11px] font-medium text-cocoa">{{ day.day }}</span>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="mt-4 flex items-center justify-center gap-4 text-xs text-cocoa">
          <span class="flex items-center gap-1.5">
            <span class="h-3 w-3 rounded-sm bg-primary-400" /> 当日订单量（柱顶数字）
          </span>
          <span class="flex items-center gap-1.5">
            <span class="text-[10px] text-cocoa/60">¥营收</span> 当日营收（柱底数字）
          </span>
        </div>
      </section>

      <!-- Sub metrics: try-on & conversion -->
      <section class="card mb-6 p-5">
        <h3 class="text-sm font-medium text-ink">试戴数据</h3>
        <div class="mt-4 grid grid-cols-3 gap-4">
          <div class="rounded-xl bg-cream/30 p-4 text-center">
            <p class="text-xl font-bold text-ink">{{ stats.totalTryOns }}</p>
            <p class="mt-1 text-xs text-cocoa">累计试戴次数</p>
          </div>
          <div class="rounded-xl bg-cream/30 p-4 text-center">
            <p class="text-xl font-bold text-ink">{{ stats.tryOnConversion }}%</p>
            <p class="mt-1 text-xs text-cocoa">试戴转化率</p>
          </div>
          <div class="rounded-xl bg-cream/30 p-4 text-center">
            <p class="text-xl font-bold text-ink">¥{{ design.price || 0 }}</p>
            <p class="mt-1 text-xs text-cocoa">客单价</p>
          </div>
        </div>
      </section>

      <!-- Operation logs -->
      <section class="card p-5">
        <h3 class="text-sm font-medium text-ink">
          操作记录
          <span class="text-xs font-normal text-cocoa">（{{ logs.length }} 条）</span>
        </h3>
        <div v-if="logs.length === 0" class="mt-4 py-8 text-center text-sm text-cocoa">
          暂无操作记录
        </div>
        <div v-else class="mt-3 space-y-2">
          <div
            v-for="log in logs"
            :key="log.id"
            class="flex items-center justify-between rounded-xl bg-cream/30 px-4 py-2.5"
          >
            <div class="flex items-center gap-3">
              <span
                class="rounded-full px-2 py-0.5 text-[11px] font-medium"
                :class="{
                  'bg-success/10 text-success': log.action === 'list',
                  'bg-error/10 text-error': log.action === 'unlist',
                  'bg-primary-50 text-primary-600': log.action === 'edit',
                  'bg-warning/10 text-warning': log.action === 'sort',
                  'bg-cream text-cocoa': log.action === 'create'
                }"
              >
                {{ actionLabel(log.action) }}
              </span>
              <span class="text-sm text-ink">{{ log.operator }}</span>
            </div>
            <span class="text-xs text-cocoa">{{ log.createdAt }}</span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TagBadge from '../../components/merchant/TagBadge.vue'
import { fetchDesignDetail } from '../../data/api'

const route = useRoute()
const design = ref(null)
const stats = ref({ totalOrders: 0, totalRevenue: 0, totalTryOns: 0, tryOnConversion: '0', dailyOrders: [] })
const logs = ref([])
const loading = ref(true)

const maxDailyOrders = computed(() => Math.max(1, ...stats.value.dailyOrders.map(d => d.orders)))

function actionLabel(action) {
  const map = {
    create: '创建',
    list: '上架',
    unlist: '下架',
    edit: '编辑',
    sort: '排序'
  }
  return map[action] || action
}

onMounted(async () => {
  try {
    const data = await fetchDesignDetail(route.params.id)
    design.value = data
    stats.value = data.stats
    logs.value = data.logs || []
  } catch (err) {
    console.error('Failed to load design detail:', err.message)
  } finally {
    loading.value = false
  }
})
</script>
