<template>
  <div class="p-8">
    <div class="mb-6">
      <p class="eyebrow">OPERATIONS ASSISTANT</p>
      <h1 class="mt-1 text-2xl font-semibold text-ink">订单记录</h1>
      <p class="mt-2 text-sm text-cocoa">
        查看已完成订单详情<span v-if="totalRevenue" class="ml-2 text-primary-600 font-medium">累计营收 ¥{{ totalRevenue.toLocaleString() }}</span>
      </p>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <svg class="h-6 w-6 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-30"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      </svg>
    </div>

    <div v-else-if="orders.length === 0" class="flex flex-col items-center justify-center py-20">
      <p class="text-4xl">📋</p>
      <p class="mt-4 text-sm text-cocoa">暂无订单记录</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="order in orders"
        :key="order.id"
        class="card overflow-hidden transition hover:shadow-soft"
      >
        <div class="flex items-center gap-4 p-4">
          <!-- Work image thumbnail -->
          <div class="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream/30">
            <img v-if="order.workImage" :src="order.workImage" class="h-full w-full object-cover" />
            <div v-else class="flex h-full w-full items-center justify-center text-2xl">💅</div>
          </div>

          <!-- Order info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-3">
              <p class="text-sm font-medium text-ink">{{ order.orderNo }}</p>
              <span class="text-xs text-cocoa">{{ order.createdAt }}</span>
            </div>
            <div class="mt-1 flex items-center gap-2 text-xs text-cocoa">
              <span v-if="order.customerName">{{ order.customerName }}</span>
              <span v-if="order.serviceItem">· {{ order.serviceItem }}</span>
              <span>· ¥{{ order.actualReceivable }}</span>
            </div>
            <div class="mt-1">
              <TagBadge v-if="order.tags?.shape" :tags="order.tags" />
            </div>
          </div>

          <!-- Price + expand + delete -->
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-lg font-semibold text-ink">¥{{ order.actualReceivable }}</span>
            <button
              @click="toggleDetail(order.id)"
              class="rounded-full border border-divider bg-white p-1.5 text-cocoa transition hover:text-primary-600"
            >
              <svg class="h-4 w-4 transition-transform" :class="expandedId === order.id ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            <button
              @click="(e) => { e.stopPropagation(); e.preventDefault(); confirmDelete(order) }"
              class="rounded-full border border-error/20 bg-white p-1.5 text-cocoa transition hover:text-error hover:border-error/40"
              title="删除订单"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Expanded detail -->
        <div v-if="expandedId === order.id" class="border-t border-divider bg-cream/20 px-5 py-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <!-- Left: Work image full -->
            <div class="rounded-2xl bg-white p-4 shadow-soft">
              <p class="mb-2 text-xs font-medium text-cocoa">成品图</p>
              <div class="aspect-square w-full overflow-hidden rounded-xl bg-cream/30">
                <img v-if="order.workImage" :src="order.workImage" class="h-full w-full object-cover" />
                <div v-else class="flex h-full w-full items-center justify-center text-5xl">💅</div>
              </div>
            </div>

            <!-- Right: Order info + Payment + Tags + Nail artist -->
            <div class="space-y-3">
              <!-- Order info with nail artist inline -->
              <div class="rounded-2xl bg-white p-4 shadow-soft">
                <p class="mb-2 text-xs font-medium text-cocoa">订单信息</p>
                <dl class="space-y-1.5 text-sm">
                  <div class="flex justify-between"><span class="text-cocoa">订单号</span><span class="text-ink font-medium">{{ order.orderNo }}</span></div>
                  <div class="flex justify-between"><span class="text-cocoa">客户</span><span class="text-ink">{{ order.customerName || '-' }}</span></div>
                  <div class="flex justify-between"><span class="text-cocoa">电话</span><span class="text-ink">{{ order.customerPhone || '-' }}</span></div>
                  <div class="flex justify-between"><span class="text-cocoa">服务项目</span><span class="text-ink">{{ order.serviceItem || '-' }}</span></div>
                  <!-- Nail artist inline edit -->
                  <div class="flex justify-between items-center">
                    <span class="text-cocoa shrink-0 mr-2">美甲师</span>
                    <div class="flex items-center gap-1.5">
                      <select v-model="editForms[order.id].nailArtist" class="input-field text-xs py-0.5 w-full" style="max-width:120px">
                        <option value="">未分配</option>
                        <option v-for="a in nailArtists" :key="a" :value="a">{{ a }}</option>
                      </select>
                      <button
                        @click="saveNailArtist(order)"
                        :disabled="editForms[order.id].savingNail"
                        class="shrink-0 rounded-lg bg-primary-500 px-2 py-1 text-[10px] font-medium text-white transition hover:opacity-90 disabled:opacity-40"
                      >保存</button>
                    </div>
                  </div>
                  <div class="flex justify-between"><span class="text-cocoa">数量</span><span class="text-ink">×{{ order.quantity }}</span></div>
                  <div class="flex justify-between"><span class="text-cocoa">单价</span><span class="text-ink">¥{{ order.price }}</span></div>
                  <div class="flex justify-between"><span class="text-cocoa">小计</span><span class="text-ink">¥{{ order.subtotal }}</span></div>
                </dl>
              </div>

              <!-- Payment info -->
              <div class="rounded-2xl bg-white p-4 shadow-soft">
                <p class="mb-2 text-xs font-medium text-cocoa">收款信息</p>
                <dl class="space-y-1.5 text-sm">
                  <div class="flex justify-between"><span class="text-cocoa">应收</span><span class="text-ink">¥{{ order.totalReceivable }}</span></div>
                  <div class="flex justify-between"><span class="text-cocoa">折扣</span><span class="text-error">-¥{{ order.totalDiscount }}</span></div>
                  <div class="flex justify-between"><span class="text-cocoa">现金</span><span class="text-ink">¥{{ order.paymentCash }}</span></div>
                  <div class="flex justify-between"><span class="text-cocoa">储值卡</span><span class="text-ink">¥{{ order.paymentCard }}</span></div>
                  <div class="flex justify-between border-t border-divider pt-1.5"><span class="text-cocoa">实收</span><span class="text-lg font-semibold text-ink">¥{{ order.actualReceivable }}</span></div>
                </dl>
              </div>

              <!-- Tag management -->
              <div class="rounded-2xl bg-white p-4 shadow-soft">
                <p class="mb-2 text-xs font-medium text-cocoa">标签管理</p>
                <div class="grid grid-cols-2 gap-2 mb-3">
                  <div v-for="dim in tagDims" :key="dim.key">
                    <label class="text-[10px] text-cocoa">{{ dim.name }}</label>
                    <select v-model="editForms[order.id].tags[dim.key]" class="input-field mt-0.5 w-full text-xs">
                      <option value="">{{ dim.required ? '必选' : '不限' }}</option>
                      <option v-for="opt in labelOpts[dim.key]" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>
                <button
                  @click="saveTags(order)"
                  :disabled="editForms[order.id].savingTags"
                  class="w-full rounded-[14px] bg-primary-500 py-2 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-40"
                >保存标签</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import TagBadge from '../../components/merchant/TagBadge.vue'
