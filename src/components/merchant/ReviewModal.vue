<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm" @click.self="close">
        <div class="mx-4 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-card">
          <div class="border-b border-divider px-6 py-4">
            <h3 class="text-lg font-medium text-ink">素材复审</h3>
          </div>

          <div class="px-6 py-4">
            <div class="flex gap-4">
              <img
                :src="material.image"
                alt=""
                class="h-28 w-28 shrink-0 rounded-2xl object-cover"
              />
              <div class="min-w-0 flex-1 text-sm">
                <p class="text-xs text-cocoa">来源：<a :href="material.source" target="_blank" class="text-primary-600 underline">小红书链接</a></p>
                <div class="mt-2 flex items-center gap-4 text-xs text-cocoa">
                  <span>点赞 {{ material.likes }}</span>
                </div>

                <div class="mt-3">
                  <p class="text-xs text-cocoa mb-1.5">AI 预打标签</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="(val, dim) in editableTags"
                      :key="dim"
                      class="cursor-pointer rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700 transition hover:bg-primary-100"
                      @click="startEditTag(dim)"
                    >
                      {{ val }}
                    </span>
                  </div>
                </div>

                <div v-if="editingDim" class="mt-3 rounded-xl bg-cream p-3">
                  <p class="mb-2 text-xs font-medium text-cocoa">
                    修改「{{ labelDimensions.find(d => d.key === editingDim)?.name }}」
                  </p>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="opt in labelOptions(editingDim)"
                      :key="opt"
                      @click="editableTags[editingDim] = opt; editingDim = null"
                      class="rounded-full border px-2.5 py-1 text-xs transition"
                      :class="editableTags[editingDim] === opt
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-divider text-cocoa hover:border-primary-300'"
                    >
                      {{ opt }}
                    </button>
                  </div>
                  <div class="mt-2 flex items-center gap-2">
                    <input
                      v-model="newTagValue"
                      placeholder="新建标签..."
                      class="flex-1 rounded-lg border border-divider bg-white px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary-300"
                      @keyup.enter="addNewTag"
                    />
                    <button
                      @click="addNewTag"
                      class="shrink-0 rounded-lg bg-primary-500 px-3 py-1 text-xs text-white"
                    >
                      添加
                    </button>
                  </div>
                  <p v-if="tagError" class="mt-1 text-xs text-error">{{ tagError }}</p>
                </div>
              </div>
            </div>

            <div v-if="action === 'reject'" class="mt-4">
              <label class="text-xs text-cocoa">驳回原因 <span class="text-error">*</span></label>
              <textarea
                v-model="rejectReason"
                rows="2"
                class="input-field mt-1 text-sm"
                placeholder="请填写驳回原因"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 border-t border-divider px-6 py-4">
            <button @click="close" class="btn-secondary rounded-[18px] px-6 py-2 text-sm">取消</button>
            <template v-if="!action">
              <button @click="action = 'reject'" class="rounded-[18px] border border-error bg-white px-5 py-2 text-sm font-medium text-error transition hover:bg-error/5">
                驳回
              </button>
              <button @click="action = 'pending'" class="rounded-[18px] border border-divider bg-white px-5 py-2 text-sm font-medium text-cocoa transition hover:bg-cream">
                暂存
              </button>
              <button @click="confirmReview('approved')" class="rounded-[18px] bg-success px-5 py-2 text-sm font-medium text-white transition hover:opacity-90">
                通过
              </button>
            </template>
            <template v-else>
              <button @click="action = null" class="rounded-[18px] border border-divider bg-white px-5 py-2 text-sm text-cocoa">返回</button>
              <button @click="confirmReview" class="rounded-[18px] bg-primary-600 px-5 py-2 text-sm font-medium text-white">
                确认{{ action === 'reject' ? '驳回' : '暂存' }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { labelDimensions as LabelDimensions, labelSystem as fallbackLabels } from '../../data/merchantMockData'
import { fetchLabelSystem, createLabel as apiCreateLabel } from '../../data/api'

const props = defineProps({
  visible: { type: Boolean, default: false },
  material: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'review'])

const action = ref(null)
const rejectReason = ref('')
const editableTags = ref({})
const editingDim = ref(null)
const newTagValue = ref('')
const tagError = ref('')
const labelSystem = ref({ ...fallbackLabels })
const labelDimensions = ref([...LabelDimensions])
const saving = ref(false)

// Load label system from API on mount
onMounted(async () => {
  try {
    const result = await fetchLabelSystem()
    labelSystem.value = result.system
    labelDimensions.value = result.dimensions
  } catch (err) {
    console.warn('Failed to load labels from API, using fallback:', err.message)
  }
})

watch(() => props.visible, (val) => {
  if (val) {
    action.value = null
    rejectReason.value = ''
    editingDim.value = null
    newTagValue.value = ''
    tagError.value = ''
    saving.value = false
    editableTags.value = { ...props.material.aiTags }
  }
})

const labelOptions = (dim) => labelSystem.value[dim] || []

const startEditTag = (dim) => {
  editingDim.value = dim
  newTagValue.value = ''
  tagError.value = ''
}

const addNewTag = async () => {
  const val = newTagValue.value.trim()
  if (!val) return
  if (labelSystem.value[editingDim.value]?.includes(val)) {
    tagError.value = '标签已存在，请重新选择'
    return
  }

  try {
    // Create via API
    await apiCreateLabel({
      dimension: editingDim.value,
      labelName: val,
      sourceMaterialId: props.material.id
    })

    // Update local state
    if (!labelSystem.value[editingDim.value]) {
      labelSystem.value[editingDim.value] = []
    }
    labelSystem.value[editingDim.value].push(val)
    editableTags.value[editingDim.value] = val
    editingDim.value = null
    newTagValue.value = ''
    tagError.value = ''
  } catch (err) {
    tagError.value = err.response?.data?.message || '标签创建失败'
  }
}

const confirmReview = (type) => {
  const status = type || action.value
  if (status === 'reject' && !rejectReason.value.trim()) {
    return
  }
  emit('review', {
    id: props.material.id,
    status,
    reason: status === 'reject' ? rejectReason.value : '',
    reasonCategory: '',
    tags: { ...editableTags.value }
  })
  close()
}

const close = () => {
  emit('close')
}
</script>
