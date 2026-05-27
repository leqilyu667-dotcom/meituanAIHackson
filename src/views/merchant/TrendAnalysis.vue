<template>
  <div class="p-8">
    <div class="mb-6">
      <p class="eyebrow">DATA ASSISTANT</p>
      <h1 class="mt-1 text-2xl font-semibold text-ink">爆款趋势</h1>
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
      <p class="text-cocoa">爆款趋势内容（Step 5-6 实现）</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('internal')
const tabs = [
  { key: 'internal', label: '站内标签识别' },
  { key: 'comparison', label: '同质店铺对比' },
  { key: 'external', label: '站外素材抓取' }
]
</script>
