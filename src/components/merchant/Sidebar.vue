<template>
  <aside class="fixed left-0 top-0 z-50 flex h-screen w-56 flex-col border-r border-divider bg-white/95 backdrop-blur">
    <div class="flex h-16 items-center gap-3 border-b border-divider px-5">
      <div class="grid h-9 w-9 place-items-center rounded-full bg-primary-500 text-sm font-bold text-white">
        N
      </div>
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold text-ink">妙手</p>
        <p class="text-xs text-cocoa">智慧经营平台</p>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto py-4">
      <div v-for="group in menuGroups" :key="group.name" class="mb-4">
        <p class="px-5 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-cocoa/60">
          {{ group.name }}
        </p>
        <router-link
          v-for="item in group.items"
          :key="item.path"
          :to="item.path"
          class="mx-3 mb-0.5 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
          :class="isActive(item.path)
            ? 'bg-primary-50 text-primary-600'
            : 'text-cocoa hover:bg-primary-50/50 hover:text-ink'"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="isActive(item.path) ? 'bg-primary-500' : 'bg-transparent'" />
          {{ item.label }}
        </router-link>
      </div>
    </nav>

    <router-link to="/merchant/profile" class="border-t border-divider px-5 py-4 block transition hover:bg-cream/50">
      <div class="flex items-center gap-3">
        <div class="grid h-8 w-8 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
          商
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-ink">商家主账号</p>
          <p class="text-xs text-cocoa">全部功能权限</p>
        </div>
      </div>
    </router-link>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const menuGroups = [
  {
    name: '数据小二',
    items: [
      { label: '经营日报', path: '/merchant/daily-report' },
      { label: '爆款报告', path: '/merchant/trend-analysis' },
      { label: '运营建议', path: '/merchant/operation-advice' }
    ]
  },
  {
    name: '运营小二',
    items: [
      { label: '营收计算器', path: '/merchant/revenue-calc' },
      { label: '爆款素材生成', path: '/merchant/material-generate' },
      { label: '货架管理', path: '/merchant/product-manage' },
      { label: '订单记录', path: '/merchant/order-history' }
    ]
  },
  {
    name: '客服小二',
    items: [
      { label: '消息管理', path: '/merchant/messages' },
      { label: '预约管理', path: '/merchant/appointment' }
    ]
  }
]

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path)
}
</script>
