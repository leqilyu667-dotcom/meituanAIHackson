<template>
  <div class="min-h-screen bg-neutral-50 pb-20">
    <header class="bg-gradient-to-br from-primary-400 to-primary-600 pt-8 pb-20 px-4">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {{ userData.avatar }}
        </div>
        <div class="text-white">
          <h1 class="text-xl font-bold">{{ userData.name }}</h1>
          <p class="text-sm text-white/80 mt-1">精致生活，从美甲开始</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{{ userData.tryonCount }}</div>
          <div class="text-xs text-white/80 mt-1">试戴记录</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{{ userData.recordCount }}</div>
          <div class="text-xs text-white/80 mt-1">实际做过</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{{ userData.favoriteCount }}</div>
          <div class="text-xs text-white/80 mt-1">收藏</div>
        </div>
      </div>
    </header>

    <main class="px-4 -mt-12">
      <div class="card mb-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-medium text-neutral-800">我的试戴</h3>
          <button class="text-sm text-primary-500 flex items-center gap-1">
            全部
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div 
            v-for="item in userData.tryonHistory" 
            :key="item.id"
            class="relative cursor-pointer"
          >
            <img :src="item.image" alt="" class="w-full aspect-square object-cover rounded-xl"/>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-medium text-neutral-800">实际做过</h3>
          <button class="text-sm text-primary-500 flex items-center gap-1">
            全部
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div 
            v-for="item in userData.actualWorks" 
            :key="item.id"
            class="relative cursor-pointer"
          >
            <img :src="item.image" alt="" class="w-full aspect-square object-cover rounded-xl"/>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-medium text-neutral-800">我的收藏</h3>
          <button class="text-sm text-primary-500 flex items-center gap-1">
            全部
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div 
            v-for="item in userData.favorites" 
            :key="item.id"
            class="relative cursor-pointer"
          >
            <img :src="item.image" alt="" class="w-full aspect-square object-cover rounded-xl"/>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="space-y-4">
          <button class="w-full flex items-center gap-3 py-3 hover:bg-neutral-50 rounded-xl px-2 transition-colors">
            <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-500">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7.5 19.5a2.121 2.121 0 0 1-3-3z"/>
              </svg>
            </div>
            <span class="text-neutral-800">我的订单</span>
            <svg class="w-5 h-5 text-neutral-300 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <button class="w-full flex items-center gap-3 py-3 hover:bg-neutral-50 rounded-xl px-2 transition-colors">
            <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-500">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span class="text-neutral-800">我的优惠券</span>
            <svg class="w-5 h-5 text-neutral-300 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <button class="w-full flex items-center gap-3 py-3 hover:bg-neutral-50 rounded-xl px-2 transition-colors">
            <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-500">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <span class="text-neutral-800">设置</span>
            <svg class="w-5 h-5 text-neutral-300 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <button class="w-full flex items-center gap-3 py-3 hover:bg-neutral-50 rounded-xl px-2 transition-colors">
            <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-500">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 15s1.5-2 4-2 4 2 4 2"/>
                <circle cx="9" cy="9" r="1"/>
                <circle cx="15" cy="9" r="1"/>
              </svg>
            </div>
            <span class="text-neutral-800">关于我们</span>
            <svg class="w-5 h-5 text-neutral-300 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { userData } from '../data/mockData'
</script>
