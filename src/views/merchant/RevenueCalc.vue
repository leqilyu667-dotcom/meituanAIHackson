<template>
  <div class="p-8">
    <div class="mb-6">
      <p class="eyebrow">OPERATIONS ASSISTANT</p>
      <h1 class="mt-1 text-2xl font-semibold text-ink">营收计算器</h1>
      <p class="mt-2 text-sm text-cocoa">预约到店 → 服务结算 → 订单入库，打通完整订单信息</p>
    </div>

    <!-- 订单号 & 预约关联 -->
    <div class="card mb-6 p-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div>
            <p class="text-xs text-cocoa">订单号</p>
            <p class="text-lg font-semibold text-ink">{{ orderNo }}</p>
          </div>
          <div class="h-8 w-px bg-divider" />
          <div>
            <p class="text-xs text-cocoa">关联预约</p>
            <select
              v-model="linkedAppointmentId"
              class="mt-1 rounded-lg border border-divider bg-white px-3 py-1.5 text-sm text-ink outline-none focus:ring-1 focus:ring-primary-300"
              @change="onAppointmentChange"
            >
              <option :value="null">散客到店（无预约）</option>
              <option
                v-for="apt in availableAppointments"
                :key="apt.id"
                :value="apt.id"
              >
                #{{ apt.id }} {{ apt.customer }} · {{ apt.project }} · {{ apt.time }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="linkedCustomer" class="text-right">
          <p class="text-xs text-cocoa">客户</p>
          <p class="text-sm font-medium text-ink">{{ linkedCustomer }} · {{ linkedPhone }}</p>
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-5">
      <!-- 服务项目 -->
      <div class="lg:col-span-3">
        <section class="card p-6">
          <h2 class="mb-4 text-lg font-medium text-ink">服务项目</h2>

          <div v-if="!items.length" class="py-8 text-center text-cocoa">
            <p>暂无项目，点击下方按钮添加</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(item, i) in items"
              :key="i"
              class="rounded-2xl border border-divider bg-cream/30 p-4"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-ink">项目 {{ i + 1 }}</span>
                <button
                  @click="removeItem(i)"
                  class="text-xs text-cocoa transition hover:text-error"
                >
                  移除
                </button>
              </div>

              <!-- 价格/数量/折扣 -->
              <div class="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label class="text-xs text-cocoa">服务项目</label>
                  <select
                    v-model="item.serviceId"
                    class="input-field mt-1 text-sm"
                    @change="onServiceChange(i)"
                  >
                    <option :value="null" disabled>选择项目</option>
                    <option v-for="s in serviceItems" :key="s.id" :value="s.id">
                      {{ s.name }}（¥{{ s.price }}）
                    </option>
                  </select>
                </div>
                <div>
                  <label class="text-xs text-cocoa">单价（元）</label>
                  <input
                    v-model.number="item.price"
                    type="number"
                    min="0"
                    step="0.01"
                    class="input-field mt-1 text-sm"
                  />
                </div>
                <div>
                  <label class="text-xs text-cocoa">数量</label>
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    min="1"
                    class="input-field mt-1 text-sm"
                  />
                </div>
                <div>
                  <label class="text-xs text-cocoa">折扣</label>
                  <div class="mt-1 flex gap-2">
                    <select
                      v-model="item.discountType"
                      class="input-field w-20 shrink-0 text-sm"
                    >
                      <option value="amount">减额</option>
                      <option value="percent">打折</option>
                    </select>
                    <input
                      v-model.number="item.discount"
                      type="number"
                      min="0"
                      :max="item.discountType === 'percent' ? 100 : undefined"
                      step="0.01"
                      class="input-field flex-1 text-sm"
                    />
                  </div>
                </div>
              </div>

              <!-- 标签选择 -->
              <div class="mt-3 border-t border-divider pt-3">
                <p class="mb-2 text-xs font-medium text-cocoa">
                  款式标签 <span class="text-cocoa/50">（对齐全平台标签体系）</span>
                </p>
                <div class="grid gap-2 sm:grid-cols-3">
                  <div v-for="dim in tagDimensions" :key="dim.key">
                    <label class="text-xs text-cocoa">
                      {{ dim.name }}
                      <span v-if="dim.required" class="text-error">*</span>
                    </label>
                    <select
                      v-model="item.tags[dim.key]"
                      class="input-field mt-1 w-full text-sm"
                    >
                      <option value="">{{ dim.required ? '请选择' : '不限' }}</option>
                      <option
                        v-for="opt in labelSystem[dim.key]"
                        :key="opt"
                        :value="opt"
                      >
                        {{ opt }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- 小计 -->
              <div class="mt-3 flex items-center justify-between border-t border-divider pt-3">
                <span class="text-xs text-cocoa">小计</span>
                <span class="text-sm font-medium text-ink">¥{{ formatNum(itemSubtotal(item)) }}</span>
              </div>
            </div>
          </div>

          <button
            @click="addItem"
            class="mt-4 w-full rounded-[18px] border border-dashed border-divider py-3 text-sm text-cocoa transition hover:border-primary-300 hover:text-primary-600"
          >
            + 添加项目
          </button>
        </section>
      </div>

      <!-- 收款结算 -->
      <div class="lg:col-span-2">
        <section class="card p-6">
          <h2 class="mb-4 text-lg font-medium text-ink">收款结算</h2>

          <div class="rounded-2xl bg-cream/40 p-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-cocoa">应收总额</span>
              <span class="font-medium text-ink">¥{{ formatNum(totalReceivable) }}</span>
            </div>
            <div class="mt-2 flex items-center justify-between text-sm">
              <span class="text-cocoa">折扣减免</span>
              <span class="font-medium text-error">-¥{{ formatNum(totalDiscount) }}</span>
            </div>
            <div class="mt-2 flex items-center justify-between border-t border-divider pt-2">
              <span class="text-sm font-medium text-ink">实收金额</span>
              <span class="text-lg font-semibold text-ink">¥{{ formatNum(actualReceivable) }}</span>
            </div>
          </div>

          <div class="mt-5">
            <p class="mb-3 text-sm font-medium text-ink">支付方式拆分</p>
            <div class="space-y-3">
              <div
                v-for="method in paymentMethods"
                :key="method.key"
                class="flex items-center gap-3"
              >
                <span class="w-16 shrink-0 text-xs text-cocoa">{{ method.label }}</span>
                <input
                  v-model.number="method.amount"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-field flex-1 text-sm"
                />
              </div>
            </div>
          </div>

          <div class="mt-5 rounded-2xl bg-cream/40 p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-cocoa">已收金额</span>
              <span class="font-medium text-ink">¥{{ formatNum(totalPaid) }}</span>
            </div>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-sm text-cocoa">找零</span>
              <span
                class="font-semibold"
                :class="change >= 0 ? 'text-success' : 'text-error'"
              >
                ¥{{ formatNum(Math.abs(change)) }}
                <span v-if="change < 0" class="text-xs">（欠收）</span>
              </span>
            </div>
            <div class="mt-2 flex items-center justify-between border-t border-divider pt-2 text-xs text-cocoa">
              <span>客单价（{{ totalQuantity }}件）</span>
              <span>¥{{ formatNum(totalQuantity ? actualReceivable / totalQuantity : 0) }}</span>
            </div>
          </div>

          <button
            @click="settle"
            class="btn-primary mt-5 w-full rounded-[18px] py-2.5 text-sm font-medium"
          >
            确认收款 · 订单入库
          </button>
        </section>
      </div>
    </div>

    <!-- 校验弹窗 -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="errorMsg"
          class="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm"
          @click.self="errorMsg = ''"
        >
          <div class="mx-4 w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-card">
            <div class="border-b border-divider px-6 py-4">
              <h3 class="text-lg font-medium text-error">提示</h3>
            </div>
            <div class="px-6 py-4">
              <p class="text-sm text-cocoa">{{ errorMsg }}</p>
            </div>
            <div class="flex justify-end border-t border-divider px-6 py-4">
              <button
                @click="errorMsg = ''"
                class="rounded-[18px] bg-primary-500 px-6 py-2 text-sm font-medium text-white"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { serviceItems, appointments, labelSystem, labelDimensions } from '../../data/merchantMockData'

const tagDimensions = [
  { key: 'shape', name: '甲型', required: true },
  { key: 'tone', name: '色调', required: true },
  { key: 'style', name: '风格', required: true },
  { key: 'craft', name: '工艺', required: false },
  { key: 'decor', name: '装饰元素', required: false }
]

const items = ref([])
const linkedAppointmentId = ref(null)
const linkedCustomer = ref('')
const linkedPhone = ref('')
const paymentMethods = ref([
  { key: 'wechat', label: '微信', amount: null },
  { key: 'alipay', label: '支付宝', amount: null },
  { key: 'cash', label: '现金', amount: null },
  { key: 'card', label: '储值卡', amount: null }
])
const errorMsg = ref('')
const orderSeq = ref(1)

const availableAppointments = computed(() => {
  return appointments.filter(a => a.status === 'confirmed' || a.status === 'pending')
})

const orderNo = computed(() => {
  if (linkedAppointmentId.value) {
    return `ORD-APT${linkedAppointmentId.value}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
  }
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const seq = String(orderSeq.value).padStart(3, '0')
  return `ORD-${date}-${seq}`
})

const onAppointmentChange = () => {
  const apt = appointments.find(a => a.id === linkedAppointmentId.value)
  if (apt) {
    linkedCustomer.value = apt.customer
    linkedPhone.value = apt.phone
    // 自动带入预约项目
    const svc = serviceItems.find(s => s.name === apt.project)
    if (items.value.length === 0 || (items.value.length === 1 && !items.value[0].serviceId)) {
      items.value = [{
        serviceId: svc ? svc.id : null,
        price: svc ? svc.price : null,
        quantity: 1,
        discountType: 'amount',
        discount: 0,
        tags: { shape: '', tone: '', style: '', craft: '', decor: '' }
      }]
    }
  } else {
    linkedCustomer.value = ''
    linkedPhone.value = ''
  }
}

const emptyTags = () => ({ shape: '', tone: '', style: '', craft: '', decor: '' })

const addItem = () => {
  items.value.push({
    serviceId: null,
    price: null,
    quantity: 1,
    discountType: 'amount',
    discount: 0,
    tags: emptyTags()
  })
}

const removeItem = (i) => {
  items.value.splice(i, 1)
}

const onServiceChange = (i) => {
  const item = items.value[i]
  const svc = serviceItems.find(s => s.id === item.serviceId)
  if (svc) item.price = svc.price
}

const itemSubtotal = (item) => {
  const original = (item.price || 0) * (item.quantity || 1)
  const discount = item.discount || 0
  if (item.discountType === 'percent') {
    return original * (1 - discount / 100)
  }
  return original - discount
}

const totalReceivable = computed(() => {
  return items.value.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
})

const totalDiscount = computed(() => {
  return items.value.reduce((sum, item) => {
    const original = (item.price || 0) * (item.quantity || 1)
    return sum + original - itemSubtotal(item)
  }, 0)
})

const actualReceivable = computed(() => {
  return items.value.reduce((sum, item) => sum + itemSubtotal(item), 0)
})

const totalQuantity = computed(() => {
  return items.value.reduce((sum, item) => sum + (item.quantity || 1), 0)
})

const totalPaid = computed(() => {
  return paymentMethods.value.reduce((sum, m) => sum + (m.amount || 0), 0)
})

const change = computed(() => {
  return totalPaid.value - actualReceivable.value
})

const formatNum = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '0.00'
  return Number(n).toFixed(2)
}

const validate = () => {
  if (!items.value.length) return '请至少添加一个服务项目'
  for (let i = 0; i < items.value.length; i++) {
    const item = items.value[i]
    if (!item.serviceId) return `项目 ${i + 1}：请选择服务项目`
    if (item.price == null || item.price < 0) return `项目 ${i + 1}：请输入合法金额`
    if (item.quantity < 1 || !Number.isInteger(item.quantity)) return `项目 ${i + 1}：请输入合法数量`
    if (item.discount < 0) return `项目 ${i + 1}：折扣不能为负数`
    if (item.discountType === 'percent' && item.discount > 100) return `项目 ${i + 1}：折扣比例不能超过100%`
    if (item.discountType === 'amount' && item.discount > item.price * item.quantity) {
      return `项目 ${i + 1}：减免金额不能超过原价`
    }
    if (itemSubtotal(item) < 0) return `项目 ${i + 1}：小计金额不能为负数`
    // 标签校验：核心三维必填
    if (!item.tags.shape) return `项目 ${i + 1}：请选择甲型`
    if (!item.tags.tone) return `项目 ${i + 1}：请选择色调`
    if (!item.tags.style) return `项目 ${i + 1}：请选择风格`
  }
  for (const m of paymentMethods.value) {
    if (m.amount != null && m.amount < 0) return `${m.label}支付金额不能为负数`
  }
  return null
}

const settle = () => {
  const err = validate()
  if (err) {
    errorMsg.value = err
    return
  }
  errorMsg.value = ''
  // 更新预约状态
  if (linkedAppointmentId.value) {
    const apt = appointments.find(a => a.id === linkedAppointmentId.value)
    if (apt) apt.status = 'completed'
  }
  orderSeq.value++
  items.value = []
  linkedAppointmentId.value = null
  linkedCustomer.value = ''
  linkedPhone.value = ''
  paymentMethods.value.forEach(m => m.amount = null)
  alert(`收款成功！订单 ${orderNo.value} 已入库。`)
}
</script>
