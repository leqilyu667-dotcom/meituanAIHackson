<template>
  <div class="phone-shell pb-36">
    <!-- ═══ Header ═══ -->
    <header class="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      <div class="flex items-center gap-3 px-5 py-5">
        <button @click="goBack" class="grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink shadow-soft">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
        </button>
        <div class="min-w-0">
          <p class="eyebrow">ARTIST DETAIL</p>
          <h1 class="truncate text-[22px] font-medium leading-[30px] text-ink">{{ artist?.name }}</h1>
        </div>
        <button @click="toggleFavorite" class="ml-auto grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-soft" :class="isFavorited ? 'text-error' : 'text-cocoa'">
          <svg width="20" height="20" viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    </header>

    <main class="px-5 pt-2">
      <!-- ═══ 美甲师信息卡 ═══ -->
      <div class="card mb-4">
        <div class="flex items-center gap-4">
          <!-- 头像 -->
          <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-100 text-2xl font-semibold text-primary-600 shadow-soft">
            {{ artist?.avatar }}
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="text-xl font-medium text-ink">{{ artist?.name }}</h2>
            <div class="mt-1 flex items-center gap-2">
              <span class="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600">{{ artist?.role }}</span>
              <span class="text-xs text-cocoa">从业{{ artist?.years }}年</span>
            </div>
            <p class="mt-2 text-xs text-cocoa">
              <svg class="inline-block h-3.5 w-3.5 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {{ artistSalon?.name }} · {{ artistSalon?.location }}
            </p>
          </div>
        </div>

        <!-- 服务评分 -->
        <div class="mt-4 border-t border-divider pt-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-6">
              <div class="text-center">
                <p class="text-lg font-semibold text-primary-600">{{ artist?.rating_attitude }}</p>
                <p class="text-xs text-cocoa">态度</p>
              </div>
              <div class="text-center">
                <p class="text-lg font-semibold text-primary-600">{{ artist?.rating_effect }}</p>
                <p class="text-xs text-cocoa">效果</p>
              </div>
              <div class="text-center">
                <p class="text-lg font-semibold text-primary-600">{{ artist?.rating_appearance }}</p>
                <p class="text-xs text-cocoa">形象</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-lg font-semibold text-ink">{{ formatCount(artist?.service_count) }}</p>
              <p class="text-xs text-cocoa">服务人次</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ 基础信息 ═══ -->
      <div class="card mb-4">
        <h3 class="mb-3 font-medium text-ink">擅长项目</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in specialtyTags"
            :key="tag"
            class="rounded-full bg-primary-50 px-3 py-1.5 text-sm text-primary-700"
          >{{ tag }}</span>
        </div>
        <div class="mt-4 border-t border-divider pt-4">
          <h3 class="mb-2 font-medium text-ink">从业简介</h3>
          <p class="text-sm leading-relaxed text-cocoa">{{ artist?.intro }}</p>
        </div>
      </div>

      <!-- ═══ 作品展示 ═══ -->
      <div class="mb-4">
        <h3 class="mb-3 font-medium text-ink">作品展示</h3>
        <div class="space-y-3">
          <div
            v-for="(work, index) in works"
            :key="index"
            class="overflow-hidden rounded-2xl bg-white shadow-soft"
          >
            <!-- 左右对比：参考图 | 实际效果 -->
            <div class="flex">
              <!-- 左：顾客参考图 -->
              <div class="relative flex-1 border-r border-divider/50">
                <div class="aspect-square overflow-hidden">
                  <img
                    :src="work.customer_ref_url"
                    alt="顾客参考图"
                    class="h-full w-full object-cover cursor-pointer"
                    @click="goToTryOn(work)"
                  />
                </div>
                <div class="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-medium text-cocoa backdrop-blur">
                  参考图
                </div>
              </div>
              <!-- 右：实际效果 -->
              <div class="relative flex-1">
                <div class="aspect-square overflow-hidden">
                  <img
                    :src="work.actual_result_url"
                    alt="实际效果"
                    class="h-full w-full object-cover cursor-pointer"
                    @click="goToTryOn(work)"
                  />
                </div>
                <div class="absolute left-2 top-2 rounded-full bg-primary-500/85 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                  实际效果
                </div>
                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-2 pt-6">
                  <p class="text-xs font-medium text-white">{{ work.title }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ 网友点评 ═══ -->
      <div class="card mb-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-ink">网友点评</h3>
          <span class="text-xs text-cocoa">{{ reviews?.length || 0 }}条评价</span>
        </div>
        <div
          v-for="review in reviews"
          :key="review.id"
          class="border-b border-divider py-4 first:pt-0 last:border-0 last:pb-0"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-600">
              {{ review.name.charAt(0) }}
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-medium text-ink">{{ review.name }}</h4>
                <span class="text-xs text-cocoa">{{ review.date }}</span>
              </div>
              <div class="mt-0.5 flex items-center gap-1">
                <svg v-for="i in 5" :key="i" class="h-3 w-3" viewBox="0 0 24 24" :fill="i <= review.rating ? '#D9A15B' : '#ECE7E2'">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
          </div>
          <p class="mt-2 text-sm leading-relaxed text-cocoa">{{ review.content }}</p>
        </div>
        <div v-if="!reviews?.length" class="py-8 text-center text-sm text-cocoa">暂无评价</div>
      </div>

      <div class="h-8"></div>
    </main>

    <!-- ═══ 底部预约栏 ═══ -->
    <div class="fixed bottom-28 left-0 right-0 z-40 px-4">
      <div class="mx-auto flex max-w-md gap-3 rounded-3xl border border-divider bg-white/95 px-4 py-3 shadow-card backdrop-blur">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-base font-semibold text-primary-600">
            {{ artist?.avatar }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-ink truncate">{{ artist?.name }}</p>
            <p class="text-xs text-cocoa">{{ artist?.role }}</p>
          </div>
        </div>
        <button @click="goToBooking" class="btn-primary shrink-0">一键预约</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const artistId = parseInt(route.params.id)
const artist = ref(null)
const artistSalon = ref(null)
const works = ref([])
const reviews = ref([])
const isFavorited = ref(false)

onMounted(async () => {
  try {
    const res = await axios.get(`/v1/artists/${artistId}`)
    const data = res.data?.data
    if (data) {
      artist.value = data.artist
      artistSalon.value = data.salon
      works.value = data.works || []
      reviews.value = data.reviews || []
    }
  } catch (err) {
    console.error('Failed to load artist:', err)
  }
})

const specialtyTags = computed(() => {
  if (!artist.value?.specialty) return []
  return artist.value.specialty.split('·').map(s => s.trim()).filter(Boolean)
})

const formatCount = (count) => {
  if (!count) return '0'
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return String(count)
}

const goBack = () => router.back()

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
}

const goToTryOn = (work) => {
  router.push(`/tryon?workTitle=${encodeURIComponent(work.title)}&workImage=${encodeURIComponent(work.actual_result_url)}`)
}

const goToBooking = () => {
  if (artistSalon.value) {
    router.push(`/booking/${artistSalon.value.id}?artistId=${artistId}`)
  } else {
    router.push(`/booking/1?artistId=${artistId}`)
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
