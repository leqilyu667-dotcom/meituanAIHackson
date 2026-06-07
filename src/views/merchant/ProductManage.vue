<template>
  <div class="p-8">
    <div class="mb-6">
      <p class="eyebrow">OPERATIONS ASSISTANT</p>
      <h1 class="mt-1 text-2xl font-semibold text-ink">货架管理</h1>
      <p class="mt-2 text-sm text-cocoa">管理门店美甲款式上下架、排序与信息编辑</p>
    </div>

    <!-- Status filter tabs + actions -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-2 rounded-2xl bg-cream/50 p-1">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          @click="switchFilter(tab.value)"
          class="rounded-xl px-4 py-2 text-sm font-medium transition-all"
          :class="statusFilter === tab.value
            ? 'bg-white text-ink shadow-sm'
            : 'text-cocoa hover:text-ink'"
        >
          {{ tab.label }}
          <span class="ml-1 text-xs" :class="statusFilter === tab.value ? 'text-primary-600' : 'text-cocoa/60'">
            {{ tab.count }}
          </span>
        </button>
      </div>

      <div class="flex items-center gap-3">
        <!-- Normal mode buttons -->
        <template v-if="!managing && !sorting">
          <button
            @click="enterManage"
            class="rounded-[18px] border border-divider bg-white px-5 py-2 text-sm text-cocoa transition hover:border-primary-300 hover:text-ink"
          >
            管理
          </button>
          <button
            @click="enterSort"
            class="rounded-[18px] border border-divider bg-white px-5 py-2 text-sm text-cocoa transition hover:border-primary-300 hover:text-ink"
            :disabled="designs.length < 2"
          >
            排序
          </button>
          <button
            @click="openCreate"
            class="rounded-[18px] bg-primary-500 px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            + 新增
          </button>
          <button
            @click="showPreview = true"
            class="rounded-[18px] border border-primary-300 bg-primary-50 px-5 py-2 text-sm font-medium text-primary-600 transition hover:bg-primary-100"
          >
            预览店铺
          </button>
        </template>

        <!-- Sort mode bar -->
        <template v-if="sorting">
          <p class="text-sm text-cocoa">拖拽卡片调整顺序，完成后保存</p>
          <button
            @click="cancelSort"
            class="rounded-[18px] border border-divider bg-white px-4 py-2 text-sm text-cocoa transition hover:bg-cream"
          >
            取消
          </button>
          <button
            @click="saveSort"
            :disabled="sortSaving"
            class="rounded-[18px] bg-primary-500 px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {{ sortSaving ? '保存中...' : '保存排序' }}
          </button>
        </template>

        <!-- Manage mode buttons -->
        <template v-if="managing">
          <button
            @click="selectAll"
            class="rounded-[18px] border border-divider bg-white px-4 py-2 text-sm text-cocoa transition hover:bg-cream"
          >
            {{ selectedIds.size === designs.length ? '取消全选' : '全选' }}
          </button>
          <button
            @click="batchList"
            :disabled="selectedIds.size === 0 || batchOperating"
            class="rounded-[18px] bg-success px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
          >
            批量上架
          </button>
          <button
            @click="batchUnlist"
            :disabled="selectedIds.size === 0 || batchOperating"
            class="rounded-[18px] border border-error/40 bg-white px-4 py-2 text-sm text-error transition hover:bg-error/5 disabled:opacity-40"
          >
            批量下架
          </button>
          <button
            @click="exitManage"
            class="rounded-[18px] bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            完成
          </button>
        </template>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="h-6 w-6 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-30"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <span class="ml-3 text-sm text-cocoa">加载中...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="designs.length === 0" class="flex flex-col items-center justify-center py-20">
      <p class="text-4xl">💅</p>
      <p class="mt-4 text-sm text-cocoa">暂无相关款式</p>
      <p class="mt-1 text-xs text-cocoa/60">通过「爆款素材生成」创建新款式，或点击「+ 新增」手工创建</p>
    </div>

    <!-- Design card grid -->
    <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="(item, idx) in designs"
        :key="item.id"
        :draggable="sorting"
        @dragstart="onDragStart($event, idx)"
        @dragover.prevent="onDragOver($event, idx)"
        @dragend="onDragEnd"
        @drop.prevent="onDrop(idx)"
        class="group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all"
        :class="[
          managing && selectedIds.has(item.id) ? 'border-primary-400 ring-2 ring-primary-200' : 'border-divider',
          sorting ? 'cursor-grab active:cursor-grabbing' : 'hover:shadow-soft',
          sorting && dragOverIdx === idx ? 'scale-[1.02] border-primary-300 shadow-soft' : ''
        ]"
      >
        <!-- Drag handle in sort mode -->
        <div v-if="sorting" class="absolute left-3 top-3 z-10">
          <span class="grid h-6 w-6 place-items-center rounded-full bg-black/25 text-white text-xs font-bold select-none">
            ⋮⋮
          </span>
        </div>

        <!-- Checkbox in manage mode -->
        <div v-if="managing" class="absolute left-3 top-3 z-10">
          <button
            @click="toggleSelect(item.id)"
            class="grid h-6 w-6 place-items-center rounded-full border-2 transition"
            :class="selectedIds.has(item.id)
              ? 'border-primary-500 bg-primary-500 text-white'
              : 'border-white/60 bg-black/20 text-transparent hover:border-primary-300'"
          >
            <span v-if="selectedIds.has(item.id)" class="text-xs font-bold">✓</span>
          </button>
        </div>

        <!-- Cover image -->
        <div class="aspect-[4/3] w-full shrink-0 overflow-hidden bg-cream/30">
          <img
            v-if="item.coverImage"
            :src="item.coverImage"
            class="h-full w-full object-cover transition group-hover:scale-105"
          />
          <div v-else class="flex h-full w-full items-center justify-center">
            <p class="text-3xl">💅</p>
          </div>
        </div>

        <!-- Info -->
        <div class="flex flex-1 flex-col p-4">
          <div class="flex items-start justify-between gap-2">
            <router-link
              :to="`/merchant/product-manage/${item.id}`"
              class="text-sm font-medium text-ink truncate hover:text-primary-600 transition"
            >
              {{ item.name }}
            </router-link>
            <span
              class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="item.isListed ? 'bg-success/10 text-success' : 'bg-cream text-cocoa'"
            >
              {{ item.isListed ? '已上架' : '已下架' }}
            </span>
          </div>

          <div class="mt-2 min-h-[22px]">
            <TagBadge :tags="item.tags" />
          </div>

          <p v-if="item.price" class="mt-1.5 text-xs text-cocoa">¥{{ item.price }}</p>
          <p class="mt-1 text-[11px] text-cocoa/70">
            累计销量 <span class="font-medium text-ink">{{ item.sales?.totalOrders || 0 }}</span> 单
            · <span class="font-medium text-ink">¥{{ (item.sales?.totalRevenue || 0).toLocaleString() }}</span>
          </p>

          <!-- Action buttons (normal mode only) -->
          <div v-if="!managing && !sorting" class="mt-3 flex gap-2">
            <button
              @click="toggleSingleStatus(item)"
              class="flex-1 rounded-[14px] border py-1.5 text-xs font-medium transition"
              :class="item.isListed
                ? 'border-error/30 text-error hover:bg-error/5'
                : 'border-success/40 text-success hover:bg-success/5'"
            >
              {{ item.isListed ? '下架' : '上架' }}
            </button>
            <button
              @click="openEdit(item)"
              class="flex-1 rounded-[14px] border border-divider py-1.5 text-xs text-cocoa transition hover:bg-cream"
            >
              编辑
            </button>
            <button
              @click="togglePin(item)"
              class="rounded-[14px] border px-2 py-1.5 text-xs transition"
              :class="item.isPinned
                ? 'border-primary-300 bg-primary-50 text-primary-600'
                : 'border-divider text-cocoa hover:bg-cream'"
              :title="item.isPinned ? '取消置顶' : '置顶'"
            >
              📌
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-1.5">
      <button @click="changePage(1)" :disabled="currentPage <= 1"
        class="rounded-lg px-2.5 py-1.5 text-xs text-cocoa transition hover:bg-cream disabled:opacity-30">首页</button>
      <button @click="changePage(currentPage - 1)" :disabled="currentPage <= 1"
        class="rounded-lg px-2.5 py-1.5 text-xs text-cocoa transition hover:bg-cream disabled:opacity-30">‹</button>
      <button v-for="p in visiblePages" :key="p" @click="changePage(p)"
        class="h-7 w-7 rounded-lg text-xs font-medium transition"
        :class="p === currentPage ? 'bg-primary-500 text-white shadow-sm' : 'text-cocoa hover:bg-cream'">{{ p }}</button>
      <button @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages"
        class="rounded-lg px-2.5 py-1.5 text-xs text-cocoa transition hover:bg-cream disabled:opacity-30">›</button>
      <button @click="changePage(totalPages)" :disabled="currentPage >= totalPages"
        class="rounded-lg px-2.5 py-1.5 text-xs text-cocoa transition hover:bg-cream disabled:opacity-30">末页</button>
    </div>

    <!-- Store Preview Modal — matches C端 SalonDetail page exactly -->
    <Teleport to="body">
      <div
        v-if="showPreview"
        class="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto"
        @click.self="showPreview = false"
      >
        <div class="my-6 flex flex-col items-center">
          <!-- Toolbar -->
          <div class="mb-3 flex w-full max-w-md items-center justify-between px-2">
            <span class="text-sm font-medium text-white/80">店铺预览 — 顾客端店铺详情</span>
            <button
              @click="showPreview = false"
              class="rounded-full bg-white/20 px-4 py-1.5 text-sm text-white transition hover:bg-white/30"
            >
              关闭预览
            </button>
          </div>

          <!-- Phone frame: matches SalonDetail page exactly -->
          <div class="phone-shell overflow-hidden rounded-[44px] border-[6px] border-zinc-800 shadow-2xl bg-cream" style="width: 390px; min-height: 760px; max-height: 80vh; overflow-y: auto;">
            <!-- Header: exact SalonDetail sticky header -->
            <header class="sticky top-0 z-40 bg-cream/95 backdrop-blur">
              <div class="px-5 py-5 flex items-center gap-3">
                <div class="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-soft text-ink">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="eyebrow">SALON DETAIL</p>
                  <h1 class="truncate text-[22px] font-medium leading-[30px] text-ink">Nail Moment 美甲坊</h1>
                </div>
              </div>
            </header>

            <main class="px-5 pt-2">
              <!-- Hero image: exact SalonDetail hero -->
              <div class="relative rounded-3xl overflow-hidden mb-4 shadow-soft">
                <div class="h-48 w-full bg-gradient-to-br from-primary-100 via-cream to-primary-50 flex items-center justify-center">
                  <p class="text-6xl">💅</p>
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div class="absolute bottom-4 left-4 right-4">
                  <h2 class="text-[22px] font-medium leading-[30px] text-white">Nail Moment 美甲坊</h2>
                  <div class="flex items-center gap-4 mt-2 text-white/80 text-sm">
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4 text-warning" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      4.9
                    </span>
                    <span>328条评价</span>
                    <span>朝阳区 · 1.2km</span>
                  </div>
                </div>
              </div>

              <!-- Designs section: matches SalonDetail "服务项目" card pattern -->
              <div class="card mb-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-medium text-ink">热门款式</h3>
                  <span class="text-sm font-medium text-primary-600">查看全部</span>
                </div>

                <div v-if="listedDesigns.length === 0" class="flex flex-col items-center justify-center py-12">
                  <p class="text-3xl">💅</p>
                  <p class="mt-2 text-sm text-cocoa">暂无已上架款式</p>
                </div>

                <!-- 3-column grid: exact SalonDetail service grid -->
                <div v-else class="grid grid-cols-3 gap-3 mt-3">
                  <div
                    v-for="item in listedDesigns"
                    :key="item.id"
                    class="text-center p-3 bg-primary-50 rounded-3xl transition"
                  >
                    <div class="w-12 h-12 mx-auto mb-2 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                      <img
                        v-if="item.coverImage"
                        :src="item.coverImage"
                        class="w-full h-full object-cover"
                      />
                      <span v-else class="text-lg">💅</span>
                    </div>
                    <h4 class="text-sm font-medium text-ink truncate">{{ item.name }}</h4>
                    <p class="text-xs text-primary-600 mt-1">¥{{ item.price || '--' }}</p>
                  </div>
                </div>
              </div>

              <!-- Store description: exact SalonDetail card -->
              <div class="card mb-4">
                <h3 class="font-medium text-ink mb-3">店铺介绍</h3>
                <p class="text-sm text-cocoa leading-relaxed">
                  Nail Moment 美甲坊是一家专业的美甲沙龙，提供高品质的美甲服务。我们拥有经验丰富的美甲师团队，使用进口环保材料，为您打造最时尚、最精致的美甲作品。
                </p>
                <div class="mt-4 pt-4 border-t border-divider">
                  <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2 text-cocoa">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      朝阳区
                    </div>
                    <div class="flex items-center gap-2 text-cocoa">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      10:00-22:00
                    </div>
                  </div>
                </div>
              </div>

              <!-- Design works: matches SalonDetail "美甲师作品" horizontal scroll -->
              <div v-if="listedDesigns.length > 0" class="card mb-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-medium text-ink">美甲作品</h3>
                  <span class="text-sm font-medium text-primary-600">查看更多</span>
                </div>
                <div class="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                  <div
                    v-for="item in listedDesigns"
                    :key="'w-'+item.id"
                    class="w-20 flex-shrink-0"
                  >
                    <div class="w-full aspect-square object-cover rounded-[20px] bg-cream/50 flex items-center justify-center overflow-hidden">
                      <img
                        v-if="item.coverImage"
                        :src="item.coverImage"
                        class="w-full h-full object-cover"
                      />
                      <span v-else class="text-2xl">💅</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reviews: exact SalonDetail review card -->
              <div class="card mb-4">
                <h3 class="font-medium text-ink mb-3">用户评价</h3>
                <div v-for="(rv, idx) in mockReviews" :key="idx" class="pb-4 border-b border-divider last:border-0 last:pb-0" :class="idx > 0 ? 'pt-4' : ''">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                      {{ rv.name.charAt(0) }}
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-ink">{{ rv.name }}</h4>
                      <div class="flex items-center gap-1 mt-0.5">
                        <svg v-for="i in 5" :key="i" class="w-3 h-3" viewBox="0 0 24 24" :fill="i <= rv.rating ? '#D9A15B' : '#ECE7E2'">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    </div>
                    <span class="text-xs text-cocoa ml-auto">{{ rv.date }}</span>
                  </div>
                  <p class="text-sm text-cocoa mt-2">{{ rv.content }}</p>
                </div>
              </div>

              <div class="h-20" />
            </main>

            <!-- Bottom bar: exact SalonDetail fixed bottom bar -->
            <div class="sticky bottom-0 left-0 right-0 z-40 px-4 pb-4 bg-cream/95 backdrop-blur">
              <div class="rounded-3xl border border-divider bg-white/95 px-4 py-3 shadow-card backdrop-blur flex gap-3">
                <div class="flex-1">
                  <div class="text-xs text-cocoa">已上架款式</div>
                  <div class="text-lg font-medium text-primary-600">{{ listedDesigns.length }} 款</div>
                </div>
                <button class="btn-primary">立即预约</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Edit / Create Modal (shared) -->
    <Teleport to="body">
      <div
        v-if="formModal.visible"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
        @click.self="closeForm"
      >
        <div class="w-full max-w-xl rounded-3xl bg-white p-6 shadow-card max-h-[90vh] overflow-y-auto">
          <h2 class="text-lg font-semibold text-ink">{{ formModal.isCreate ? '新增款式' : '编辑款式' }}</h2>

          <div class="mt-4 space-y-4">
            <!-- Name -->
            <div>
              <label class="text-xs font-medium text-cocoa">款式名称</label>
              <input v-model="formModal.form.name" class="input-field mt-1 w-full text-sm" />
            </div>

            <!-- Price + Description row -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-medium text-cocoa">售价 (¥)</label>
                <input v-model.number="formModal.form.price" type="number" min="0" step="0.01"
                  class="input-field mt-1 w-full text-sm" />
              </div>
              <div>
                <label class="text-xs font-medium text-cocoa">展示描述</label>
                <textarea v-model="formModal.form.description" rows="2"
                  class="input-field mt-1 w-full text-sm resize-none" />
              </div>
            </div>

            <!-- Tags -->
            <div>
              <label class="text-xs font-medium text-cocoa">
                标签组合 <span class="text-error">* 甲型、色调、风格必选</span>
              </label>
              <div class="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div v-for="dim in tagDimensions" :key="dim.key">
                  <label class="text-[11px] text-cocoa">
                    {{ dim.name }}<span v-if="dim.required" class="text-error">*</span>
                  </label>
                  <select v-model="formModal.form.tags[dim.key]" class="input-field mt-1 w-full text-sm">
                    <option value="">{{ dim.required ? '请选择' : '不限' }}</option>
                    <option v-for="opt in labelOptions[dim.key]" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Cover image selection (create mode only) -->
            <div v-if="formModal.isCreate">
              <label class="text-xs font-medium text-cocoa">封面图片（可选）</label>
              <!-- Source tabs -->
              <div class="mt-2 flex items-center gap-1 rounded-xl bg-cream/50 p-1 w-fit">
                <button
                  @click="coverTab = 'upload'"
                  class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                  :class="coverTab === 'upload' ? 'bg-white text-ink shadow-sm' : 'text-cocoa hover:text-ink'"
                >本地上传</button>
                <button
                  @click="coverTab = 'xhs'"
                  class="relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                  :class="coverTab === 'xhs' ? 'bg-white text-ink shadow-sm' : 'text-cocoa hover:text-ink'"
                >
                  爆款素材库
                  <span v-if="coverTab !== 'xhs'" class="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center">
                    <span class="absolute h-3.5 w-3.5 rounded-full bg-primary-400 animate-ping opacity-40" />
                    <span class="relative h-2 w-2 rounded-full bg-primary-500" />
                  </span>
                </button>
              </div>

              <!-- Tab: XHS Material Library -->
              <div v-if="coverTab === 'xhs'">
                <p class="mt-2 text-[11px] text-cocoa/60">点击素材填入封面 + 自动预填标签</p>
                <div v-if="xhsLoading" class="mt-2 rounded-xl bg-cream/30 py-8 text-center text-sm text-cocoa">
                  加载素材库中...
                </div>
                <div v-else-if="xhsMaterials.length === 0" class="mt-2 rounded-xl bg-cream/30 py-6 text-center text-xs text-cocoa/60">
                  暂无可用的已审核素材
                </div>
                <div v-else class="mt-2 flex gap-3 overflow-x-auto pb-2">
                  <button
                    v-for="mat in xhsMaterials"
                    :key="mat.id"
                    @click="selectXhsMaterial(mat)"
                    class="shrink-0 w-36 overflow-hidden rounded-2xl border text-left transition-all"
                    :class="selectedXhsId === mat.id
                      ? 'border-primary-400 ring-2 ring-primary-200 shadow-soft'
                      : 'border-divider hover:border-primary-300'"
                  >
                    <div class="aspect-square w-full overflow-hidden bg-cream/20">
                      <img v-if="mat.image" :src="mat.image" class="h-full w-full object-cover" />
                      <div v-else class="flex h-full w-full items-center justify-center">
                        <p class="text-2xl">💅</p>
                      </div>
                    </div>
                    <div class="p-2">
                      <p class="text-[11px] font-medium text-ink truncate">{{ mat.title || '素材 #' + mat.id }}</p>
                      <p class="text-[10px] text-cocoa truncate">👍 {{ mat.likes }}</p>
                      <div class="mt-0.5 scale-[0.8] origin-left">
                        <TagBadge :tags="mat.aiTags" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Tab: Local Upload -->
              <div v-if="coverTab === 'upload'" class="mt-2">
                <p class="text-[11px] text-cocoa/60">支持 JPG/PNG 格式，单张 ≤ 10MB</p>
                <div v-if="uploadPreview" class="mt-2 flex items-center gap-3 rounded-xl bg-cream/30 p-3">
                  <img :src="uploadPreview" class="h-20 w-20 rounded-xl object-cover" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-ink truncate">{{ uploadFileName }}</p>
                    <p class="text-xs text-cocoa">{{ uploadFileSize }}</p>
                  </div>
                  <button
                    @click="clearUpload"
                    class="rounded-full border border-divider bg-white px-3 py-1 text-xs text-cocoa transition hover:text-error"
                  >
                    移除
                  </button>
                </div>
                <label
                  v-else
                  class="mt-2 flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-divider bg-cream/20 text-cocoa transition hover:border-primary-300 hover:text-primary-600"
                >
                  <svg class="h-6 w-6 mb-1" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span class="text-xs">点击上传封面图片</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    class="hidden"
                    @change="handleUpload"
                    ref="fileInput"
                  />
                </label>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex gap-3">
            <button @click="closeForm"
              class="flex-1 rounded-[18px] border border-divider bg-white py-2.5 text-sm text-cocoa transition hover:bg-cream">
              取消
            </button>
            <button @click="submitForm" :disabled="!formModalValid || formModal.saving"
              class="flex-1 rounded-[18px] bg-primary-500 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40">
              {{ formModal.saving ? '保存中...' : (formModal.isCreate ? '创建' : '保存') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import TagBadge from '../../components/merchant/TagBadge.vue'
import {
  fetchDesigns, toggleDesignStatus, batchToggleDesignStatus,
  updateDesignSort, updateDesign, createDesign, batchSortDesigns,
  fetchXhsMaterials, uploadDesignCover
} from '../../data/api'
import { labelSystem } from '../../data/merchantMockData'

const tagDimensions = [
  { key: 'shape', name: '甲型', required: true },
  { key: 'tone', name: '色调', required: true },
  { key: 'style', name: '风格', required: true },
  { key: 'craft', name: '工艺', required: false },
  { key: 'decor', name: '装饰元素', required: false }
]

const labelOptions = labelSystem
const pageSize = 12
const currentPage = ref(1)
const totalCount = ref(0)
const statusFilter = ref('all')
const designs = ref([])
const counts = ref({ all: 0, listed: 0, unlisted: 0 })
const loading = ref(true)
const managing = ref(false)
const sorting = ref(false)
const selectedIds = ref(new Set())
const batchOperating = ref(false)
const sortSaving = ref(false)
const showPreview = ref(false)

// Listed designs for preview
const listedDesigns = computed(() => designs.value.filter(d => d.isListed))

const mockReviews = [
  { name: '小美', rating: 5, content: '服务非常好，美甲师很专业，效果超出预期！', date: '2天前' },
  { name: '花花', rating: 5, content: '环境很舒适，做的款式很喜欢，下次还来！', date: '1周前' },
  { name: '娜娜', rating: 4, content: '整体不错，就是等待时间有点长', date: '2周前' }
]

// Drag state
const dragSrc = ref(null)
const dragOverIdx = ref(null)

const totalPages = computed(() => Math.max(Math.ceil(totalCount.value / pageSize), 1))
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
const statusTabs = computed(() => [
  { label: '全部', value: 'all', count: counts.value.all },
  { label: '已上架', value: 'listed', count: counts.value.listed },
  { label: '已下架', value: 'unlisted', count: counts.value.unlisted }
])

// Shared form modal (edit + create)
const formModal = reactive({
  visible: false,
  isCreate: false,
  saving: false,
  designId: null,
  form: {
    name: '',
    price: 0,
    description: '',
    coverImage: null,
    tags: { shape: '', tone: '', style: '', craft: '', decor: '' }
  }
})

const formModalValid = computed(() => {
  const t = formModal.form.tags
  return t.shape && t.tone && t.style && formModal.form.name.trim()
})

// XHS material library
const xhsMaterials = ref([])
const xhsLoading = ref(false)
const selectedXhsId = ref(null)

// Cover source tab + local upload
const coverTab = ref('xhs')
const fileInput = ref(null)
const uploadPreview = ref(null)
const uploadFileName = ref('')
const uploadFileSize = ref('')
const uploadError = ref('')

async function loadXhsMaterials() {
  xhsLoading.value = true
  try {
    const result = await fetchXhsMaterials({ reviewStatus: 'approved', limit: 20, sort: 'likes' })
    xhsMaterials.value = result.materials.map(m => ({
      id: m.id,
      image: m.image || m.thumbnail,
      title: m.title,
      likes: m.likes,
      aiTags: m.aiTags
    }))
  } catch (err) {
    console.warn('Failed to load XHS materials:', err.message)
    xhsMaterials.value = []
  } finally {
    xhsLoading.value = false
  }
}

function selectXhsMaterial(mat) {
  if (selectedXhsId.value === mat.id) {
    selectedXhsId.value = null
    formModal.form.coverImage = null
    return
  }
  selectedXhsId.value = mat.id
  formModal.form.coverImage = mat.image
  clearUpload()
  if (mat.aiTags) {
    const t = mat.aiTags
    if (t.shape) formModal.form.tags.shape = t.shape
    if (t.tone) formModal.form.tags.tone = t.tone
    if (t.style) formModal.form.tags.style = t.style
    if (t.craft) formModal.form.tags.craft = t.craft
    if (t.decor) formModal.form.tags.decor = t.decor
  }
}

// Local file upload
async function handleUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return

  uploadError.value = ''

  // Validate format
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['jpg', 'jpeg', 'png'].includes(ext)) {
    alert('仅支持 JPG/PNG 格式图片')
    return
  }

  // Validate size
  if (file.size > 10 * 1024 * 1024) {
    alert('图片大小不能超过 10MB')
    return
  }

  // Show local preview immediately
  uploadFileName.value = file.name
  uploadFileSize.value = (file.size / 1024).toFixed(1) + ' KB'
  uploadPreview.value = URL.createObjectURL(file)

  try {
    const result = await uploadDesignCover(file)
    // Replace blob URL with actual server URL
    formModal.form.coverImage = result.url
    selectedXhsId.value = null
  } catch (err) {
    uploadError.value = '上传失败，请重试'
    uploadPreview.value = null
    URL.revokeObjectURL(uploadPreview.value)
    console.error('Upload failed:', err.message)
  }
}

