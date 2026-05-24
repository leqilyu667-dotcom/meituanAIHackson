<template>
  <div class="phone-shell pb-28">
    <header class="px-5 pb-4 pt-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">AI TRY-ON</p>
          <h1 class="mt-1 text-[22px] font-medium leading-[30px] text-ink">实时美甲试戴</h1>
        </div>
        <button @click="uploadImage" class="rounded-[18px] bg-white px-4 py-2 text-sm font-medium text-primary-600 shadow-soft">换照片</button>
      </div>
    </header>

    <main class="px-5">
      <section class="overflow-hidden rounded-4xl bg-ink shadow-card">
        <div class="relative aspect-[4/5]">
          <img :src="handImage" alt="手部照片" class="h-full w-full object-cover opacity-95" />
          <div class="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent"></div>

          <div class="absolute left-[34%] top-[22%] flex gap-2">
            <span
              v-for="finger in previewNails"
              :key="finger.id"
              class="block rounded-full border border-white/30 shadow-[0_8px_16px_rgba(0,0,0,0.22)]"
              :style="{
                width: `${finger.width}px`,
                height: `${finger.height}px`,
                background: nailFill,
                transform: `rotate(${finger.rotation}deg)`
              }"
            ></span>
          </div>

          <div v-if="isDetecting" class="absolute inset-0 grid place-items-center bg-ink/58 backdrop-blur-sm">
            <div class="text-center text-white">
              <div class="mx-auto mb-3 h-12 w-12 rounded-full border-4 border-primary-300 border-t-transparent animate-spin"></div>
              <p class="font-medium">Analyzing Your Nails...</p>
              <p class="mt-1 text-sm text-white/70">正在匹配肤色、甲型和光泽</p>
            </div>
          </div>

          <div class="absolute bottom-4 left-4 right-4 rounded-3xl bg-white/88 p-4 backdrop-blur">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-xs font-normal text-primary-600">当前方案</p>
                <h2 class="mt-1 text-lg font-medium text-ink">{{ selectedStyle.name }} · {{ selectedShape.name }}</h2>
                <p class="text-sm text-cocoa/70">匹配度 {{ matchScore }}%，适合自然光和通勤场景。</p>
              </div>
              <button @click="startDetection" class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-500 text-white shadow-glow" aria-label="AI识别">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-5 grid grid-cols-3 gap-3">
        <div class="rounded-3xl bg-white p-3 text-center shadow-soft">
          <p class="text-xl font-medium text-ink">3s</p>
          <p class="mt-1 text-xs text-cocoa/70">生成预览</p>
        </div>
        <div class="rounded-3xl bg-white p-3 text-center shadow-soft">
          <p class="text-xl font-medium text-ink">96%</p>
          <p class="mt-1 text-xs text-cocoa/70">甲床识别</p>
        </div>
        <div class="rounded-3xl bg-white p-3 text-center shadow-soft">
          <p class="text-xl font-medium text-ink">12</p>
          <p class="mt-1 text-xs text-cocoa/70">色系推荐</p>
        </div>
      </section>

      <section class="mt-6">
        <h3 class="section-title mb-3">甲型</h3>
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            v-for="shape in nailShapes"
            :key="shape.id"
            @click="selectedShape = shape"
            class="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition"
            :class="selectedShape.id === shape.id ? 'bg-primary-600 text-white' : 'bg-white text-cocoa shadow-soft'"
          >
            {{ shape.name }}
          </button>
        </div>
      </section>

      <section class="mt-5">
        <h3 class="section-title mb-3">显白色卡</h3>
        <div class="grid grid-cols-10 gap-2">
          <button
            v-for="color in colors"
            :key="color"
            @click="selectedColor = color"
            class="h-8 rounded-full border border-white shadow-soft ring-2 ring-offset-2 transition"
            :class="selectedColor === color ? 'ring-primary-500 scale-110' : 'ring-transparent'"
            :style="{ backgroundColor: color }"
            :aria-label="`选择颜色 ${color}`"
          ></button>
        </div>
      </section>

      <section class="mt-6">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="section-title">选择款式</h3>
          <button @click="saveDesign" class="text-sm font-medium text-primary-600">保存方案</button>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            v-for="style in nailStyles"
            :key="style.id"
            @click="selectedStyle = style"
            class="relative w-28 shrink-0 overflow-hidden rounded-3xl bg-white text-left shadow-soft"
            :class="selectedStyle.id === style.id ? 'ring-2 ring-primary-500' : ''"
          >
            <img :src="style.image" alt="" class="aspect-square w-full object-cover" />
            <div class="p-2">
              <p class="truncate text-xs font-medium text-ink">{{ style.name }}</p>
              <p class="truncate text-[11px] text-cocoa/70">{{ style.description }}</p>
            </div>
          </button>
        </div>
      </section>

      <div class="mt-6 flex gap-3">
        <button @click="uploadImage" class="flex-1 btn-secondary">重选照片</button>
        <button @click="saveDesign" class="flex-1 btn-primary">保存/分享</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { nailStyles, nailShapes, colors } from '../data/mockData'

const handImage = ref('https://neeko-copilot.bytedance.net/api/text2image?prompt=elegant%20woman%20hand%20natural%20pose%20soft%20studio%20light%20clean%20cream%20background&image_size=portrait_4_5')
const isDetecting = ref(false)
const selectedShape = ref(nailShapes[3])
const selectedColor = ref('#FFB6C1')
const selectedStyle = ref(nailStyles[0])

const previewNails = [
  { id: 1, width: 13, height: 32, rotation: -18 },
  { id: 2, width: 14, height: 36, rotation: -8 },
  { id: 3, width: 14, height: 35, rotation: 2 },
  { id: 4, width: 13, height: 31, rotation: 12 }
]

const nailFill = computed(() => `linear-gradient(160deg, #fff8 0%, ${selectedColor.value} 38%, #ffffff44 100%)`)
const matchScore = computed(() => selectedStyle.value.isNew ? 98 : 94)

const uploadImage = () => {
  handImage.value = 'https://neeko-copilot.bytedance.net/api/text2image?prompt=elegant%20woman%20hand%20natural%20pose%20soft%20studio%20light%20clean%20cream%20background&image_size=portrait_4_5'
}

const startDetection = () => {
  isDetecting.value = true
  setTimeout(() => {
    isDetecting.value = false
  }, 1200)
}

const saveDesign = () => {
  alert('方案已保存')
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
