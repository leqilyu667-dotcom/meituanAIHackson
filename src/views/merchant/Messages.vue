<template>
  <div class="flex h-[calc(100vh-64px)]">
    <!-- Conversation list sidebar -->
    <div class="w-72 shrink-0 border-r border-divider bg-white flex flex-col">
      <div class="px-4 py-4 border-b border-divider">
        <p class="eyebrow">CUSTOMER SERVICE</p>
        <h2 class="mt-1 text-lg font-semibold text-ink">消息管理</h2>
      </div>

      <div class="px-3 py-3">
        <div class="relative">
          <input
            v-model="searchQuery"
            class="input-field pl-9 text-sm"
            placeholder="搜索客户..."
          />
          <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <svg class="h-5 w-5 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-30"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>

        <div v-else-if="filteredConversations.length === 0" class="px-4 py-12 text-center text-sm text-cocoa">
          {{ searchQuery ? '无匹配对话' : '暂无用户对话' }}
        </div>

        <button
          v-for="conv in filteredConversations"
          :key="conv.id"
          @click="selectConversation(conv)"
          class="w-full px-3 py-3 text-left transition hover:bg-cream/50"
          :class="activeConv?.id === conv.id ? 'bg-primary-50/60 border-r-2 border-primary-500' : ''"
        >
          <div class="flex items-start gap-3">
            <div class="relative shrink-0">
              <div class="grid h-10 w-10 place-items-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                {{ conv.customerName.charAt(0) }}
              </div>
              <span
                v-if="conv.unreadCount > 0 && activeConv?.id !== conv.id"
                class="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-error text-[10px] font-bold text-white grid place-items-center"
              >
                {{ conv.unreadCount }}
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-ink truncate">{{ conv.customerName }}</p>
                <span class="text-[10px] text-cocoa/50 shrink-0">{{ formatTime(conv.lastMessageAt) }}</span>
              </div>
              <p class="mt-0.5 text-xs text-cocoa truncate">{{ conv.lastMessage }}</p>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Chat area -->
    <div class="flex-1 flex flex-col bg-cream/30">
      <!-- Empty state -->
      <div v-if="!activeConv" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <p class="text-4xl">💬</p>
          <p class="mt-3 text-sm text-cocoa">选择一个对话开始沟通</p>
        </div>
      </div>

      <!-- Active chat -->
      <template v-else>
        <!-- Chat header -->
        <div class="flex items-center justify-between border-b border-divider bg-white px-5 py-3">
          <div class="flex items-center gap-3">
            <div class="grid h-9 w-9 place-items-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
              {{ activeConv.customerName.charAt(0) }}
            </div>
            <div>
              <p class="text-sm font-medium text-ink">{{ activeConv.customerName }}</p>
              <p class="text-xs text-cocoa">{{ activeConv.customerPhone }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="openCreateApt"
              class="rounded-[18px] bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              预约
            </button>
          </div>
        </div>

        <!-- Messages + appointment banner -->
        <div class="flex-1 flex flex-col min-h-0">
          <!-- Appointment banner: active (confirmed/pending/changed) -->
          <div
            v-if="activeAppointment && !['cancelled','completed'].includes(activeAppointment.status)"
            class="border-b border-divider bg-white px-5 py-3"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 min-w-0">
                <div class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-ink truncate">
                    {{ activeAppointment.nailArtist }}老师 · {{ activeAppointment.appointmentTime }}
                  </p>
                  <p class="text-xs text-cocoa truncate">
                    {{ activeAppointment.serviceItem || '美甲服务' }}
                    <span v-if="activeAppointment.status === 'changed'" class="ml-1 text-warning">（已变更）</span>
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0 ml-3">
                <button
                  @click="openModify"
                  class="rounded-[14px] border border-divider bg-white px-3 py-1.5 text-xs text-cocoa transition hover:bg-cream"
                >修改</button>
                <button
                  @click="showCancelModal = true"
                  class="rounded-[14px] border border-error/30 bg-white px-3 py-1.5 text-xs text-error transition hover:bg-error/5"
                >取消</button>
                <router-link
                  :to="`/merchant/appointment`"
                  class="rounded-[14px] bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 transition hover:bg-primary-100"
                >查看</router-link>
              </div>
            </div>
          </div>

          <!-- Completed appointment notice -->
          <div
            v-if="activeAppointment && activeAppointment.status === 'completed'"
            class="border-b border-divider bg-success/5 px-5 py-2.5"
          >
            <p class="text-xs text-success">
              已完成 — {{ activeAppointment.nailArtist }}老师 · {{ activeAppointment.serviceItem || '美甲服务' }} · {{ activeAppointment.appointmentTime }}
            </p>
          </div>

          <!-- Cancelled appointment notice -->
          <div
            v-if="activeAppointment && activeAppointment.status === 'cancelled'"
            class="border-b border-divider bg-error/5 px-5 py-2.5"
          >
            <p class="text-xs text-error">
              已取消 — {{ activeAppointment.cancelReason || '无原因' }}
            </p>
          </div>

          <!-- Messages -->
          <div ref="msgContainer" class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            <div v-if="msgLoading" class="flex justify-center py-8">
              <svg class="h-5 w-5 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-30"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </div>

            <div
              v-for="msg in messages"
              :key="msg.id"
              class="flex"
              :class="msg.sender === 'merchant' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[70%] rounded-2xl px-4 py-2.5 text-sm"
                :class="msg.sender === 'merchant'
                  ? 'bg-primary-500 text-white rounded-br-md'
                  : 'bg-white border border-divider text-ink rounded-bl-md'"
              >
                {{ msg.content }}
              </div>
            </div>
          </div>
        </div>

        <!-- Send bar -->
        <div class="border-t border-divider bg-white px-5 py-3">
          <div class="flex items-center gap-2">
            <input
              v-model="newMessage"
              @keydown.enter="sendMsg"
              class="input-field flex-1 text-sm"
              placeholder="输入消息..."
            />
            <button
              @click="sendMsg"
              :disabled="!newMessage.trim() || sending"
              class="rounded-[18px] bg-primary-500 px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
            >
              发送
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Appointment create/modify modal -->
    <Teleport to="body">
      <div
        v-if="showAppointment && activeConv"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
        @click.self="closeAptModal"
      >
        <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-card">
          <h2 class="text-lg font-semibold text-ink">{{ isModifying ? '修改预约' : '创建预约' }}</h2>
          <p class="mt-1 text-xs text-cocoa">为 {{ activeConv.customerName }}（{{ activeConv.customerPhone }}）{{ isModifying ? '修改' : '创建' }}预约</p>

          <div class="mt-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-medium text-cocoa">美甲师 *</label>
                <select v-model="aptForm.nailArtist" class="input-field mt-1 w-full text-sm">
                  <option value="">请选择</option>
                  <option v-for="a in nailArtists" :key="a" :value="a">{{ a }}</option>
                </select>
              </div>
              <div>
                <label class="text-xs font-medium text-cocoa">预约时间 *</label>
                <input v-model="aptForm.appointmentTime" type="datetime-local" class="input-field mt-1 w-full text-sm" />
              </div>
            </div>
            <div>
              <label class="text-xs font-medium text-cocoa">服务项目</label>
              <select v-model="aptForm.serviceItem" class="input-field mt-1 w-full text-sm">
                <option value="">请选择（可选）</option>
                <option v-for="s in serviceItems" :key="s.id" :value="s.name">{{ s.name }} (¥{{ s.price }})</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-cocoa">备注</label>
              <textarea v-model="aptForm.notes" rows="2" class="input-field mt-1 w-full text-sm resize-none" placeholder="客户备注（可选）" />
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button
              @click="closeAptModal"
              class="flex-1 rounded-[18px] border border-divider bg-white py-2.5 text-sm text-cocoa transition hover:bg-cream"
            >
              取消
            </button>
            <button
              @click="submitAppointment"
              :disabled="!aptForm.nailArtist || !aptForm.appointmentTime || aptSubmitting"
              class="flex-1 rounded-[18px] bg-primary-500 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {{ aptSubmitting ? '提交中...' : (isModifying ? '确认修改' : '确认预约') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Cancel reason modal -->
    <Teleport to="body">
      <div
        v-if="showCancelModal"
        class="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 backdrop-blur-sm"
        @click.self="showCancelModal = false"
      >
        <div class="w-full max-w-sm rounded-3xl bg-white p-6 shadow-card">
          <h2 class="text-lg font-semibold text-ink">取消预约</h2>
          <p class="mt-1 text-xs text-cocoa">取消后不可恢复，请填写取消原因</p>
          <div class="mt-4">
            <label class="text-xs font-medium text-cocoa">取消原因 *</label>
            <textarea
              v-model="cancelReason"
              rows="3"
              class="input-field mt-1 w-full text-sm resize-none"
              placeholder="请填写取消原因..."
            />
          </div>
          <div class="mt-6 flex gap-3">
            <button
              @click="showCancelModal = false"
              class="flex-1 rounded-[18px] border border-divider bg-white py-2.5 text-sm text-cocoa transition hover:bg-cream"
            >
              返回
            </button>
            <button
              @click="submitCancel"
              :disabled="!cancelReason.trim() || aptSubmitting"
              class="flex-1 rounded-[18px] bg-error py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {{ aptSubmitting ? '取消中...' : '确认取消' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch, onMounted } from 'vue'
import { fetchConversations, fetchMessages, sendMessage, createAppointmentFromChat, modifyAppointmentFromChat, cancelAppointmentFromChat } from '../../data/api'
import { nailArtists, serviceItems } from '../../data/merchantMockData'

const searchQuery = ref('')
const conversations = ref([])
const loading = ref(true)
const activeConv = ref(null)
const messages = ref([])
const msgLoading = ref(false)
const newMessage = ref('')
const sending = ref(false)
const msgContainer = ref(null)
const showAppointment = ref(false)
const isModifying = ref(false)
const activeAppointment = ref(null)
const aptSubmitting = ref(false)
const showCancelModal = ref(false)
const cancelReason = ref('')

const aptForm = reactive({
  nailArtist: '',
  appointmentTime: '',
  serviceItem: '',
  notes: ''
})

const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) return conversations.value
  const q = searchQuery.value.trim().toLowerCase()
  return conversations.value.filter(c => c.customerName.toLowerCase().includes(q))
})

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts + (ts.includes('T') ? '' : 'Z'))
  if (isNaN(d.getTime())) return ts
  const now = Date.now()
  const diff = now - d.getTime()
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + '小时前'
  return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

