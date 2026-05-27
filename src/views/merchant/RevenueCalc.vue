<template>
  <div class="p-8">
    <div class="mb-6">
      <p class="eyebrow">OPERATIONS ASSISTANT</p>
      <h1 class="mt-1 text-2xl font-semibold text-ink">营收计算器</h1>
      <p class="mt-2 text-sm text-cocoa">快速核算收款金额，支持多项目叠加与支付方式拆分</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-5">
      <!-- 服务项目 -->
      <div class="lg:col-span-3">
        <section class="card p-6">
          <h2 class="mb-4 text-lg font-medium text-ink">服务项目</h2>

          <div v-if="!items.length" class="py-8 text-center text-cocoa">
            <p>暂无项目，点击下方按钮添加</p>
          </div>

          <div v-else class="space-y-3">
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
                    @input="recalc"
                  />
                </div>
                <div>
                  <label class="text-xs text-cocoa">数量</label>
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    min="1"
                    class="input-field mt-1 text-sm"
                    @input="recalc"
                  />
                </div>
                <div>
                  <label class="text-xs text-cocoa">折扣</label>
                  <div class="mt-1 flex gap-2">
                    <select
                      v-model="item.discountType"
                      class="input-field w-20 shrink-0 text-sm"
                      @change="recalc"
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
                      @input="recalc"
                    />
                  </div>
                </div>
              </div>

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

          <!-- 金额汇总 -->
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

          <!-- 支付方式拆分 -->
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
                  @input="recalc"
                />
              </div>
            </div>
          </div>

          <!-- 找零 -->
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
            确认收款
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
import { serviceItems } from '../../data/merchantMockData'

const items = ref([])
const paymentMethods = ref([
  { key: 'wechat', label: '微信', amount: null },
  { key: 'alipay', label: '支付宝', amount: null },
  { key: 'cash', label: '现金', amount: null },
  { key: 'card', label: '储值卡', amount: null }
])
const errorMsg = ref('')

const addItem = () => {
  items.value.push({
    serviceId: null,
    price: null,
    quantity: 1,
    discountType: 'amount',
    discount: 0
  })
}

const removeItem = (i) => {
  items.value.splice(i, 1)
}

const onServiceChange = (i) => {
  const item = items.value[i]
  const svc = serviceItems.find(s => s.id === item.serviceId)
  if (svc) item.price = svc.price
  recalc()
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
  return items.value.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 1)
  }, 0)
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

const recalc = () => {}

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
  items.value = []
  paymentMethods.value.forEach(m => m.amount = null)
  alert('收款成功！订单已入库。')
}
</script>
