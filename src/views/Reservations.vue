<template>
  <div class="phone-shell pb-28">
    <header class="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      <div class="flex items-center gap-3 px-5 py-5">
        <button @click="goBack" class="grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink shadow-soft">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <p class="eyebrow">RESERVATIONS</p>
          <h1 class="text-[22px] font-medium leading-[30px] text-ink">预约记录</h1>
        </div>
        <div class="ml-auto flex rounded-full bg-white p-0.5 shadow-soft">
          <button
            @click="viewMode = 'list'"
            class="rounded-full px-4 py-1.5 text-sm font-medium transition"
            :class="viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-cocoa'"
          >列表</button>
          <button
            @click="viewMode = 'calendar'"
            class="rounded-full px-4 py-1.5 text-sm font-medium transition"
            :class="viewMode === 'calendar' ? 'bg-primary-500 text-white' : 'text-cocoa'"
          >日历</button>
        </div>
      </div>
      <div v-if="viewMode === 'list'" class="px-5 pb-3">
        <div class="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            v-for="tab in statusTabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition"
            :class="activeTab === tab.key ? 'bg-primary-600 text-white shadow-glow' : 'bg-white text-cocoa shadow-soft'"
          >
            {{ tab.label }}
            <span v-if="tab.key !== 'all' && counts[tab.key]" class="ml-1 text-xs opacity-70">({{ counts[tab.key] }})</span>
          </button>
        </div>
      </div>
    </header>

    <main class="px-5 pt-4">
      <!-- ========== LIST VIEW ========== -->
      <template v-if="viewMode === 'list'">
        <div v-if="filteredReservations.length === 0" class="py-20 text-center">
          <div class="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-primary-50">
            <svg class="h-10 w-10 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <p class="text-cocoa">{{ activeTab === 'all' ? '暂无预约记录' : '暂无此类预约' }}</p>
          <button @click="goToSalon" class="mt-3 text-sm text-primary-600">去预约美甲店</button>
        </div>

        <div v-else class="space-y-4">
          <div v-for="r in filteredReservations" :key="r.id" class="card overflow-hidden">
            <!-- Status + Date header -->
            <div class="mb-3 flex items-center justify-between">
              <span
                class="rounded-full px-3 py-1 text-xs font-medium"
                :class="statusBadgeClass(r.status)"
              >{{ r.statusText }}</span>
              <span class="text-xs text-cocoa">{{ r.date }} {{ r.time }}</span>
            </div>

            <!-- Salon info row -->
            <div class="flex gap-3">
              <img :src="r.nailImage" alt="" class="h-20 w-20 shrink-0 rounded-2xl object-cover" />
              <div class="min-w-0 flex-1">
                <h3 class="font-medium text-ink">{{ r.salonName }}</h3>
                <p class="mt-0.5 text-sm text-cocoa">{{ r.service }} · ¥{{ r.price }}</p>
                <div class="mt-1 flex items-center gap-1 text-xs text-cocoa">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {{ r.location }}
                </div>
              </div>
            </div>

            <!-- Artist + Nail style chips -->
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <div class="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5">
                <div class="grid h-5 w-5 place-items-center rounded-full bg-primary-200 text-[10px] font-medium text-primary-600">{{ r.artistAvatar }}</div>
                <span class="text-xs text-cocoa">{{ r.artistName }}</span>
              </div>
              <button
                @click="viewNailStyle(r)"
                class="flex items-center gap-1 rounded-full bg-blush px-3 py-1.5 text-xs text-primary-600 transition hover:bg-primary-100"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {{ r.nailStyleName }}
              </button>
            </div>

            <!-- Remark -->
            <div v-if="r.remark" class="mt-2 rounded-xl bg-cream px-3 py-2 text-xs text-cocoa">
              <span class="font-medium text-ink">备注：</span>{{ r.remark }}
            </div>

            <!-- Action buttons -->
            <div class="mt-3 flex gap-2 border-t border-divider pt-3">
              <template v-if="r.status === 'confirmed' || r.status === 'pending'">
                <button
                  @click="cancelReservation(r)"
                  class="flex-1 rounded-full border border-divider py-2.5 text-sm text-cocoa transition hover:bg-neutral-50"
                >取消预约</button>
                <button
                  @click="chatWithArtist(r)"
                  class="flex items-center justify-center gap-1.5 rounded-full bg-primary-500 px-4 py-2.5 text-sm text-white"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 14.5a3 3 0 0 1-3 3H8l-5 3V6.5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z"/>
                  </svg>
                  联系{{ r.artistName }}
                </button>
              </template>
              <template v-else-if="r.status === 'completed'">
                <button @click="rebook(r)" class="flex-1 rounded-full border border-primary-300 py-2.5 text-sm text-primary-600">再次预约</button>
                <button @click="writeReview(r)" class="flex-1 rounded-full bg-primary-500 py-2.5 text-sm text-white">写评价</button>
              </template>
              <template v-else-if="r.status === 'cancelled'">
                <button @click="rebook(r)" class="flex-1 rounded-full bg-primary-500 py-2.5 text-sm text-white">重新预约</button>
                <button @click="removeReservation(r)" class="flex-1 rounded-full border border-divider py-2.5 text-sm text-cocoa">删除记录</button>
              </template>
            </div>
          </div>
        </div>
      </template>

      <!-- ========== CALENDAR VIEW ========== -->
      <template v-if="viewMode === 'calendar'">
        <!-- Calendar header -->
        <div class="mb-4 flex items-center justify-between">
          <button @click="prevMonth" class="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft">
            <svg class="h-5 w-5 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <h2 class="text-lg font-medium text-ink">{{ calendarYear }}年 {{ calendarMonth + 1 }}月</h2>
          <button @click="nextMonth" class="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft">
            <svg class="h-5 w-5 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>

        <!-- Weekday headers -->
        <div class="mb-2 grid grid-cols-7 text-center">
          <span v-for="d in weekDays" :key="d" class="py-2 text-xs font-medium text-cocoa">{{ d }}</span>
        </div>

        <!-- Calendar grid -->
        <div class="grid grid-cols-7 gap-1">
          <div v-for="(day, idx) in calendarDays" :key="idx" class="relative">
            <button
              v-if="day"
              @click="selectDate(day.dateStr)"
              class="flex aspect-square w-full flex-col items-center justify-center rounded-xl text-sm transition"
              :class="calendarDateClass(day)"
            >
              <span>{{ day.dayNum }}</span>
              <span v-if="day.hasReservation" class="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary-500"></span>
            </button>
            <div v-else class="aspect-square w-full"></div>
          </div>
        </div>

        <!-- Selected date reservations -->
        <div class="mt-6">
          <h3 class="section-title mb-3" v-if="selectedDateReservations.length">
            {{ selectedCalendarDate }} 预约
          </h3>
          <p v-else class="py-8 text-center text-sm text-cocoa">
            {{ selectedCalendarDate ? `${selectedCalendarDate} 无预约` : '点击日期查看预约详情' }}
          </p>
          <div v-for="r in selectedDateReservations" :key="r.id" class="card mb-3">
            <div class="mb-3 flex items-center justify-between">
              <span class="rounded-full px-3 py-1 text-xs font-medium" :class="statusBadgeClass(r.status)">{{ r.statusText }}</span>
              <span class="text-xs text-cocoa">{{ r.time }}</span>
            </div>
            <div class="flex gap-3">
              <img :src="r.nailImage" alt="" class="h-16 w-16 shrink-0 rounded-2xl object-cover" />
              <div class="min-w-0 flex-1">
                <h4 class="font-medium text-ink">{{ r.salonName }}</h4>
                <p class="mt-0.5 text-sm text-cocoa">{{ r.service }} · ¥{{ r.price }}</p>
                <div class="mt-1.5 flex items-center gap-1.5">
                  <div class="grid h-5 w-5 place-items-center rounded-full bg-primary-200 text-[10px] font-medium text-primary-600">{{ r.artistAvatar }}</div>
                  <span class="text-xs text-cocoa">{{ r.artistName }}</span>
                </div>
              </div>
            </div>
            <div class="mt-3 flex gap-2 border-t border-divider pt-3">
              <button @click="viewNailStyle(r)" class="flex-1 rounded-full bg-primary-50 py-2 text-sm text-primary-600">查看款式</button>
              <button @click="chatWithArtist(r)" class="flex-1 rounded-full bg-primary-500 py-2 text-sm text-white">联系美甲师</button>
            </div>
          </div>
        </div>
      </template>

      <!-- Cancel confirmation modal -->
      <transition name="fade">
        <div v-if="showCancelModal" class="fixed inset-0 z-50 grid place-items-center bg-ink/40 backdrop-blur-sm px-8">
          <div class="w-full max-w-sm rounded-4xl bg-white p-6 shadow-card">
            <div class="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-error/10">
              <svg class="h-8 w-8 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h3 class="text-center text-lg font-medium text-ink">确认取消预约？</h3>
            <p class="mt-2 text-center text-sm text-cocoa">
              将取消 {{ cancelTarget?.salonName }}<br/>{{ cancelTarget?.date }} {{ cancelTarget?.time }} 的预约
            </p>
            <div class="mt-6 flex gap-3">
              <button @click="showCancelModal = false" class="flex-1 rounded-2xl border border-divider py-3 text-sm text-cocoa">再想想</button>
              <button @click="confirmCancel" class="flex-1 rounded-2xl bg-error py-3 text-sm text-white">确定取消</button>
            </div>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { reservations } from '../data/mockData'

