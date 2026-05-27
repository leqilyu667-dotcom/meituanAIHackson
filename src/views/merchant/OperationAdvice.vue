<template>
  <div class="p-8">
    <div class="mb-6">
      <p class="eyebrow">DATA ASSISTANT</p>
      <h1 class="mt-1 text-2xl font-semibold text-ink">运营建议</h1>
      <p class="mt-2 text-sm text-cocoa">基于本店数据与平台趋势，智能推荐优势放大与缺口补齐策略</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- 敌有我优 -->
      <section class="card p-6">
        <div class="mb-5 flex items-center gap-2">
          <svg class="h-5 w-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <h2 class="text-lg font-medium text-ink">敌有我优 · 放大优势</h2>
        </div>
        <p class="mb-4 text-xs text-cocoa">本店转化率高于平台均值 ≥ 20% 的标签组合</p>

        <div v-if="!advantageAdvice.length" class="py-8 text-center text-cocoa">
          <p>暂无优势建议</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="item in advantageAdvice"
            :key="item.id"
            class="rounded-2xl border border-success/20 bg-success/5 p-5"
          >
            <div class="flex items-center justify-between">
              <TagBadge :tags="item.tags" />
              <span class="text-xs font-medium text-success">优势标签</span>
            </div>
            <p class="mt-3 text-sm font-medium text-ink">{{ item.title }}</p>
            <div class="mt-3 grid grid-cols-2 gap-3">
              <div class="rounded-xl bg-white p-3 text-center">
                <p class="text-xs text-cocoa">本店转化率</p>
                <p class="mt-1 text-xl font-semibold text-success">{{ item.conversionRate }}%</p>
              </div>
              <div class="rounded-xl bg-white p-3 text-center">
                <p class="text-xs text-cocoa">平台均值</p>
                <p class="mt-1 text-xl font-semibold text-ink">{{ item.platformAvg }}%</p>
              </div>
            </div>
            <div class="mt-3 space-y-2">
              <div class="flex items-start gap-2 text-xs">
                <span class="mt-0.5 shrink-0 rounded-full bg-success/10 px-1.5 py-0.5 text-success">动作</span>
                <span class="text-cocoa">{{ item.action }}</span>
              </div>
              <div class="flex items-start gap-2 text-xs">
                <span class="mt-0.5 shrink-0 rounded-full bg-success/10 px-1.5 py-0.5 text-success">预期</span>
                <span class="text-cocoa">{{ item.expectedEffect }}</span>
              </div>
            </div>
            <router-link
              :to="item.link"
              class="btn-primary mt-4 block w-full rounded-[18px] py-2 text-center text-sm"
            >
              调整款式曝光
            </router-link>
          </div>
        </div>
      </section>

      <!-- 敌有我无 -->
      <section class="card p-6">
        <div class="mb-5 flex items-center gap-2">
          <svg class="h-5 w-5 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
          <h2 class="text-lg font-medium text-ink">敌有我无 · 弥补缺口</h2>
        </div>
        <p class="mb-4 text-xs text-cocoa">平台热度上涨 ≥ 20% 且本店缺失的热门标签</p>

        <div v-if="!gapAdvice.length" class="py-8 text-center text-cocoa">
          <p>暂无缺口建议</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="item in gapAdvice"
            :key="item.id"
            class="rounded-2xl border border-warning/20 bg-warning/5 p-5"
          >
            <div class="flex items-center justify-between">
              <TagBadge :tags="item.tags" />
              <span class="text-xs font-medium text-warning">缺失标签</span>
            </div>
            <p class="mt-3 text-sm font-medium text-ink">{{ item.title }}</p>
            <div class="mt-3 grid grid-cols-2 gap-3">
              <div class="rounded-xl bg-white p-3 text-center">
                <p class="text-xs text-cocoa">热度上涨</p>
                <p class="mt-1 text-xl font-semibold text-warning">+{{ item.heatRise }}%</p>
              </div>
              <div class="rounded-xl bg-white p-3 text-center">
                <p class="text-xs text-cocoa">平台订单量</p>
                <p class="mt-1 text-xl font-semibold text-ink">{{ item.platformOrders }}</p>
              </div>
            </div>
            <div class="mt-3 flex items-start gap-2 text-xs">
              <span class="mt-0.5 shrink-0 rounded-full bg-warning/10 px-1.5 py-0.5 text-warning">动作</span>
              <span class="text-cocoa">{{ item.action }}</span>
            </div>
            <router-link
              :to="item.link"
              class="btn-primary mt-4 block w-full rounded-[18px] py-2 text-center text-sm"
            >
              生成爆款素材
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import TagBadge from '../../components/merchant/TagBadge.vue'
import { advantageAdvice, gapAdvice } from '../../data/merchantMockData'
</script>
