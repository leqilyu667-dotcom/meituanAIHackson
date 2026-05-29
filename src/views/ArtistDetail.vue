<template>
  <div class="phone-shell pb-40">
    <header class="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      <div class="flex items-center gap-3 px-5 py-5">
        <button @click="$router.back()" class="grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink shadow-soft">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
        </button>
        <div class="min-w-0">
          <p class="eyebrow">NAIL ARTIST</p>
          <h1 class="truncate text-[22px] font-medium leading-[30px] text-ink">{{ artist?.name }}</h1>
        </div>
        <button @click="liked = !liked" class="ml-auto grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-soft" :class="liked ? 'text-error' : 'text-cocoa'">
          <svg width="20" height="20" viewBox="0 0 24 24" :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    </header>

    <main v-if="artist" class="px-5 pt-2 space-y-4">

      <!-- 个人资料卡 -->
      <div class="relative overflow-hidden rounded-3xl bg-white shadow-card">
        <!-- 背景渐变条 -->
        <div class="h-24 w-full" :style="{ background: artist.avatarBg }"></div>
        <!-- 头像 -->
        <div class="flex flex-col items-center px-5 pb-5">
          <div
            class="-mt-12 flex h-24 w-24 items-center justify-center rounded-full text-4xl font-semibold text-white shadow-card ring-4 ring-white"
            :style="{ background: artist.avatarBg }"
          >
            {{ artist.name.charAt(0) }}
          </div>
          <h2 class="mt-3 text-[20px] font-medium text-ink">{{ artist.name }}</h2>
          <span class="mt-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
            {{ artist.title }}
          </span>
          <!-- 评分行 -->
          <div class="mt-3 flex items-center gap-4 text-sm">
            <div class="flex items-center gap-1.5">
              <div class="flex items-center gap-0.5">
                <svg v-for="i in 5" :key="i" class="h-3.5 w-3.5" viewBox="0 0 24 24" :fill="i <= Math.round(artist.rating) ? '#D9A15B' : '#ECE7E2'">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span class="font-semibold text-ink">{{ artist.rating }}</span>
            </div>
            <span class="text-cocoa">·</span>
            <span class="text-cocoa">{{ artist.reviews }} 条好评</span>
            <span class="text-cocoa">·</span>
            <span class="text-cocoa">{{ artist.salonName }}</span>
          </div>
          <!-- 专长标签 -->
          <div class="mt-3 flex flex-wrap justify-center gap-1.5">
            <span
              v-for="tag in artist.tags"
              :key="tag"
              class="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
            >{{ tag }}</span>
          </div>
        </div>
      </div>

      <!-- 简介 -->
      <div class="card">
        <h3 class="mb-2 font-medium text-ink">关于 {{ artist.name }}</h3>
        <p class="text-sm leading-relaxed text-cocoa">{{ artist.bio }}</p>
        <!-- 资质证书 -->
        <div class="mt-3 flex flex-col gap-1.5 border-t border-divider pt-3">
          <div v-for="cert in artist.certificates" :key="cert" class="flex items-center gap-2 text-sm text-cocoa">
            <svg class="h-4 w-4 shrink-0 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
            </svg>
            {{ cert }}
          </div>
        </div>
      </div>

      <!-- 作品集 -->
      <div>
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-[17px] font-medium text-ink">作品集</h3>
          <span class="text-xs text-cocoa">{{ artist.works.length }} 件作品</span>
        </div>
        <div class="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          <div
            v-for="(work, i) in artist.works"
            :key="i"
            @click="previewWork = work"
            class="relative h-[140px] w-[112px] shrink-0 cursor-pointer overflow-hidden rounded-3xl shadow-soft"
          >
            <img :src="work" alt="" class="h-full w-full object-cover transition active:scale-95"/>
            <!-- AI 试戴悬浮按钮 -->
            <button
              @click.stop="goTryOnWork(work)"
              class="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1.5 text-[11px] font-semibold text-primary-600 shadow backdrop-blur-sm transition active:scale-95"
            >
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              试戴
            </button>
          </div>
        </div>
      </div>

      <!-- 可约时间 -->
      <div class="card flex items-start gap-3">
        <div class="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary-100">
          <svg class="h-5 w-5 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div>
          <h3 class="font-medium text-ink">可约时间</h3>
          <p class="mt-1 text-sm text-cocoa">{{ artist.availability }}</p>
        </div>
      </div>

      <!-- 用户评价 -->
      <div>
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-[17px] font-medium text-ink">用户评价</h3>
          <div class="flex items-center gap-1">
            <svg class="h-4 w-4 text-warning" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span class="text-sm font-semibold text-ink">{{ artist.rating }}</span>
            <span class="text-xs text-cocoa">（{{ artist.reviews }} 条）</span>
          </div>
        </div>
        <div class="space-y-3">
          <div
            v-for="review in artist.reviewList"
            :key="review.name"
            class="rounded-3xl bg-white p-4 shadow-soft"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600">
                {{ review.name.charAt(0) }}
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-ink">{{ review.name }}</span>
                  <span class="text-xs text-cocoa">{{ review.date }}</span>
                </div>
                <div class="mt-0.5 flex items-center gap-0.5">
                  <svg v-for="i in 5" :key="i" class="h-3 w-3" viewBox="0 0 24 24" :fill="i <= review.rating ? '#D9A15B' : '#ECE7E2'">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
            </div>
            <p class="mt-2.5 text-sm leading-relaxed text-cocoa">{{ review.content }}</p>
            <!-- 效果图对比 -->
            <div v-if="review.styleImage && review.resultImage" class="mt-3 flex items-stretch gap-2">
              <div class="flex-1">
                <div class="overflow-hidden rounded-2xl">
                  <img :src="review.styleImage" alt="" class="aspect-square w-full object-cover"/>
                </div>
                <p class="mt-1.5 text-center text-[10px] font-medium text-cocoa">参考款式</p>
              </div>
              <div class="flex flex-col items-center justify-center gap-1 px-1">
                <svg class="h-4 w-4 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M13 5l7 7-7 7"/>
                </svg>
              </div>
              <div class="flex-1">
                <div class="overflow-hidden rounded-2xl ring-2 ring-primary-300">
                  <img :src="review.resultImage" alt="" class="aspect-square w-full object-cover"/>
                </div>
                <p class="mt-1.5 text-center text-[10px] font-medium text-primary-600">实际效果 ✓</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="h-8"></div>
    </main>

    <!-- 底部 CTA -->
    <div class="fixed bottom-[90px] left-0 right-0 z-40 px-4">
      <div class="mx-auto flex max-w-md gap-3">
        <button
          @click="goToTryOn"
          class="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-divider bg-white text-sm font-medium text-primary-600 shadow-soft transition active:scale-95"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          AI 试戴
        </button>
        <button
          @click="goToBooking"
          class="flex h-14 flex-[2] items-center justify-center gap-2 rounded-2xl bg-primary-500 text-[15px] font-medium text-white shadow-glow transition active:scale-95"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          立即预约
        </button>
      </div>
    </div>

    <!-- 作品预览 -->
    <transition name="fade">
      <div
        v-if="previewWork"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-8"
        @click="previewWork = null"
      >
        <img :src="previewWork" alt="" class="max-h-[70vh] max-w-full rounded-3xl shadow-card"/>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { nailArtists } from '../data/mockData'

const router = useRouter()
const route = useRoute()

const artistId = parseInt(route.params.id)
const artist = computed(() => nailArtists.find(a => a.id === artistId))
const liked = ref(false)
const previewWork = ref(null)

const goToTryOn = () => router.push('/tryon')
const goTryOnWork = (imageUrl) => router.push(`/tryon?imageUrl=${encodeURIComponent(imageUrl)}`)
const goToBooking = () => router.push(`/booking/${artist.value?.salonId ?? 1}`)
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
