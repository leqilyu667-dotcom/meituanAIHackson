<template>
  <span class="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
    <template v-for="(key, idx) in displayKeys" :key="key">
      <span v-if="tags[key]">
        {{ tags[key] }}
        <span v-if="!isLast(idx)" class="text-primary-300">·</span>
      </span>
    </template>
  </span>
</template>

<script setup>
const props = defineProps({
  tags: { type: Object, required: true }
})

const displayKeys = ['tone', 'craft', 'decor']

const isLast = (idx) => {
  // Check if any subsequent displayKey has a non-empty value
  for (let i = idx + 1; i < displayKeys.length; i++) {
    if (props.tags[displayKeys[i]]) return false
  }
  return true
}
</script>