const router = useRouter()

const viewMode = ref('list')
const activeTab = ref('all')
const showCancelModal = ref(false)
const cancelTarget = ref(null)

const calendarYear = ref(new Date().getFullYear())
const calendarMonth = ref(new Date().getMonth())
const selectedCalendarDate = ref('')
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'confirmed', label: '已确认' },
  { key: 'pending', label: '待确认' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' }
]

const counts = computed(() => ({
  confirmed: reservations.filter(r => r.status === 'confirmed').length,
  pending: reservations.filter(r => r.status === 'pending').length,
  completed: reservations.filter(r => r.status === 'completed').length,
  cancelled: reservations.filter(r => r.status === 'cancelled').length
}))

const filteredReservations = computed(() => {
  if (activeTab.value === 'all') return reservations
  return reservations.filter(r => r.status === activeTab.value)
})

const calendarDays = computed(() => {
  const year = calendarYear.value
  const month = calendarMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const resDates = new Map()
  reservations.forEach(r => {
    const key = r.date
    if (!resDates.has(key)) resDates.set(key, [])
    resDates.get(key).push(r)
  })

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      dayNum: d,
      dateStr,
      hasReservation: resDates.has(dateStr),
      isToday: dateStr === todayStr()
    })
  }
  return cells
})

const selectedDateReservations = computed(() => {
  if (!selectedCalendarDate.value) return []
  return reservations.filter(r => r.date === selectedCalendarDate.value)
})

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const calendarDateClass = (day) => {
  if (day.dateStr === selectedCalendarDate.value) return 'bg-primary-500 text-white'
  if (day.isToday) return 'bg-primary-50 text-primary-600 font-semibold'
  return 'hover:bg-neutral-50 text-ink'
}

