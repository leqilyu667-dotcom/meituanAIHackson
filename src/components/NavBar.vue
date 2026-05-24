<template>
  <nav class="fixed bottom-4 left-0 right-0 z-50 px-4">
    <div class="mx-auto max-w-md">
      <div class="glass-panel grid grid-cols-5 items-center gap-1 rounded-full px-2 py-2">
        <button
          v-for="item in navItems"
          :key="item.path"
          @click="navigate(item.path)"
          class="nav-item h-14 rounded-full"
          :class="{ active: isActive(item.path), 'bg-primary-50': isActive(item.path) }"
          :aria-label="item.label"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <component :is="item.icon" />
          </svg>
          <span class="text-[11px] font-semibold">{{ item.label }}</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, h } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentPath = computed(() => router.currentRoute.value.path)

const navItems = [
  { path: '/', label: '灵感', icon: () => h('g', [h('path', { d: 'M4 13.5V7.8A2.8 2.8 0 0 1 6.8 5h10.4A2.8 2.8 0 0 1 20 7.8v8.4a2.8 2.8 0 0 1-2.8 2.8H8.4' }), h('path', { d: 'M4 19l4.4-4.4' }), h('path', { d: 'M9 10h6M9 14h3' })] ) },
  { path: '/tryon', label: '试戴', icon: () => h('g', [h('path', { d: 'M7.5 4.5c1.3 1.2 2 2.8 2 4.6v6.4a2.5 2.5 0 0 0 5 0V9.1c0-1.8.7-3.4 2-4.6' }), h('path', { d: 'M6 13.5h12' }), h('path', { d: 'M8 20h8' })] ) },
  { path: '/salon', label: '店铺', icon: () => h('g', [h('path', { d: 'M4 10h16l-1.2-5.2A1 1 0 0 0 17.8 4H6.2a1 1 0 0 0-1 .8L4 10Z' }), h('path', { d: 'M6 10v9h12v-9' }), h('path', { d: 'M9 19v-5h6v5' })] ) },
  { path: '/messages', label: '消息', icon: () => h('g', [h('path', { d: 'M21 14.5a3 3 0 0 1-3 3H8l-5 3V6.5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z' }), h('path', { d: 'M8 9h8M8 13h5' })] ) },
  { path: '/profile', label: '我的', icon: () => h('g', [h('circle', { cx: '12', cy: '8', r: '4' }), h('path', { d: 'M4 21a8 8 0 0 1 16 0' })] ) }
]

const isActive = (path) => {
  if (path === '/') return currentPath.value === '/'
  return currentPath.value.startsWith(path)
}

const navigate = (path) => {
  router.push(path)
}
</script>
