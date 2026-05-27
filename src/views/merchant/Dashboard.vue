<template>
  <div class="p-8">
    <div class="mb-6">
      <p class="eyebrow">DATA ASSISTANT</p>
      <h1 class="mt-1 text-2xl font-semibold text-ink">经营日报</h1>
      <p class="mt-2 text-sm text-cocoa">一站式经营数据看板，从核心指标到订单结构、异常预警、导出推送</p>
    </div>

    <!-- 1. 核心经营概览 -->
    <section class="card mb-6 p-6">
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-lg font-medium text-ink">核心经营概览</h2>
        <div class="flex gap-1 rounded-full bg-cream p-1">
          <button
            @click="viewMode = 'daily'"
            class="rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300"
            :class="viewMode === 'daily' ? 'bg-white text-ink shadow-soft' : 'text-cocoa'"
          >
            日报
          </button>
          <button
            @click="viewMode = 'weekly'"
            class="rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300"
            :class="viewMode === 'weekly' ? 'bg-white text-ink shadow-soft' : 'text-cocoa'"
          >
            周报
          </button>
        </div>
      </div>

      <div v-if="loading" class="py-12 text-center text-cocoa">
        <p>数据加载中...</p>
      </div>
      <div v-else-if="!reportData" class="py-12 text-center text-cocoa">
        <svg class="mx-auto mb-3 h-12 w-12 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <p>暂无数据</p>
      </div>
      <div v-else class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          title="营收总额"
          :current="reportData.revenue.current"
          :previous="reportData.revenue.previous"
          unit="元"
        />
        <MetricCard
          title="客流量"
          :current="reportData.traffic.current"
          :previous="reportData.traffic.previous"
          unit="人"
        />
        <MetricCard
          title="客单价"
          :current="reportData.avgTicket.current"
          :previous="reportData.avgTicket.previous"
          unit="元"
        />
        <MetricCard
          title="订单完成率"
          :current="reportData.completionRate.current"
          :previous="reportData.completionRate.previous"
          unit="%"
        />
      </div>
    </section>

    <!-- 2. 订单结构分析 -->
    <section class="card mb-6 p-6">
      <h2 class="mb-4 text-lg font-medium text-ink">订单结构分析</h2>

      <div v-if="!tagRevenueRanking.length" class="py-8 text-center text-cocoa">
        <p>暂无相关款式数据</p>
      </div>
      <div v-else class="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <p class="mb-3 text-sm font-medium text-cocoa">热门标签营收 TOP10</p>
          <div class="overflow-hidden rounded-2xl border border-divider">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-divider bg-cream/50 text-left text-xs text-cocoa">
                  <th class="px-4 py-2.5 font-medium">排名</th>
                  <th class="px-4 py-2.5 font-medium">标签组合</th>
                  <th class="px-4 py-2.5 font-medium text-right">营收</th>
                  <th class="px-4 py-2.5 font-medium text-right">订单</th>
                  <th class="px-4 py-2.5 font-medium text-right">占比</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, i) in tagRevenueRanking.slice(0, 10)"
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
                    <span class="font-medium text-ink">{{ formatTagLabel(item.tags) }}</span>
                  </td>
                  <td class="px-4 py-3 text-right font-medium text-ink">¥{{ item.revenue.toLocaleString() }}</td>
                  <td class="px-4 py-3 text-right text-cocoa">{{ item.orders }}单</td>
                  <td class="px-4 py-3 text-right font-medium text-primary-600">{{ item.share }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="rounded-2xl bg-cream/40 p-5">
          <p class="text-sm font-medium text-cocoa">AI 试戴引流数据</p>
          <div class="mt-4 space-y-4">
            <div>
              <p class="text-xs text-cocoa/70">试戴带来订单总量</p>
              <p class="mt-1 text-2xl font-semibold text-ink">{{ tryOnData.totalOrders }}<span class="text-base font-normal text-cocoa"> 单</span></p>
            </div>
            <div>
              <p class="text-xs text-cocoa/70">总试戴次数</p>
              <p class="mt-1 text-2xl font-semibold text-ink">{{ tryOnData.totalTryOns }}<span class="text-base font-normal text-cocoa"> 次</span></p>
            </div>
            <div>
              <p class="text-xs text-cocoa/70">试戴转化率</p>
              <p class="mt-1 text-2xl font-semibold text-ink">{{ tryOnData.conversionRate }}<span class="text-base font-normal text-cocoa">%</span></p>
            </div>
          </div>
          <div class="mt-4 rounded-xl bg-white p-3">
            <div class="flex items-center justify-between text-xs text-cocoa">
              <span>转化漏斗</span>
              <span>{{ tryOnData.totalOrders }} / {{ tryOnData.totalTryOns }}</span>
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-cream">
              <div
                class="h-full rounded-full bg-primary-500 transition-all duration-500"
                :style="{ width: tryOnData.conversionRate + '%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. 经营异常预警 -->
    <section class="card mb-6 p-6">
      <h2 class="mb-4 text-lg font-medium text-ink">经营异常预警</h2>

      <div v-if="!anomalyAlerts.length" class="py-8 text-center">
        <div class="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-success/10">
          <svg class="h-6 w-6 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p class="text-sm text-cocoa">经营数据正常，暂无异动</p>
      </div>
      <div v-else class="space-y-3">
        <AnomalyAlert
          v-for="item in anomalyAlerts"
          :key="item.id"
          :alert="item"
        />
      </div>
    </section>

    <!-- 4. 导出与定时推送 -->
    <section class="card p-6">
      <h2 class="mb-4 text-lg font-medium text-ink">导出与定时推送</h2>

      <div class="grid gap-6 lg:grid-cols-2">
        <div>
          <p class="mb-3 text-sm font-medium text-cocoa">手动导出报表</p>
          <div class="flex gap-3">
            <button
              v-for="fmt in ['PDF', 'Excel']"
              :key="fmt"
              @click="handleExport(fmt)"
              class="flex items-center gap-2 rounded-2xl border border-divider bg-white px-5 py-3 text-sm font-medium text-ink shadow-soft transition-all hover:bg-primary-50 hover:text-primary-600 active:scale-95"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {{ fmt }}
            </button>
          </div>
          <p v-if="exportMsg" class="mt-2 text-xs" :class="exportMsg.type === 'success' ? 'text-success' : 'text-error'">
            {{ exportMsg.text }}
          </p>
        </div>

        <div>
          <p class="mb-3 text-sm font-medium text-cocoa">定时推送配置</p>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <label class="w-16 shrink-0 text-xs text-cocoa">推送周期</label>
              <div class="flex gap-1 rounded-full bg-cream p-1">
                <button
                  v-for="opt in ['每日', '每周']"
                  :key="opt"
                  @click="pushConfig.period = opt"
                  class="rounded-full px-4 py-1 text-xs font-medium transition-all"
                  :class="pushConfig.period === opt ? 'bg-white text-ink shadow-soft' : 'text-cocoa'"
                >
                  {{ opt }}
                </button>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <label class="w-16 shrink-0 text-xs text-cocoa">推送时间</label>
              <input v-model="pushConfig.time" type="time" class="input-field w-40 text-sm" />
            </div>
            <div class="flex items-center gap-3">
              <label class="w-16 shrink-0 text-xs text-cocoa">推送渠道</label>
              <div class="flex gap-2">
                <button
                  v-for="ch in ['小程序', '邮箱']"
                  :key="ch"
                  @click="toggleChannel(ch)"
                  class="rounded-full border px-3 py-1 text-xs font-medium transition-all"
                  :class="pushConfig.channels.includes(ch)
                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                    : 'border-divider text-cocoa'"
                >
                  {{ ch }}
                </button>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <label class="w-16 shrink-0 text-xs text-cocoa">推送范围</label>
              <select v-model="pushConfig.scope" class="input-field w-40 text-sm">
                <option value="core">核心指标</option>
                <option value="full">完整报表</option>
              </select>
            </div>
            <button
              @click="handlePushSave"
              class="btn-primary mt-2 rounded-[18px] px-6 py-2 text-sm"
            >
              保存配置
            </button>
            <p v-if="pushMsg" class="text-xs text-success">{{ pushMsg }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MetricCard from '../../components/merchant/MetricCard.vue'
import AnomalyAlert from '../../components/merchant/AnomalyAlert.vue'
import {
  dailyReportData,
  weeklyReportData,
  tagRevenueRanking,
  tryOnData as tryOnMockData,
  anomalyAlerts as anomalyMockData
} from '../../data/merchantMockData'

const viewMode = ref('daily')
const loading = ref(false)
const exportMsg = ref(null)
const pushMsg = ref('')

const pushConfig = ref({
  period: '每日',
  time: '09:00',
  channels: ['小程序'],
  scope: 'core'
})

const reportData = computed(() => {
  return viewMode.value === 'daily' ? dailyReportData : weeklyReportData
})

const tryOnData = computed(() => tryOnMockData)

const anomalyAlerts = computed(() => {
  // Simulate: only show on weekly view
  return viewMode.value === 'weekly' ? anomalyMockData : []
})

const formatTagLabel = (tags) => {
  return Object.values(tags).join('+')
}

const handleExport = (fmt) => {
  exportMsg.value = null
  setTimeout(() => {
    exportMsg.value = { type: 'success', text: `${fmt} 报表已开始下载` }
    setTimeout(() => { exportMsg.value = null }, 3000)
  }, 800)
}

const toggleChannel = (ch) => {
  const idx = pushConfig.value.channels.indexOf(ch)
  if (idx > -1) {
    pushConfig.value.channels.splice(idx, 1)
  } else {
    pushConfig.value.channels.push(ch)
  }
}

const handlePushSave = () => {
  pushMsg.value = '推送配置已保存'
  setTimeout(() => { pushMsg.value = '' }, 3000)
}
</script>