function clearUpload() {
  if (uploadPreview.value) {
    URL.revokeObjectURL(uploadPreview.value)
  }
  uploadPreview.value = null
  uploadFileName.value = ''
  uploadFileSize.value = ''
  uploadError.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Data loading
async function loadDesigns() {
  loading.value = true
  try {
    const result = await fetchDesigns({
      status: statusFilter.value,
      limit: pageSize,
      offset: (currentPage.value - 1) * pageSize
    })
    designs.value = result.designs
    totalCount.value = result.total
    counts.value = result.counts
  } catch (err) {
    console.error('Failed to load designs:', err.message)
    designs.value = []
  } finally {
    loading.value = false
  }
}

function switchFilter(value) {
  statusFilter.value = value
  currentPage.value = 1
  loadDesigns()
}

function changePage(p) {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p
    loadDesigns()
  }
}

// Management mode
function enterManage() {
  managing.value = true
  selectedIds.value = new Set()
}

function exitManage() {
  managing.value = false
  selectedIds.value = new Set()
}

function toggleSelect(id) {
  const next = new Set(selectedIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selectedIds.value = next
}

function selectAll() {
  if (selectedIds.value.size === designs.value.length) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(designs.value.map(d => d.id))
  }
}

// Single status toggle
async function toggleSingleStatus(item) {
  const newStatus = !item.isListed
  try {
    await toggleDesignStatus(item.id, { isListed: newStatus })
    await loadDesigns()
  } catch (err) {
    const msg = err.response?.data?.message || err.message
    alert(msg)
  }
}

