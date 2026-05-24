<template>
  <div class="phone-shell pb-28">
    <header class="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      <div class="px-5 py-5">
        <p class="eyebrow">MESSAGES</p>
        <h1 class="mt-1 text-[22px] font-medium leading-[30px] text-ink">消息</h1>
      </div>
    </header>

    <main class="px-5 pt-2">
      <div class="card mb-3" v-for="msg in messages" :key="msg.id" @click="openChat(msg)">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
              {{ msg.avatar }}
            </div>
            <span v-if="msg.unread" class="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full"></span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between">
              <h3 class="truncate font-medium text-ink">{{ msg.name }}</h3>
              <span class="ml-3 shrink-0 text-xs text-cocoa">{{ msg.time }}</span>
            </div>
            <p class="mt-1 truncate text-sm text-cocoa">{{ msg.content }}</p>
          </div>
          <svg class="w-5 h-5 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-600">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <circle cx="9" cy="8" r="4"/>
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-medium text-ink">系统消息</h3>
            <p class="mt-1 truncate text-sm text-cocoa">查看系统通知和活动消息</p>
          </div>
          <svg class="w-5 h-5 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { messages } from '../data/mockData'

const openChat = (msg) => {
  alert(`打开与 ${msg.name} 的聊天`)
}
</script>
