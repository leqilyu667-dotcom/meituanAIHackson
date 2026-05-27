<template>
  <div v-if="isMerchantRoute" class="flex min-h-screen bg-cream">
    <Sidebar />
    <div class="ml-56 flex-1">
      <TopBar />
      <main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
  <div v-else class="min-h-screen">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <nav-bar />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Sidebar from './components/merchant/Sidebar.vue'
import TopBar from './components/merchant/TopBar.vue'

const route = useRoute()
const isMerchantRoute = computed(() => route.path.startsWith('/merchant'))
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
