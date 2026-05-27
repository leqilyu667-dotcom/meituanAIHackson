<template>
  <div class="rounded-3xl bg-white p-5 shadow-soft transition-all duration-300 hover:shadow-card">
    <p class="text-sm text-cocoa">{{ title }}</p>
    <div class="mt-2 flex items-baseline gap-1">
      <span class="text-[28px] font-semibold leading-9 text-ink">
        {{ displayValue }}
      </span>
      <span class="text-sm text-cocoa">{{ unit }}</span>
    </div>
    <div class="mt-3 flex items-center gap-1.5">
      <svg
        v-if="change !== 0"
        class="h-4 w-4"
        :class="changeDirection === 'up' ? 'text-success rotate-0' : 'text-error rotate-180'"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 4l-8 8h5v8h6v-8h5z"/>
      </svg>
      <span
        class="text-sm font-medium"
        :class="isAnomaly ? 'text-error' : changeDirection === 'up' ? 'text-success' : 'text-error'"
      >
        {{ change >= 0 ? '+' : '' }}{{ change }}%
      </span>
      <span class="text-xs text-cocoa/70">较上周期</span>
    </div>
    <p v-if="isAnomaly" class="mt-1 text-xs font-medium text-error">异常波动</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  current: { type: Number, required: true },
  previous: { type: Number, required: true },
  unit: { type: String, default: '' },
  anomalyThreshold: { type: Number, default: 30 }
})

const change = computed(() => {
  if (props.previous === 0) return 0
  return Math.round((props.current - props.previous) / props.previous * 100)
})

const changeDirection = computed(() => {
  if (change.value === 0) return 'flat'
  return change.value > 0 ? 'up' : 'down'
})

const isAnomaly = computed(() => {
  return Math.abs(change.value) >= props.anomalyThreshold
})

const displayValue = computed(() => {
  if (props.current >= 10000) {
    return (props.current / 10000).toFixed(1) + '万'
  }
  return props.current.toLocaleString()
})
</script>
