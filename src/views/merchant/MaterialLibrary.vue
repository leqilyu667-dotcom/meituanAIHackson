<template>
  <div class="p-8">
    <div class="mb-6">
      <p class="eyebrow">OPERATIONS ASSISTANT</p>
      <h1 class="mt-1 text-2xl font-semibold text-ink">素材库</h1>
      <p class="mt-2 text-sm text-cocoa">历史生成素材管理，支持收藏、删除、一键上架至货架</p>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <svg class="h-6 w-6 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-30"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      </svg>
    </div>

    <div v-else-if="materials.length === 0" class="flex flex-col items-center justify-center py-20">
      <p class="text-4xl">📦</p>
      <p class="mt-4 text-sm text-cocoa">暂无素材</p>
      <p class="mt-1 text-xs text-cocoa/60">在「爆款素材生成」中生成的素材将自动存入素材库</p>
    </div>

    <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="item in materials"
        :key="item.id"
        class="group relative flex flex-col overflow-hidden rounded-2xl border border-divider bg-white transition hover:shadow-soft"
      >
        <!-- Cover image -->
        <div class="aspect-square w-full shrink-0 overflow-hidden bg-cream/30">
          <img v-if="item.imageUrl" :src="item.imageUrl" class="h-full w-full object-cover transition group-hover:scale-105" />
          <div v-else class="flex h-full w-full items-center justify-center text-4xl">💅</div>
        </div>

        <!-- Info -->
        <div class="flex flex-1 flex-col p-3">
          <p class="text-sm font-medium text-ink truncate">{{ item.name || '未命名素材' }}</p>
          <div class="mt-1.5">
            <TagBadge :tags="item.tags" />
          </div>
          <p class="mt-1 text-[11px] text-cocoa">{{ item.createdAt }}</p>

          <!-- Actions -->
          <div class="mt-3 flex gap-2">
            <button
              @click="publishToShelf(item)"
              :disabled="item.publishing"
              class="flex-1 rounded-[14px] bg-success py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {{ item.publishing ? '上架中...' : '一键上架' }}
            </button>
            <button
              @click="toggleFav(item)"
              class="rounded-[14px] border px-2 py-1.5 text-xs transition"
              :class="item.isFavorite ? 'border-primary-300 bg-primary-50 text-primary-600' : 'border-divider text-cocoa hover:bg-cream'"
              title="收藏"
            >
              {{ item.isFavorite ? '★' : '☆' }}
            </button>
            <button
              @click="confirmDelete(item)"
              class="rounded-[14px] border border-error/20 px-2 py-1.5 text-xs text-cocoa transition hover:text-error"
              title="删除"
            >
              🗑
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TagBadge from '../../components/merchant/TagBadge.vue'
import { fetchLibrary, toggleFavorite, deleteLibraryMaterial, createDesign } from '../../data/api'

const materials = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const data = await fetchLibrary()
    materials.value = data.materials
  } catch (err) {
    console.error('Failed to load library:', err.message)
  } finally {
    loading.value = false
  }
}

async function publishToShelf(item) {
  item.publishing = true
  try {
    await createDesign({
      name: item.name || '素材库款式',
      tags: item.tags,
      coverImage: item.imageUrl,
      operator: 'library'
    })
    alert('已上架至货架管理')
  } catch (err) {
    alert('上架失败: ' + (err.response?.data?.message || err.message))
  } finally {
    item.publishing = false
  }
}

async function toggleFav(item) {
  try {
    const result = await toggleFavorite(item.id)
    item.isFavorite = result.isFavorite
  } catch (err) {
    console.error('Failed to toggle favorite:', err.message)
  }
}

async function confirmDelete(item) {
  if (!confirm('确定删除这个素材？')) return
  try {
    await deleteLibraryMaterial(item.id)
    materials.value = materials.value.filter(m => m.id !== item.id)
  } catch (err) {
    console.error('Failed to delete:', err.message)
  }
}

onMounted(load)
</script>
