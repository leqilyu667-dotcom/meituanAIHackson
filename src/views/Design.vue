<template>
  <div class="min-h-screen bg-neutral-50 pb-20">
    <header class="bg-white shadow-soft sticky top-0 z-40">
      <div class="px-4 py-4 flex items-center justify-between">
        <button @click="goBack" class="w-8 h-8 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"/>
            <path d="m12 19-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="text-base font-semibold text-neutral-800">美甲设计</h1>
        <button @click="saveDesign" class="text-sm text-primary-500">保存</button>
      </div>
    </header>

    <main class="px-4 pt-4">
      <div class="relative rounded-2xl overflow-hidden bg-white shadow-card mb-6">
        <div class="aspect-square relative bg-neutral-100 flex items-center justify-center">
          <div class="relative">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <g v-for="(finger, index) in fingers" :key="index">
                <ellipse 
                  :cx="finger.x" 
                  :cy="finger.y" 
                  :rx="finger.width" 
                  :ry="finger.height" 
                  :fill="selectedColor"
                  :transform="`rotate(${finger.rotation}, ${finger.x}, ${finger.y})`"
                />
              </g>
            </svg>
            <div v-if="selectedPattern" class="absolute inset-0 flex items-center justify-center">
              <div :class="['text-4xl opacity-50', getPatternIcon()]">{{ getPatternIcon() }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <h3 class="text-sm font-medium text-neutral-600 mb-3">选择甲型</h3>
        <div class="flex gap-3 overflow-x-auto scrollbar-hide">
          <button 
            v-for="shape in nailShapes" 
            :key="shape.id"
            @click="selectedShape = shape"
            class="flex-shrink-0 w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-300"
            :class="selectedShape.id === shape.id ? 'bg-primary-500 text-white' : 'bg-white shadow-soft text-neutral-600'"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path :d="getShapePath(shape.image)"/>
            </svg>
            <span class="text-xs mt-1">{{ shape.name }}</span>
          </button>
        </div>
      </div>

      <div class="mb-4">
        <h3 class="text-sm font-medium text-neutral-600 mb-3">选择颜色</h3>
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="color in colors" 
            :key="color"
            @click="selectedColor = color"
            class="w-10 h-10 rounded-full transition-all duration-300 ring-2 ring-offset-2"
            :class="selectedColor === color ? 'ring-primary-500 scale-110' : 'ring-transparent hover:scale-105'"
            :style="{ backgroundColor: color }"
          ></button>
        </div>
      </div>

      <div class="mb-4">
        <h3 class="text-sm font-medium text-neutral-600 mb-3">添加图案</h3>
        <div class="grid grid-cols-3 gap-3">
          <button 
            v-for="pattern in patterns" 
            :key="pattern.id"
            @click="selectPattern(pattern)"
            class="p-3 bg-white shadow-soft rounded-xl text-center transition-all duration-300"
            :class="selectedPattern?.id === pattern.id ? 'ring-2 ring-primary-500 bg-primary-50' : ''"
          >
            <span class="text-2xl">{{ getPatternEmoji(pattern.type) }}</span>
            <p class="text-xs text-neutral-600 mt-2">{{ pattern.name }}</p>
          </button>
        </div>
      </div>

      <div class="mb-4">
        <h3 class="text-sm font-medium text-neutral-600 mb-3">调整参数</h3>
        <div class="bg-white rounded-xl p-4 shadow-soft">
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-neutral-600">甲型大小</span>
              <span class="text-primary-500">{{ nailSize }}%</span>
            </div>
            <input 
              type="range" 
              v-model="nailSize" 
              min="50" 
              max="150" 
              class="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-primary-500"
            />
          </div>
          <div>
            <div class="flex justify-between text-sm mb-2">
              <span class="text-neutral-600">图案密度</span>
              <span class="text-primary-500">{{ patternDensity }}%</span>
            </div>
            <input 
              type="range" 
              v-model="patternDensity" 
              min="20" 
              max="100" 
              class="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-primary-500"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button @click="resetDesign" class="flex-1 btn-secondary">
          <svg class="w-5 h-5 inline-block mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          重置
        </button>
        <button @click="previewDesign" class="flex-1 btn-primary">
          <svg class="w-5 h-5 inline-block mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"/>
            <path d="M15.536 8.464a5 5 0 0 1 0 7.072m2.828-9.9a9 9 0 0 1 0 12.728"/>
          </svg>
          预览试戴
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { nailShapes, colors, patterns } from '../data/mockData'

const router = useRouter()

const selectedShape = ref(nailShapes[0])
const selectedColor = ref('#FFB6C1')
const selectedPattern = ref(null)
const nailSize = ref(100)
const patternDensity = ref(50)

const fingers = [
  { x: 80, y: 60, width: 12, height: 25, rotation: -30 },
  { x: 100, y: 55, width: 12, height: 28, rotation: -15 },
  { x: 120, y: 58, width: 12, height: 26, rotation: 0 },
  { x: 140, y: 65, width: 12, height: 24, rotation: 15 },
  { x: 155, y: 80, width: 12, height: 22, rotation: 30 }
]

const getShapePath = (shape) => {
  const paths = {
    'round': 'M12 4a8 8 0 0 0-8 8 8 8 0 0 0 8 8 8 8 0 0 0 8-8 8 8 0 0 0-8-8z',
    'squoval': 'M4 8h16v8H4z',
    'square': 'M4 6h16v12H4z',
    'almond': 'M12 2C8 2 4 6 4 12s4 10 8 10 8-4 8-10-4-10-8-10z',
    'oval': 'M6 4v16c0 2 2 4 6 4s6-2 6-4V4c0-2-2-4-6-4s-6 2-6 4z',
    'stiletto': 'M12 2l-4 20h8L12 2z'
  }
  return paths[shape] || paths['round']
}

const getPatternEmoji = (type) => {
  const emojis = {
    'stripe': '▦',
    'dot': '◉',
    'flower': '❀',
    'geometric': '◇',
    'glitter': '✨',
    'gradient': '◐'
  }
  return emojis[type] || '●'
}

const getPatternIcon = () => {
  if (!selectedPattern.value) return ''
  return getPatternEmoji(selectedPattern.value.type)
}

const selectPattern = (pattern) => {
  if (selectedPattern.value?.id === pattern.id) {
    selectedPattern.value = null
  } else {
    selectedPattern.value = pattern
  }
}

const goBack = () => {
  router.back()
}

const saveDesign = () => {
  alert('设计保存成功！')
}

const resetDesign = () => {
  selectedShape.value = nailShapes[0]
  selectedColor.value = '#FFB6C1'
  selectedPattern.value = null
  nailSize.value = 100
  patternDensity.value = 50
}

const previewDesign = () => {
  router.push('/tryon')
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
