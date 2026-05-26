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
          <p class="eyebrow">ABOUT</p>
          <h1 class="text-[22px] font-medium leading-[30px] text-ink">关于我们</h1>
        </div>
      </div>
    </header>

    <main class="px-5 pt-2">
      <div class="mb-6 text-center">
        <div class="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-4xl bg-gradient-to-br from-primary-400 to-primary-600 text-4xl font-bold text-white shadow-glow">
          N
        </div>
        <h2 class="text-2xl font-bold text-ink">NAILIA</h2>
        <p class="mt-1 text-sm text-cocoa">AI 美甲试戴 · 发现你的专属美甲</p>
        <p class="mt-1 text-xs text-placeholder">Version 1.0.0</p>
      </div>

      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">我们的使命</h3>
        <p class="text-sm leading-relaxed text-cocoa">
          NAILIA 致力于通过 AI 技术让每一位爱美人士都能轻松找到最适合自己的美甲款式。上传一张手部照片，即可实时预览上千款美甲效果，帮你做出最好的选择。
        </p>
      </div>

      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">核心功能</h3>
        <div class="space-y-3">
          <div v-for="feat in features" :key="feat.title" class="flex gap-3">
            <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-500">
              <span class="text-lg">{{ feat.icon }}</span>
            </div>
            <div>
              <h4 class="text-sm font-medium text-ink">{{ feat.title }}</h4>
              <p class="mt-0.5 text-xs text-cocoa">{{ feat.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">联系我们</h3>
        <div class="space-y-3 text-sm">
          <div class="flex items-center gap-3 text-cocoa">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>nailia@example.com</span>
          </div>
          <div class="flex items-center gap-3 text-cocoa">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>400-888-8888</span>
          </div>
        </div>
      </div>

      <div class="text-center space-y-3">
        <button @click="goToSettings" class="text-sm text-primary-600">隐私政策</button>
        <span class="text-divider mx-2">·</span>
        <button @click="goToSettings" class="text-sm text-primary-600">用户协议</button>
      </div>

      <p class="mt-6 text-center text-xs text-placeholder">
        &copy; 2024 NAILIA. All rights reserved.
      </p>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  { icon: '🤖', title: 'AI 智能试戴', desc: '上传手部照片，实时识别甲床并渲染美甲效果' },
  { icon: '🎨', title: '海量款式', desc: '上千款精心设计的美甲款式，每日更新' },
  { icon: '🏪', title: '店铺发现', desc: '发现附近优质美甲店，一键预约' },
  { icon: '💬', title: '即时沟通', desc: '与美甲师实时沟通，确认款式和细节' }
]

const goBack = () => router.back()
const goToSettings = () => router.push('/settings')
</script>
