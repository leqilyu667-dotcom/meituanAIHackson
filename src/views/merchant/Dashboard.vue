<template>
  <div class="p-8">
    <div class="mb-6">
      <p class="eyebrow">DATA ASSISTANT</p>
      <h1 class="mt-1 text-2xl font-semibold text-ink">经营日报</h1>
    </div>

    <div class="mb-6 flex gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="rounded-full px-5 py-2 text-sm font-medium transition-all duration-300"
        :class="activeTab === tab.key ? 'bg-primary-600 text-white shadow-glow' : 'bg-white text-cocoa shadow-soft'"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="card p-6">
      <p class="text-cocoa">经营概览内容（Step 2 实现）</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('overview')
const tabs = [
  { key: 'overview', label: '核心概览' },
  { key: 'order-structure', label: '订单结构分析' },
  { key: 'anomaly', label: '异常预警' },
  { key: 'export', label: '导出与推送' }
]
</script>
