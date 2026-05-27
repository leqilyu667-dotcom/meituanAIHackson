<template>
  <div class="p-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <p class="eyebrow">CUSTOMER SERVICE</p>
        <h1 class="mt-1 text-2xl font-semibold text-ink">预约管理</h1>
        <p class="mt-2 text-sm text-cocoa">统一管理门店预约，支持创建、变更、取消及状态流转</p>
      </div>
      <button
        @click="openCreate"
        class="btn-primary rounded-[18px] px-6 py-2.5 text-sm font-medium"
      >
        + 新建预约
      </button>
    </div>

    <!-- 筛选栏 -->
    <div class="card mb-6 p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex gap-1 rounded-full bg-cream p-1">
          <button
            v-for="v in views"
            :key="v.key"
            @click="view = v.key"
            class="rounded-full px-4 py-1.5 text-sm font-medium transition"
            :class="view === v.key ? 'bg-white text-ink shadow-soft' : 'text-cocoa'"
          >
            {{ v.label }}
          </button>
        </div>
        <div class="h-6 w-px bg-divider" />
        <button @click="prevPeriod" class="rounded-lg p-1 text-cocoa hover:bg-cream">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="text-sm font-medium text-ink">{{ periodLabel }}</span>
        <button @click="nextPeriod" class="rounded-lg p-1 text-cocoa hover:bg-cream">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div class="h-6 w-px bg-divider" />
        <select v-model="filterArtist" class="rounded-lg border border-divider bg-white px-3 py-1.5 text-sm text-ink outline-none">
          <option value="">全部美甲师</option>
          <option v-for="a in nailArtists" :key="a" :value="a">{{ a }}</option>
        </select>
        <select v-model="filterStatus" class="rounded-lg border border-divider bg-white px-3 py-1.5 text-sm text-ink outline-none">
          <option value="">全部状态</option>
          <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <span class="ml-auto text-xs text-cocoa">共 {{ filteredAppointments.length }} 条预约</span>
      </div>
    </div>

    <!-- 日历视图 -->
    <div v-if="view === 'calendar'" class="card mb-6 overflow-hidden p-4">
      <div class="grid grid-cols-7 text-center text-xs font-medium text-cocoa">
        <span v-for="d in dayHeaders" :key="d" class="py-2">{{ d }}</span>
      </div>
      <div class="grid grid-cols-7 text-center">
        <button
          v-for="(d, i) in calendarDays"
          :key="i"
          @click="selectDate(d.date)"
          :disabled="!d.date"
          class="relative rounded-xl py-3 text-sm transition"
          :class="d.date
            ? d.isSelected
              ? 'bg-primary-500 text-white'
              : d.isToday
                ? 'bg-primary-50 text-primary-600'
                : 'text-ink hover:bg-cream'
            : 'text-cocoa/30'"
        >
          {{ d.day }}
          <span
            v-if="d.hasAppt"
            class="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
            :class="d.isSelected ? 'bg-white' : 'bg-primary-500'"
          />
        </button>
      </div>
    </div>

    <!-- 列表视图 -->
    <section class="card p-6">
      <h2 class="mb-4 text-lg font-medium text-ink">
        {{ view === 'calendar' && selectedDate ? selectedDate + ' 预约' : periodLabel + ' 预约列表' }}
      </h2>

      <div v-if="!filteredAppointments.length" class="py-12 text-center text-cocoa">
        <p class="text-lg">📅</p>
        <p class="mt-2">暂无预约记录</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="apt in filteredAppointments"
          :key="apt.id"
          class="rounded-2xl border border-divider bg-white p-4 transition hover:shadow-soft"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-4">
              <div class="rounded-xl bg-cream/40 p-3 text-center min-w-[64px]">
                <p class="text-xs text-cocoa">{{ formatDate(apt.time) }}</p>
                <p class="mt-0.5 text-lg font-semibold text-ink">{{ formatTime(apt.time) }}</p>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-ink">{{ apt.customer }}</span>
                  <span class="text-xs text-cocoa">{{ apt.phone }}</span>
                </div>
                <div class="mt-1 flex items-center gap-3 text-xs text-cocoa">
                  <span>{{ apt.project }}</span>
                  <span class="text-divider">|</span>
                  <span>美甲师 {{ apt.nailArtist }}</span>
                </div>
                <p v-if="apt.cancelReason" class="mt-1 text-xs text-error">
                  取消原因：{{ apt.cancelReason }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                :class="statusClass(apt.status)"
              >
                {{ statusLabel(apt.status) }}
              </span>
              <!-- 操作按钮 -->
              <template v-if="apt.status === 'pending'">
                <button @click="confirmApt(apt)" class="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success hover:bg-success/20">确认</button>
                <button @click="openCancel(apt)" class="rounded-full bg-error/10 px-3 py-1 text-xs font-medium text-error hover:bg-error/20">取消</button>
              </template>
              <template v-else-if="apt.status === 'confirmed' || apt.status === 'changed'">
                <button @click="completeApt(apt)" class="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success hover:bg-success/20">完成</button>
                <button @click="openChange(apt)" class="rounded-full bg-cream px-3 py-1 text-xs font-medium text-cocoa hover:bg-white">变更</button>
                <button @click="openCancel(apt)" class="rounded-full bg-error/10 px-3 py-1 text-xs font-medium text-error hover:bg-error/20">取消</button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 新建/变更/取消 弹窗 -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="modalVisible"
          class="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm"
          @click.self="closeModal"
        >
          <div class="mx-4 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-card">
            <div class="border-b border-divider px-6 py-4">
              <h3 class="text-lg font-medium text-ink">{{ modalTitle }}</h3>
            </div>

            <div class="px-6 py-4">
              <!-- 取消表单 -->
              <template v-if="modalAction === 'cancel'">
                <p class="text-sm text-cocoa">
                  取消预约：{{ editingApt?.customer }} · {{ editingApt?.project }} · {{ editingApt?.time }}
                </p>
                <label class="mt-4 block text-xs text-cocoa">取消原因 <span class="text-error">*</span></label>
                <textarea
                  v-model="cancelReason"
                  rows="3"
                  class="input-field mt-1 text-sm"
                  placeholder="请填写取消原因（必填）"
                />
                <p v-if="cancelError" class="mt-1 text-xs text-error">{{ cancelError }}</p>
              </template>

              <!-- 新建/变更表单 -->
              <template v-else>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="text-xs text-cocoa">客户姓名 <span class="text-error">*</span></label>
                      <input v-model="form.customer" class="input-field mt-1 text-sm" placeholder="请输入" />
                    </div>
                    <div>
                      <label class="text-xs text-cocoa">手机号 <span class="text-error">*</span></label>
                      <input v-model="form.phone" class="input-field mt-1 text-sm" placeholder="请输入" />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="text-xs text-cocoa">预约日期 <span class="text-error">*</span></label>
                      <input v-model="form.date" type="date" class="input-field mt-1 text-sm" />
                    </div>
                    <div>
                      <label class="text-xs text-cocoa">预约时间 <span class="text-error">*</span></label>
                      <input v-model="form.timeStr" type="time" class="input-field mt-1 text-sm" />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="text-xs text-cocoa">美甲师 <span class="text-error">*</span></label>
                      <select v-model="form.nailArtist" class="input-field mt-1 text-sm">
                        <option value="" disabled>请选择</option>
                        <option v-for="a in nailArtists" :key="a" :value="a">{{ a }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-xs text-cocoa">服务项目 <span class="text-error">*</span></label>
                      <select v-model="form.project" class="input-field mt-1 text-sm">
                        <option value="" disabled>请选择</option>
                        <option v-for="s in serviceItems" :key="s.id" :value="s.name">{{ s.name }}（¥{{ s.price }}）</option>
                      </select>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <div class="flex justify-end gap-3 border-t border-divider px-6 py-4">
              <button @click="closeModal" class="btn-secondary rounded-[18px] px-6 py-2 text-sm">取消</button>
              <button
                @click="submitModal"
                class="rounded-[18px] px-6 py-2 text-sm font-medium text-white transition"
                :class="modalAction === 'cancel' ? 'bg-error hover:opacity-90' : 'bg-primary-600 hover:opacity-90'"
              >
                {{ modalAction === 'cancel' ? '确认取消' : modalAction === 'change' ? '确认变更' : '创建预约' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  appointments as appointmentsData,
  nailArtists,
  serviceItems,
  appointmentStatus
} from '../../data/merchantMockData'

const views = [
  { key: 'list', label: '列表' },
  { key: 'calendar', label: '日历' }
]
const dayHeaders = ['一', '二', '三', '四', '五', '六', '日']

const view = ref('list')
const currentDate = ref(new Date())
const selectedDate = ref('')
const filterArtist = ref('')
const filterStatus = ref('')
const appointments = ref([...appointmentsData])

// Modal state
const modalVisible = ref(false)
const modalAction = ref('create') // 'create' | 'change' | 'cancel'
const editingApt = ref(null)
const cancelReason = ref('')
const cancelError = ref('')
const form = reactive({
  customer: '',
  phone: '',
  date: '',
  timeStr: '',
  nailArtist: '',
  project: ''
})

const modalTitle = computed(() => {
  if (modalAction.value === 'cancel') return '取消预约'
  if (modalAction.value === 'change') return '变更预约'
  return '新建预约'
})

const statusOptions = Object.values(appointmentStatus)

const statusLabel = (s) => {
  const found = statusOptions.find(o => o.value === s)
  return found ? found.label : s
}

const statusClass = (s) => {
  const map = {
    pending: 'bg-warning/10 text-warning',
    confirmed: 'bg-primary-50 text-primary-600',
    completed: 'bg-success/10 text-success',
    changed: 'bg-cocoa/10 text-cocoa',
    cancelled: 'bg-error/10 text-error'
  }
  return map[s] || 'bg-cream text-cocoa'
}

const periodLabel = computed(() => {
  const d = currentDate.value
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
})

const filteredAppointments = computed(() => {
  let list = appointments.value
  if (filterArtist.value) {
    list = list.filter(a => a.nailArtist === filterArtist.value)
  }
  if (filterStatus.value) {
    list = list.filter(a => a.status === filterStatus.value)
  }
  if (view.value === 'calendar' && selectedDate.value) {
    list = list.filter(a => a.time.startsWith(selectedDate.value))
  }
  return list.sort((a, b) => a.time.localeCompare(b.time))
})

// Calendar
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7 // Monday start
  const days = []

  for (let i = 0; i < startOffset; i++) {
    days.push({ day: '', date: null, hasAppt: false, isToday: false, isSelected: false })
  }
  const today = new Date().toISOString().slice(0, 10)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      day: d,
      date: dateStr,
      hasAppt: appointments.value.some(a => a.time.startsWith(dateStr)),
      isToday: dateStr === today,
      isSelected: dateStr === selectedDate.value
    })
  }
  return days
})