async function loadConversations() {
  loading.value = true
  try {
    conversations.value = await fetchConversations()
  } catch (err) {
    console.error('Failed to load conversations:', err.message)
  } finally {
    loading.value = false
  }
}

async function selectConversation(conv) {
  activeConv.value = conv
  showAppointment.value = false
  activeAppointment.value = null
  msgLoading.value = true
  try {
    const data = await fetchMessages(conv.id)
    messages.value = data.messages
    activeAppointment.value = data.appointment || null
    // Update unread count locally
    conv.unreadCount = 0
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Failed to load messages:', err.message)
  } finally {
    msgLoading.value = false
  }
}

async function sendMsg() {
  const text = newMessage.value.trim()
  if (!text || !activeConv.value || sending.value) return
  sending.value = true
  try {
    await sendMessage(activeConv.value.id, text)
    messages.value.push({ id: Date.now(), sender: 'merchant', content: text })
    newMessage.value = ''
    activeConv.value.lastMessage = text
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Failed to send:', err.message)
  } finally {
    sending.value = false
  }
}

function scrollToBottom() {
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  }
}

function openCreateApt() {
  isModifying.value = false
  aptForm.nailArtist = ''
  aptForm.appointmentTime = ''
  aptForm.serviceItem = ''
  aptForm.notes = ''
  showAppointment.value = true
}