// Batch operations
async function batchList() {
  batchOperating.value = true
  try {
    await batchToggleDesignStatus({ ids: [...selectedIds.value], isListed: true })
    exitManage()
    await loadDesigns()
  } catch (err) {
    const msg = err.response?.data?.message || err.message
    alert(msg)
  } finally {
    batchOperating.value = false
  }
}

async function batchUnlist() {
  batchOperating.value = true
  try {
    await batchToggleDesignStatus({ ids: [...selectedIds.value], isListed: false })
    exitManage()
    await loadDesigns()
  } catch (err) {
    const msg = err.response?.data?.message || err.message
    alert(msg)
  } finally {
    batchOperating.value = false
  }
}

// Pin toggle
async function togglePin(item) {
  try {
    await updateDesignSort(item.id, { isPinned: !item.isPinned })
    await loadDesigns()
  } catch (err) {
    console.error('Failed to toggle pin:', err.message)
  }
}

// ---- Sort mode ----
function enterSort() {
  sorting.value = true
}

function cancelSort() {
  sorting.value = false
  dragSrc.value = null
  dragOverIdx.value = null
  loadDesigns()
}

function onDragStart(e, idx) {
  dragSrc.value = idx
  e.dataTransfer.effectAllowed = 'move'
}

function onDragOver(e, idx) {
  dragOverIdx.value = idx
}

