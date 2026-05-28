<template>
  <div class="p-8 max-w-2xl mx-auto">
    <div class="mb-6">
      <p class="eyebrow">ACCOUNT SETTINGS</p>
      <h1 class="mt-1 text-2xl font-semibold text-ink">商家主页</h1>
      <p class="mt-2 text-sm text-cocoa">编辑经营平台账号信息</p>
    </div>

    <!-- Avatar section -->
    <section class="card mb-6 p-6">
      <h3 class="text-sm font-medium text-ink">头像</h3>
      <div class="mt-4 flex items-center gap-5">
        <div class="grid h-20 w-20 place-items-center rounded-full bg-primary-100 text-2xl font-bold text-primary-600">
          {{ form.avatarText }}
        </div>
        <div>
          <p class="text-sm text-ink">当前头像文字</p>
          <input
            v-model="form.avatarText"
            maxlength="2"
            class="input-field mt-2 w-20 text-center text-lg font-bold"
          />
          <p class="mt-1 text-xs text-cocoa/60">输入1-2个字符作为头像</p>
        </div>
      </div>
    </section>

    <!-- Profile info -->
    <section class="card mb-6 p-6">
      <h3 class="text-sm font-medium text-ink">基本信息</h3>
      <div class="mt-4 space-y-4">
        <div>
          <label class="text-xs font-medium text-cocoa">店铺名称</label>
          <input v-model="form.storeName" class="input-field mt-1 w-full text-sm" placeholder="妙手" />
        </div>
        <div>
          <label class="text-xs font-medium text-cocoa">平台副标题</label>
          <input v-model="form.subtitle" class="input-field mt-1 w-full text-sm" placeholder="智慧经营平台" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-medium text-cocoa">所在城市</label>
            <input v-model="form.city" class="input-field mt-1 w-full text-sm" placeholder="北京" />
          </div>
          <div>
            <label class="text-xs font-medium text-cocoa">区域</label>
            <input v-model="form.district" class="input-field mt-1 w-full text-sm" placeholder="朝阳区" />
          </div>
        </div>
        <div>
          <label class="text-xs font-medium text-cocoa">账号角色</label>
          <input v-model="form.role" class="input-field mt-1 w-full text-sm" placeholder="商家主账号" />
        </div>
        <div>
          <label class="text-xs font-medium text-cocoa">权限描述</label>
          <input v-model="form.roleDesc" class="input-field mt-1 w-full text-sm" placeholder="全部功能权限" />
        </div>
      </div>
    </section>

    <!-- Save -->
    <div class="flex gap-3">
      <button
        @click="resetForm"
        class="rounded-[18px] border border-divider bg-white px-6 py-2.5 text-sm text-cocoa transition hover:bg-cream"
      >
        重置
      </button>
      <button
        @click="saveProfile"
        :disabled="saving"
        class="rounded-[18px] bg-primary-500 px-8 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
      >
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const form = reactive({
  avatarText: '商',
  storeName: '妙手',
  subtitle: '智慧经营平台',
  city: '北京',
  district: '朝阳区',
  role: '商家主账号',
  roleDesc: '全部功能权限'
})

const saving = ref(false)

function resetForm() {
  form.avatarText = '商'
  form.storeName = '妙手'
  form.subtitle = '智慧经营平台'
  form.city = '北京'
  form.district = '朝阳区'
  form.role = '商家主账号'
  form.roleDesc = '全部功能权限'
}

function saveProfile() {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    alert('保存成功')
  }, 500)
}
</script>
