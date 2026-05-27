<template>
  <span class="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
    <span v-for="(val, key) in tags" :key="key" class="whitespace-nowrap">
      {{ val }}
      <span v-if="!isLast(key)" class="ml-0.5 text-primary-300">·</span>
    </span>
  </span>
</template>

<script setup>
const props = defineProps({
  tags: { type: Object, required: true }
})

const keys = ['shape', 'tone', 'craft', 'decor', 'style']

const isLast = (key) => {
  return keys.indexOf(key) === keys.length - 1
}
</script>