function openModify() {
  if (!activeAppointment.value) return
  isModifying.value = true
  aptForm.nailArtist = activeAppointment.value.nailArtist || ''
  aptForm.appointmentTime = activeAppointment.value.appointmentTime || ''
  aptForm.serviceItem = activeAppointment.value.serviceItem || ''
  aptForm.notes = activeAppointment.value.notes || ''
  showAppointment.value = true
}

function closeAptModal() {
  showAppointment.value = false
  isModifying.value = false
}

async function submitAppointment() {
  if (!aptForm.nailArtist || !aptForm.appointmentTime) return
  aptSubmitting.value = true
  try {
    if (isModifying.value) {
      await modifyAppointmentFromChat(
        activeConv.value.id,
        activeAppointment.value.appointmentId,
        {
          nailArtist: aptForm.nailArtist,
          appointmentTime: aptForm.appointmentTime,
          serviceItem: aptForm.serviceItem,
          notes: aptForm.notes
        }
      )
      activeAppointment.value = {
        ...activeAppointment.value,
        nailArtist: aptForm.nailArtist,
        appointmentTime: aptForm.appointmentTime,
        serviceItem: aptForm.serviceItem,
        notes: aptForm.notes,
        status: 'changed'
      }
      messages.value.push({
        id: Date.now(),
        sender: 'merchant',
        content: `预约已变更：${aptForm.nailArtist}老师 · ${aptForm.appointmentTime}${aptForm.serviceItem ? ' · ' + aptForm.serviceItem : ''}`
      })
    } else {
      const result = await createAppointmentFromChat(activeConv.value.id, {
        nailArtist: aptForm.nailArtist,
        appointmentTime: aptForm.appointmentTime,
        serviceItem: aptForm.serviceItem,
        notes: aptForm.notes
      })
      activeAppointment.value = {
        appointmentId: result.appointmentId,
        customerName: result.customerName,
        nailArtist: result.nailArtist,
        appointmentTime: result.appointmentTime,
        serviceItem: aptForm.serviceItem,
        notes: aptForm.notes,
        status: 'confirmed'
      }
      messages.value.push({
        id: Date.now(),
        sender: 'merchant',
        content: `已为您预约：${result.nailArtist}老师 · ${result.appointmentTime}${aptForm.serviceItem ? ' · ' + aptForm.serviceItem : ''}`
      })
    }
    showAppointment.value = false
    isModifying.value = false
    await nextTick()
    scrollToBottom()
  } catch (err) {
    alert((isModifying.value ? '修改' : '创建') + '失败: ' + (err.response?.data?.message || err.message))
  } finally {
    aptSubmitting.value = false
  }
}

async function submitCancel() {
  if (!cancelReason.value.trim()) return
  aptSubmitting.value = true
  try {
    await cancelAppointmentFromChat(activeConv.value.id, activeAppointment.value.appointmentId, cancelReason.value.trim())
    activeAppointment.value = {
      ...activeAppointment.value,
      status: 'cancelled',
      cancelReason: cancelReason.value.trim()
    }
    showCancelModal.value = false
    cancelReason.value = ''
    messages.value.push({
      id: Date.now(),
      sender: 'merchant',
      content: `预约已取消（原因：${cancelReason.value.trim()}）`
    })
    await nextTick()
    scrollToBottom()
  } catch (err) {
    alert('取消失败: ' + (err.response?.data?.message || err.message))
  } finally {
    aptSubmitting.value = false
  }
}

onMounted(() => {
  loadConversations()
})
</script>
