<template>
  <header class="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-divider bg-cream/95 px-8 backdrop-blur">
    <button
      @click="goBack"
      class="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white shadow-soft text-cocoa transition hover:text-ink"
      title="返回"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
      </svg>
    </button>
    <div class="flex items-center gap-2 text-sm text-cocoa">
      <span v-for="(crumb, i) in breadcrumbs" :key="i" class="flex items-center gap-2">
        <span v-if="i > 0" class="text-divider">/</span>
        <span :class="i === breadcrumbs.length - 1 ? 'font-medium text-ink' : ''">{{ crumb }}</span>
      </span>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function goBack() {
  router.push('/merchant')
}

const breadcrumbMap = {
  '/merchant/daily-report': ['数据小二', '经营日报'],
  '/merchant/trend-analysis': ['数据小二', '爆款报告'],
  '/merchant/operation-advice': ['数据小二', '运营建议'],
  '/merchant/revenue-calc': ['运营小二', '营收计算器'],
  '/merchant/material-generate': ['运营小二', '爆款素材生成'],
  '/merchant/product-manage': ['运营小二', '货架管理'],
  '/merchant/appointment': ['客服小二', '预约管理'],
  '/merchant/messages': ['客服小二', '消息管理']
}

const breadcrumbs = computed(() => {
  return breadcrumbMap[route.path] || ['商家经营平台']
})
</script>
