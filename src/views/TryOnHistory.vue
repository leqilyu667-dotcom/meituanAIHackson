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
          <p class="eyebrow">MY TRY-ONS</p>
          <h1 class="text-[22px] font-medium leading-[30px] text-ink">试戴记录</h1>
        </div>
      </div>
    </header>

    <main class="px-5 pt-4">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-sm text-cocoa">共 {{ records.length }} 条记录</p>
      </div>

      <div v-if="records.length === 0" class="py-20 text-center">
        <div class="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-primary-50">
          <svg class="h-10 w-10 text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <p class="text-cocoa">暂无试戴记录</p>
        <button @click="goToTryOn" class="mt-3 text-sm text-primary-600">去试试 AI 试戴</button>
      </div>

      <div v-else class="grid grid-cols-2 gap-3">
        <div
          v-for="(item, i) in records"
          :key="i"
          class="cursor-pointer overflow-hidden rounded-3xl bg-white shadow-soft transition active:scale-[0.97]"
          @click="viewImage(item.image)"
        >
          <img :src="item.image" alt="" class="aspect-[4/4.8] w-full object-cover" />
          <div class="p-3">
            <p class="text-sm font-medium text-ink">方案 {{ i + 1 }}</p>
            <p class="mt-0.5 text-xs text-cocoa/70">{{ item.date || '最近试戴' }}</p>
          </div>
        </div>
      </div>
    </main>

    <transition name="fade">
      <div v-if="previewImage" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-8" @click="previewImage = null">
        <img :src="previewImage" alt="" class="max-h-[70vh] max-w-full rounded-3xl" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userData } from '../data/mockData'

const router = useRouter()
const previewImage = ref(null)

const records = ref([
  ...userData.tryonHistory.map(item => ({ ...item, date: '5月25日' })),
])

const goBack = () => router.back()
const goToTryOn = () => router.push('/tryon')
const viewImage = (img) => { previewImage.value = img }
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
