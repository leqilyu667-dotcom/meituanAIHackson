<template>
  <div class="phone-shell pb-28">
    <header class="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      <div class="px-5 py-5">
        <p class="eyebrow">MESSAGES</p>
        <h1 class="mt-1 text-[22px] font-medium leading-[30px] text-ink">消息</h1>
      </div>
    </header>

    <main class="px-5 pt-2">
      <div class="relative mb-4">
        <input
          v-model="searchQuery"
          class="input-field pl-10"
          placeholder="搜索聊天记录"
        />
        <svg class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>

      <!-- 系统消息（置顶） -->
      <div class="card mb-3 cursor-pointer" @click="openSystemMessages">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-600">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <span class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white">3</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-medium text-ink">系统消息</h3>
              <span class="rounded-full bg-primary-200 px-1.5 py-0.5 text-[9px] font-semibold text-primary-700">置顶</span>
            </div>
            <p class="mt-0.5 truncate text-sm text-cocoa">预约确认、活动通知和平台公告</p>
          </div>
          <svg class="h-5 w-5 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>

      <!-- 分隔 -->
      <p class="mb-2 mt-1 px-1 text-xs text-placeholder">聊天</p>

      <!-- 普通消息 -->
      <div v-if="filteredMessages.length === 0" class="py-16 text-center">
        <div class="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary-50">
          <svg class="h-8 w-8 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 14.5a3 3 0 0 1-3 3H8l-5 3V6.5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z"/>
          </svg>
        </div>
        <p class="text-sm text-cocoa">暂无聊天消息</p>
      </div>

      <div v-else>
        <div v-for="msg in filteredMessages" :key="msg.id" class="card mb-3 cursor-pointer" @click="openChat(msg)">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 font-medium text-primary-600">
                {{ msg.avatar }}
              </div>
              <span v-if="msg.unread" class="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-error"></span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <h3 class="truncate font-medium text-ink">{{ msg.name }}</h3>
                <span class="ml-3 shrink-0 text-xs text-cocoa">{{ msg.time }}</span>
              </div>
              <p class="mt-1 truncate text-sm text-cocoa">{{ msg.content }}</p>
            </div>
            <svg class="h-5 w-5 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { messages } from '../data/mockData'

const router = useRouter()
const searchQuery = ref('')

const filteredMessages = computed(() => {
  if (!searchQuery.value.trim()) return messages
  const q = searchQuery.value.trim().toLowerCase()
  return messages.filter(m => m.name.toLowerCase().includes(q) || m.content.includes(q))
})

const openChat = (msg) => {
  router.push(`/chat/${msg.id}`)
}

const openSystemMessages = () => {
  alert('系统消息页面')
}
</script>