import { fetchOrders, updateOrder, deleteOrder as deleteOrderApi } from '../../data/api'
import { labelSystem, nailArtists } from '../../data/merchantMockData'

const tagDims = [
  { key: 'shape', name: '甲型', required: true },
  { key: 'tone', name: '色调', required: true },
  { key: 'style', name: '风格', required: true },
  { key: 'craft', name: '工艺', required: false },
  { key: 'decor', name: '装饰', required: false }
]
const labelOpts = labelSystem
const editForms = reactive({})

const orders = ref([])
const totalRevenue = ref(0)
const loading = ref(true)
const expandedId = ref(null)

function initEditForm(order) {
  if (!editForms[order.id]) {
    editForms[order.id] = {
      nailArtist: order.nailArtist || '',
      tags: { ...order.tags },
      savingNail: false,
      savingTags: false
    }
  }
}

function toggleDetail(id) {
  const wasExpanded = expandedId.value === id
  expandedId.value = wasExpanded ? null : id
  if (!wasExpanded) {
    const order = orders.value.find(o => o.id === id)
    if (order) initEditForm(order)
  }
}

async function saveNailArtist(order) {
  const form = editForms[order.id]
  form.savingNail = true
  try {
    await updateOrder(order.id, { nailArtist: form.nailArtist })
    order.nailArtist = form.nailArtist
  } catch (err) {
    console.error('Failed to save nail artist:', err.message)
  } finally {
    form.savingNail = false
  }
}

async function saveTags(order) {
  const form = editForms[order.id]
  form.savingTags = true
  try {
    await updateOrder(order.id, { tags: form.tags })
    order.tags = { ...form.tags }
  } catch (err) {
    console.error('Failed to save tags:', err.message)
  } finally {
    form.savingTags = false
  }
}

async function confirmDelete(order) {
  if (!confirm(`确定删除订单 ${order.orderNo}？此操作不可恢复。`)) return
  try {
    await deleteOrderApi(order.id)
    orders.value = orders.value.filter(o => o.id !== order.id)
    totalRevenue.value = orders.value.reduce((s, o) => s + (o.actualReceivable || 0), 0)
  } catch (err) {
    console.error('Failed to delete order:', err.message)
  }
}

onMounted(async () => {
  try {
    const data = await fetchOrders()
    orders.value = data.orders
    totalRevenue.value = data.totalRevenue
  } catch (err) {
    console.error('Failed to load orders:', err.message)
  } finally {
    loading.value = false
  }
})
</script>
