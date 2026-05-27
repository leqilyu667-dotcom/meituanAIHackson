<template>
  <header class="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-divider bg-cream/95 px-8 backdrop-blur">
    <div class="flex items-center gap-2 text-sm text-cocoa">
      <span v-for="(crumb, i) in breadcrumbs" :key="i" class="flex items-center gap-2">
        <span v-if="i > 0" class="text-divider">/</span>
        <span :class="i === breadcrumbs.length - 1 ? 'font-medium text-ink' : ''">{{ crumb }}</span>
      </span>
    </div>

    <div class="flex items-center gap-4">
      <button class="relative grid h-9 w-9 place-items-center rounded-full bg-white text-cocoa shadow-soft transition hover:text-primary-500" aria-label="通知">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
      </button>

      <div class="flex items-center gap-2">
        <div class="grid h-8 w-8 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
          商
        </div>
        <span class="text-sm font-medium text-ink">商家主账号</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbMap = {
  '/merchant/daily-report': ['数据小二', '经营日报'],
  '/merchant/trend-analysis': ['数据小二', '爆款趋势'],
  '/merchant/operation-advice': ['数据小二', '运营建议'],
  '/merchant/revenue-calc': ['运营小二', '营收计算器'],
  '/merchant/material-generate': ['运营小二', '爆款素材生成'],
  '/merchant/appointment': ['客服小二', '预约管理']
}

const breadcrumbs = computed(() => {
  return breadcrumbMap[route.path] || ['商家经营平台']
})
</script>
