<template>
  <div class="flex items-start gap-4 rounded-2xl border border-divider bg-white p-4 transition hover:shadow-soft">
    <div class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-error/10">
      <svg class="h-5 w-5 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4M12 16h.01"/>
      </svg>
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <span class="font-medium text-ink">{{ alert.metric }}</span>
        <span class="rounded-full bg-error/10 px-2 py-0.5 text-xs font-bold text-error">
          {{ alert.change >= 0 ? '+' : '' }}{{ alert.change }}%
        </span>
      </div>
      <p class="mt-1 text-sm text-cocoa">{{ alert.reason }}</p>
      <p class="mt-0.5 text-xs text-cocoa/60">{{ alert.period }}</p>
    </div>
    <router-link
      :to="alert.link"
      class="shrink-0 rounded-full bg-primary-50 px-4 py-2 text-xs font-medium text-primary-600 transition hover:bg-primary-100"
    >
      查看详情
    </router-link>
  </div>
</template>

<script setup>
defineProps({
  alert: { type: Object, required: true }
})
</script>
