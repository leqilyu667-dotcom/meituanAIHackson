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
          <p class="eyebrow">SETTINGS</p>
          <h1 class="text-[22px] font-medium leading-[30px] text-ink">设置</h1>
        </div>
      </div>
    </header>

    <main class="px-5 pt-2">
      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">个人信息</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-cocoa">头像</span>
            <div class="grid h-10 w-10 place-items-center rounded-full bg-primary-100 text-primary-600 font-medium">Q</div>
          </div>
          <div class="flex items-center justify-between border-t border-divider py-2">
            <span class="text-sm text-cocoa">昵称</span>
            <span class="text-sm text-ink">小亲亲</span>
          </div>
          <div class="flex items-center justify-between border-t border-divider py-2">
            <span class="text-sm text-cocoa">手机号</span>
            <span class="text-sm text-ink">138****8888</span>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">通知设置</h3>
        <div class="space-y-3">
          <div v-for="item in notificationSettings" :key="item.key" class="flex items-center justify-between py-2" :class="{ 'border-t border-divider': item.key !== 'newStyle' }">
            <div>
              <span class="text-sm text-ink">{{ item.label }}</span>
              <p class="mt-0.5 text-xs text-cocoa/60">{{ item.desc }}</p>
            </div>
            <button
              @click="item.enabled = !item.enabled"
              class="relative h-7 w-12 rounded-full transition-colors"
              :class="item.enabled ? 'bg-primary-500' : 'bg-neutral-200'"
            >
              <span
                class="absolute top-1 grid h-5 w-5 rounded-full bg-white shadow transition-transform"
                :class="item.enabled ? 'left-6' : 'left-1'"
              ></span>
            </button>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">通用</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-cocoa">清除缓存</span>
            <span class="text-sm text-cocoa">128MB</span>
          </div>
          <div class="flex items-center justify-between border-t border-divider py-2">
            <span class="text-sm text-cocoa">当前版本</span>
            <span class="text-sm text-cocoa">v1.0.0</span>
          </div>
          <div class="flex items-center justify-between border-t border-divider py-2">
            <span class="text-sm text-cocoa">语言</span>
            <span class="text-sm text-ink">简体中文</span>
          </div>
        </div>
      </div>

      <button @click="logout" class="mt-6 w-full rounded-2xl bg-white py-4 text-sm font-medium text-error shadow-soft">
        退出登录
      </button>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const notificationSettings = ref([
  { key: 'newStyle', label: '新款推荐', desc: '当有新款美甲设计时通知', enabled: true },
  { key: 'booking', label: '预约提醒', desc: '预约时间前2小时提醒', enabled: true },
  { key: 'promo', label: '活动通知', desc: '优惠活动和店铺促销', enabled: false },
  { key: 'chat', label: '消息提醒', desc: '收到店铺消息时通知', enabled: true }
])

const goBack = () => router.back()

const logout = () => {
  if (confirm('确定退出登录吗？')) {
    router.push('/profile')
  }
}
</script>