function onDragEnd() {
  dragSrc.value = null
  dragOverIdx.value = null
}

function onDrop(idx) {
  if (dragSrc.value === null || dragSrc.value === idx) return
  const list = [...designs.value]
  const [moved] = list.splice(dragSrc.value, 1)
  list.splice(idx, 0, moved)
  designs.value = list
  dragSrc.value = null
  dragOverIdx.value = null
}

async function saveSort() {
  sortSaving.value = true
  try {
    const orders = designs.value.map((d, i) => ({ id: d.id, sortOrder: i + 1 }))
    await batchSortDesigns(orders)
    sorting.value = false
    await loadDesigns()
  } catch (err) {
    console.error('Failed to save sort:', err.message)
    alert('排序保存失败，请重试')
  } finally {
    sortSaving.value = false
  }
}

// ---- Form modal (edit / create) ----
function openEdit(item) {
  formModal.isCreate = false
  formModal.designId = item.id
  formModal.form.name = item.name
  formModal.form.price = item.price || 0
  formModal.form.description = item.description || ''
  formModal.form.coverImage = item.coverImage
  formModal.form.tags = { ...item.tags }
  formModal.visible = true
}

function openCreate() {
  formModal.isCreate = true
  formModal.designId = null
  formModal.form.name = ''
  formModal.form.price = 0
  formModal.form.description = ''
  formModal.form.coverImage = null
  formModal.form.tags = { shape: '', tone: '', style: '', craft: '', decor: '' }
  selectedXhsId.value = null
  coverTab.value = 'xhs'
  clearUpload()
  formModal.visible = true
  loadXhsMaterials()
}

function closeForm() {
  formModal.visible = false
  formModal.designId = null
  clearUpload()
}

async function submitForm() {
  if (!formModalValid.value) return
  formModal.saving = true
  try {
    if (formModal.isCreate) {
      await createDesign({
        name: formModal.form.name,
        price: formModal.form.price,
        description: formModal.form.description,
        coverImage: formModal.form.coverImage,
        tags: formModal.form.tags
      })
    } else {
      await updateDesign(formModal.designId, {
        name: formModal.form.name,
        price: formModal.form.price,
        description: formModal.form.description,
        tags: formModal.form.tags
      })
    }
    formModal.visible = false
    await loadDesigns()
  } catch (err) {
    const msg = err.response?.data?.message || err.message
    alert(msg)
  } finally {
    formModal.saving = false
  }
}

onMounted(() => {
  loadDesigns()
})
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
