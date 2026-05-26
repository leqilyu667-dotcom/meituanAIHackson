<template>
  <div class="phone-shell flex flex-col bg-cream">
    <header class="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      <div class="flex items-center gap-3 px-5 py-4">
        <button @click="goBack" class="grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink shadow-soft">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
        </button>
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-lg font-medium text-ink">{{ contact?.name }}</h1>
          <p class="text-xs text-cocoa">在线</p>
        </div>
        <button class="grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink shadow-soft">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto px-5 py-4">
      <div
        v-for="msg in chatMessages"
        :key="msg.id"
        class="mb-4 flex"
        :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div v-if="msg.sender === 'salon'" class="mr-3 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-medium text-primary-600">
          {{ contact?.avatar }}
        </div>
        <div class="max-w-[75%]">
          <div
            class="rounded-2xl px-4 py-3 text-sm leading-relaxed"
            :class="msg.sender === 'user'
              ? 'bg-primary-500 text-white rounded-br-md'
              : 'bg-white text-ink rounded-bl-md shadow-soft'"
          >
            {{ msg.text }}
          </div>
          <p class="mt-1 text-[11px] text-cocoa/60" :class="msg.sender === 'user' ? 'text-right' : 'text-left'">
            {{ msg.time }}
          </p>
        </div>
        <div v-if="msg.sender === 'user'" class="ml-3 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-200 text-xs font-medium text-primary-600">
          我
        </div>
      </div>
    </div>

    <div class="border-t border-divider bg-white px-4 py-3">
      <div class="flex items-center gap-3">
        <button class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>
          </svg>
        </button>
        <input
          v-model="newMessage"
          class="flex-1 rounded-full border border-divider bg-cream px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-100"
          placeholder="输入消息..."
          @keyup.enter="sendMessage"
        />
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim()"
          class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-500 text-white transition disabled:opacity-40"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { messages, chatMessages as chatData } from '../data/mockData'

const router = useRouter()
const route = useRoute()

const chatId = parseInt(route.params.id)
const contact = computed(() => messages.find(m => m.id === chatId))
const chatMessages = ref([...(chatData[chatId] || [])])
const newMessage = ref('')

const goBack = () => router.back()

const sendMessage = () => {
  const text = newMessage.value.trim()
  if (!text) return
  const now = new Date()
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  chatMessages.value.push({ id: Date.now(), sender: 'user', text, time })
  newMessage.value = ''

  setTimeout(() => {
    const replies = ['好的，收到~', '没问题，我帮您安排', '感谢您的回复！', '明白了，稍等哦~']
    const reply = replies[Math.floor(Math.random() * replies.length)]
    const replyTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes() + 1).padStart(2, '0')}`
    chatMessages.value.push({ id: Date.now() + 1, sender: 'salon', text: reply, time: replyTime })
  }, 1000)
}
</script>
