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

      <p class="mb-4 text-sm font-medium text-cocoa">热门标签组合 TOP10 · 近7天</p>
      <div class="overflow-hidden rounded-2xl border border-divider">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-divider bg-cream/50 text-left text-xs text-cocoa">
              <th class="px-4 py-2.5 font-medium">排名</th>
              <th class="px-4 py-2.5 font-medium">标签组合</th>
              <th class="px-4 py-2.5 font-medium text-right">试戴量</th>
              <th class="px-4 py-2.5 font-medium text-right">订单量</th>
              <th class="px-4 py-2.5 font-medium text-right">热度分</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, i) in hotTags"
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
                <TagBadge :tags="item.tags" />
              </td>
              <td class="px-4 py-3 text-right text-cocoa">{{ item.tryOnCount }}</td>
              <td class="px-4 py-3 text-right text-cocoa">{{ item.orderCount }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <div class="h-1.5 w-16 overflow-hidden rounded-full bg-cream">
                    <div
                      class="h-full rounded-full bg-primary-500"
                      :style="{ width: item.score + '%' }"
                    />
                  </div>
                  <span class="w-7 text-right text-xs font-medium text-primary-600">{{ item.score }}</span>
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

    <!-- 3. 站外小红书素材 -->
    <section class="card p-6">
      <h2 class="mb-4 text-lg font-medium text-ink">站外小红书素材</h2>

      <div class="mb-5 rounded-2xl bg-cream/40 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-ink">OpenClaw 抓取配置</p>
            <p class="mt-1 text-xs text-cocoa">抓取周期：每周1次 · 关键词：美甲爆款、显白美甲、春日美甲 · 高互动优先</p>
          </div>
          <button class="rounded-full bg-white px-4 py-2 text-xs font-medium text-primary-600 shadow-soft transition hover:bg-primary-50">
            修改配置
          </button>
        </div>
      </div>

      <p class="mb-3 text-sm font-medium text-cocoa">
        待审素材（{{ xhsMaterials.length }}）
      </p>

      <div v-if="!xhsMaterials.length" class="py-8 text-center text-cocoa">
        <p>暂无待审素材</p>
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="item in xhsMaterials"
          :key="item.id"
          class="overflow-hidden rounded-3xl border border-divider bg-white shadow-soft transition hover:shadow-card"
        >
          <div class="relative">
            <img :src="item.image" alt="" class="aspect-square w-full object-cover" />
            <span
              class="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-medium"
              :class="item.status === 'pending' ? 'bg-warning/90 text-white' : 'bg-success/90 text-white'"
            >
              {{ item.status === 'pending' ? '待审' : '已审' }}
            </span>
          </div>
          <div class="p-4">
            <TagBadge :tags="item.aiTags" />
            <div class="mt-2 flex items-center gap-3 text-xs text-cocoa">
              <span>点赞 {{ item.likes }}</span>
              <span>收藏 {{ item.collects }}</span>
              <span>评论 {{ item.comments }}</span>
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
import { ref } from 'vue'
import TagBadge from '../../components/merchant/TagBadge.vue'
import TrendChart from '../../components/merchant/TrendChart.vue'
import ReviewModal from '../../components/merchant/ReviewModal.vue'
import {
  storeInfo,
  hotTags as hotTagsData,
  trendData as trendMockData,
  peerComparison,
  xhsPendingMaterials as xhsMockMaterials
} from '../../data/merchantMockData'

const scope = ref('门店')
const hotTags = ref(hotTagsData)
const trendData = ref(trendMockData)

const comparisonMetrics = [
  { label: '营收总额', my: '5.62万', peer: '4.82万', unit: '', compare: 17 },
  { label: '客流量', my: '312', peer: '268', unit: '人', compare: 16 },
  { label: '客单价', my: '180', peer: '179', unit: '元', compare: 1 },
  { label: '订单完成率', my: '90', peer: '87', unit: '%', compare: 3 }
]

// XHS materials
const xhsMaterials = ref([...xhsMockMaterials])
const reviewVisible = ref(false)
const currentMaterial = ref({})

const openReview = (item) => {
  currentMaterial.value = item
  reviewVisible.value = true
}

const handleReview = (result) => {
  const idx = xhsMaterials.value.findIndex(m => m.id === result.id)
  if (idx > -1) {
    xhsMaterials.value[idx].status = result.status === 'pending' ? 'approved' : result.status
    xhsMaterials.value[idx].aiTags = result.tags
  }
}
</script>