const prevPeriod = () => {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() - 1)
  currentDate.value = d
}

const nextPeriod = () => {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + 1)
  currentDate.value = d
}

const selectDate = (dateStr) => {
  if (!dateStr) return
  selectedDate.value = dateStr
  view.value = 'list'
}

const formatDate = (time) => {
  const d = new Date(time)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const formatTime = (time) => {
  const d = new Date(time)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Actions
const openCreate = () => {
  modalAction.value = 'create'
  editingApt.value = null
  form.customer = ''
  form.phone = ''
  form.date = ''
  form.timeStr = ''
  form.nailArtist = ''
  form.project = ''
  modalVisible.value = true
}

const openChange = (apt) => {
  modalAction.value = 'change'
  editingApt.value = apt
  const [d, t] = apt.time.split(' ')
  form.customer = apt.customer
  form.phone = apt.phone
  form.date = d
  form.timeStr = t.slice(0, 5)
  form.nailArtist = apt.nailArtist
  form.project = apt.project
  modalVisible.value = true
}

const openCancel = (apt) => {
  modalAction.value = 'cancel'
  editingApt.value = apt
  cancelReason.value = ''
  cancelError.value = ''
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
  editingApt.value = null
}

const submitModal = () => {
  if (modalAction.value === 'cancel') {
    if (!cancelReason.value.trim()) {
      cancelError.value = '请填写取消原因'
      return
    }
    const idx = appointments.value.findIndex(a => a.id === editingApt.value.id)
    if (idx > -1) {
      appointments.value[idx].status = 'cancelled'
      appointments.value[idx].cancelReason = cancelReason.value
    }
  } else if (modalAction.value === 'change') {
    if (!form.customer || !form.phone || !form.date || !form.timeStr || !form.nailArtist || !form.project) {
      return
    }
    const idx = appointments.value.findIndex(a => a.id === editingApt.value.id)
    if (idx > -1) {
      Object.assign(appointments.value[idx], {
        customer: form.customer,
        phone: form.phone,
        time: `${form.date} ${form.timeStr}`,
        nailArtist: form.nailArtist,
        project: form.project,
        status: 'changed'
      })
    }
  } else {
    if (!form.customer || !form.phone || !form.date || !form.timeStr || !form.nailArtist || !form.project) {
      return
    }
    const newId = Math.max(...appointments.value.map(a => a.id), 0) + 1
    appointments.value.push({
      id: newId,
      customer: form.customer,
      phone: form.phone,
      time: `${form.date} ${form.timeStr}`,
      nailArtist: form.nailArtist,
      project: form.project,
      status: 'pending'
    })
  }
  closeModal()
}

const confirmApt = (apt) => {
  const idx = appointments.value.findIndex(a => a.id === apt.id)
  if (idx > -1) appointments.value[idx].status = 'confirmed'
}

const completeApt = (apt) => {
  const idx = appointments.value.findIndex(a => a.id === apt.id)
  if (idx > -1) appointments.value[idx].status = 'completed'
}
</script>
