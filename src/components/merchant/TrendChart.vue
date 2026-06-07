<template>
  <div class="h-48">
    <div class="flex h-full items-end gap-2">
      <div
        v-for="(item, i) in data"
        :key="i"
        class="group relative flex flex-1 flex-col items-center justify-end"
      >
        <span class="mb-1 text-[11px] font-medium text-ink opacity-0 transition group-hover:opacity-100">
          {{ item.order }}
        </span>
        <div class="relative w-full">
          <div
            class="w-full rounded-t-lg bg-primary-400 transition-all duration-500"
            :style="{ height: barHeight(item.order, maxValue) }"
          />
          <div
            class="absolute bottom-0 w-full rounded-t-lg bg-primary-600 transition-all duration-500"
            :style="{ height: barHeight(item.tryOn, maxValue) }"
            title="试戴"
          />
        </div>
        <span class="mt-2 text-[11px] text-cocoa">{{ item.day }}</span>
      </div>
    </div>
  </div>
  <div class="mt-4 flex items-center justify-center gap-6 text-xs text-cocoa">
    <span class="flex items-center gap-1.5">
      <span class="h-3 w-3 rounded-sm bg-primary-600" />
      试戴量
    </span>
    <span class="flex items-center gap-1.5">
      <span class="h-3 w-3 rounded-sm bg-primary-400" />
      订单量
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true }
})

const maxValue = computed(() => {
  const max = Math.max(...props.data.map(d => Math.max(d.tryOn, d.order)))
  return max || 1
})

const barHeight = (val, max) => {
  return Math.max((val / max) * 80, 4) + '%'
}
</script>