const statusBadgeClass = (status) => ({
  confirmed: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  completed: 'bg-primary-50 text-primary-600',
  cancelled: 'bg-neutral-100 text-cocoa'
}[status] || '')

const selectDate = (dateStr) => {
  selectedCalendarDate.value = selectedCalendarDate.value === dateStr ? '' : dateStr
}

const prevMonth = () => {
  if (calendarMonth.value === 0) { calendarMonth.value = 11; calendarYear.value-- }
  else calendarMonth.value--
  selectedCalendarDate.value = ''
}

const nextMonth = () => {
  if (calendarMonth.value === 11) { calendarMonth.value = 0; calendarYear.value++ }
  else calendarMonth.value++
  selectedCalendarDate.value = ''
}

const goBack = () => router.back()
const goToSalon = () => router.push('/salon')

const viewNailStyle = (r) => {
  if (r.nailStyleId) router.push(`/nail-detail/${r.nailStyleId}`)
}

const chatWithArtist = (r) => {
  if (r.chatId) router.push(`/chat/${r.chatId}`)
}

const cancelReservation = (r) => {
  cancelTarget.value = r
  showCancelModal.value = true
}

const confirmCancel = () => {
  if (cancelTarget.value) {
    cancelTarget.value.status = 'cancelled'
    cancelTarget.value.statusText = '已取消'
  }
  showCancelModal.value = false
  cancelTarget.value = null
}

const rebook = (r) => {
  router.push(`/booking/${r.salonId}`)
}

const writeReview = (r) => {
  alert(`感谢您对 ${r.salonName} 的评价！`)
}

const removeReservation = (r) => {
  const idx = reservations.findIndex(rv => rv.id === r.id)
  if (idx > -1 && confirm('确定删除此预约记录吗？')) {
    reservations.splice(idx, 1)
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
