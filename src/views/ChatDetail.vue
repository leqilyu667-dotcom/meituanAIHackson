<template>
  <div class="phone-shell flex flex-col h-screen bg-cream">
    <!-- ═══ Header ═══ -->
    <header class="shrink-0 bg-cream/95 backdrop-blur border-b border-divider/50">
      <div class="flex items-center gap-2 px-4 py-3">
        <button @click="goBack" class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white shadow-soft">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-base font-medium text-ink">{{ contact?.name }}</h1>
          <div class="flex items-center gap-2 text-[11px]">
            <button @click="goToSalon" class="text-primary-600 font-medium hover:underline">🏪 {{ salonShortName }}</button>
            <span class="text-cocoa/40">·</span>
            <button @click="goToArtist" class="text-primary-700 font-medium hover:underline">💅 {{ contact?.artistName }}</button>
          </div>
        </div>
      </div>
    </header>

    <!-- ═══ Messages ═══ -->
    <div class="flex-1 overflow-y-auto px-4 py-3">
      <div v-for="msg in chatMessages" :key="msg.id" class="mb-4 flex" :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'">
        <!-- Other's avatar (clickable) -->
        <div v-if="msg.sender !== 'user'"
          @click="msg.sender === 'salon' ? goToSalon() : goToArtist()"
          class="mr-2 grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full text-[10px] font-semibold active:scale-95 transition"
          :class="msg.sender === 'salon' ? 'bg-primary-100 text-primary-600' : 'bg-blush text-primary-700'">
          {{ msg.sender === 'salon' ? '店' : senderInitial(msg.senderName) }}
        </div>
        <div class="max-w-[70%]">
          <!-- Sender name (clickable) -->
          <p v-if="msg.sender !== 'user'"
            @click="msg.sender === 'salon' ? goToSalon() : goToArtist()"
            class="mb-0.5 ml-1 text-[10px] font-medium cursor-pointer hover:underline"
            :class="msg.sender === 'salon' ? 'text-primary-600' : 'text-primary-700'">
            {{ msg.sender === 'salon' ? '🏪 ' : '💅 ' }}{{ msg.senderName || contact?.name }}
          </p>
          <div class="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
            :class="msg.sender === 'user'
              ? 'bg-primary-500 text-white rounded-br-md'
              : msg.sender === 'artist'
                ? 'bg-blush text-ink rounded-bl-md shadow-soft'
                : 'bg-white text-ink rounded-bl-md shadow-soft'">
            <!-- 图片消息 -->
            <img v-if="msg.image" :src="msg.image" alt="发送的图片" class="mb-1.5 max-w-[200px] rounded-xl object-cover" />
            {{ msg.text }}
          </div>
          <p class="mt-0.5 text-[10px] text-cocoa/50" :class="msg.sender === 'user' ? 'text-right' : 'ml-1'">{{ msg.time }}</p>
        </div>
        <!-- User avatar -->
        <div v-if="msg.sender === 'user'" class="ml-2 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-200 text-[10px] font-medium text-primary-600">我</div>
      </div>
    </div>

    <!-- ═══ Input Bar ═══ -->
    <div class="shrink-0 border-t border-divider bg-white px-3 py-2.5 safe-bottom">
      <div class="flex items-center gap-2">
        <!-- 选图发送 -->
        <button @click="triggerImageUpload" class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-500 active:scale-95 transition">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
          </svg>
        </button>
        <!-- 拍照发送 -->
        <button @click="triggerCamera" class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-500 active:scale-95 transition">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
        <input v-model="newMessage" class="flex-1 rounded-full border border-divider bg-cream px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-100" placeholder="输入消息..." @keyup.enter="sendMessage" />
        <button @click="sendMessage" :disabled="!newMessage.trim() && !pendingImage" class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-500 text-white transition disabled:opacity-40">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </div>
      <!-- 待发送图片预览 -->
      <div v-if="pendingImage" class="mt-2 flex items-center gap-2">
        <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
          <img :src="pendingImage" alt="待发送" class="h-full w-full object-cover" />
          <button @click="pendingImage = ''" class="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink/60 text-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <span class="text-xs text-cocoa">图片已选择，点击发送</span>
      </div>
      <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="onImageSelected" />
      <input ref="cameraInput" type="file" accept="image/*" capture="environment" class="hidden" @change="onImageSelected" />
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
const pendingImage = ref('')
const imageInput = ref(null)
const cameraInput = ref(null)

const groupSubtitle = computed(() => {
  if (!contact.value) return ''
  return `商家 · 美甲师 · 您`
})

const salonShortName = computed(() => {
  if (!contact.value) return ''
  return contact.value.name.split('·')[0]?.trim() || contact.value.name
})

const senderInitial = (name) => {
  return name ? name.charAt(0) : '?'
}

const goBack = () => router.back()

const goToSalon = () => {
  if (contact.value?.salonId) {
    router.push(`/salon-detail/${contact.value.salonId}`)
  }
}

const goToArtist = () => {
  if (contact.value?.artistId) {
    router.push(`/artist-detail/${contact.value.artistId}`)
  }
}

const triggerImageUpload = () => imageInput.value?.click()
const triggerCamera = () => cameraInput.value?.click()

const onImageSelected = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { pendingImage.value = ev.target.result }
  reader.readAsDataURL(file)
  e.target.value = ''
}

const sendMessage = () => {
  const text = newMessage.value.trim()
  const img = pendingImage.value
  if (!text && !img) return

  const now = new Date()
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // 发送图片消息
  if (img) {
    chatMessages.value.push({ id: Date.now(), sender: 'user', text: text || '[图片]', image: img, time })
    pendingImage.value = ''
  } else {
    chatMessages.value.push({ id: Date.now(), sender: 'user', text, time })
  }
  newMessage.value = ''

  // Auto-reply
  setTimeout(() => {
    const senders = ['artist', 'salon']
    const sender = senders[Math.floor(Math.random() * senders.length)]
    const replies = img ? ['收到图片了，很好看！', '看到了，到时候参考这个做~', '好的，已保存参考图'] : ['好的，收到~', '没问题，我帮您安排', '感谢您的回复！', '明白了，稍等哦~']
    const reply = replies[Math.floor(Math.random() * replies.length)]
    const replyTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes() + 1).padStart(2, '0')}`
    chatMessages.value.push({
      id: Date.now() + 1,
      sender,
      senderName: sender === 'artist' ? contact.value?.artistName : contact.value?.name?.split('·')[0]?.trim(),
      text: reply,
      time: replyTime
    })
  }, 1000)
}
</script>
