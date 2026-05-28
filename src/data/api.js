import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// ============ XHS Material APIs ============

/** Get XHS material list with optional filters */
export async function fetchXhsMaterials({ reviewStatus, search, offset, limit } = {}) {
  const { data } = await api.get('/merchant/material/xhs/list', {
    params: { review_status: reviewStatus, search, offset, limit }
  })
  return data.data
}

/** Get single material detail */
export async function fetchXhsMaterialDetail(id) {
  const { data } = await api.get(`/merchant/material/xhs/${id}`)
  return data.data
}

/** Submit review for a material */
export async function submitReview(id, { action, reason, reasonCategory, tags, operator }) {
  const { data } = await api.post(`/merchant/material/xhs/${id}/review`, {
    action, reason, reasonCategory, tags, operator
  })
  return data.data
}

/** Update material tags */
export async function updateMaterialTags(id, { tags, operator }) {
  const { data } = await api.put(`/merchant/material/xhs/${id}/tags`, { tags, operator })
  return data.data
}

/** Get material review logs */
export async function fetchMaterialLogs(id) {
  const { data } = await api.get(`/merchant/material/xhs/logs/${id}`)
  return data.data
}

/** Batch delete materials */
export async function deleteMaterials(ids) {
  const { data } = await api.delete('/merchant/material/xhs/batch', { data: { ids } })
  return data.data
}

// ============ Label APIs ============

/** Get full label system */
export async function fetchLabelSystem() {
  const { data } = await api.get('/merchant/label/system')
  return data.data
}

/** Create a new label */
export async function createLabel({ dimension, labelName, supplementDesc, sourceMaterialId }) {
  const { data } = await api.post('/merchant/label/create', {
    dimension, labelName, supplementDesc, sourceMaterialId
  })
  return data.data
}

// ============ OpenClaw Config APIs ============

/** Get scraping config */
export async function fetchScrapeConfig() {
  const { data } = await api.get('/merchant/openclaw/config')
  return data.data
}

/** Update scraping config */
export async function updateScrapeConfig(config) {
  const { data } = await api.put('/merchant/openclaw/config', config)
  return data.data
}

/** Manually trigger a scrape run (long timeout — takes minutes with manual login) */
export async function triggerScrape() {
  const { data } = await api.post('/merchant/openclaw/config/trigger', null, { timeout: 600000 })
  return data.data
}

// ============ XHS Trend APIs ============

/** Get XHS tag trend data */
export async function fetchXhsTrend() {
  const { data } = await api.get('/merchant/xhs/trend')
  return data.data
}

// ============ Design (Product) APIs ============

/** Get paginated design list */
export async function fetchDesigns({ status, offset, limit } = {}) {
  const { data } = await api.get('/merchant/design/list', {
    params: { status, offset, limit }
  })
  return data.data
}

/** Get single design detail with stats */
export async function fetchDesignDetail(id) {
  const { data } = await api.get(`/merchant/design/${id}`)
  return data.data
}

/** Update design info */
export async function updateDesign(id, payload) {
  const { data } = await api.put(`/merchant/design/${id}`, payload)
  return data.data
}

/** Toggle single design listing status */
export async function toggleDesignStatus(id, { isListed, operator }) {
  const { data } = await api.put(`/merchant/design/${id}/status`, { isListed, operator })
  return data.data
}

/** Batch toggle listing status */
export async function batchToggleDesignStatus({ ids, isListed, operator }) {
  const { data } = await api.post('/merchant/design/batch-status', { ids, isListed, operator })
  return data.data
}

/** Update design sort order / pin */
export async function updateDesignSort(id, { sortOrder, isPinned, operator }) {
  const { data } = await api.put(`/merchant/design/${id}/sort`, { sortOrder, isPinned, operator })
  return data.data
}

/** Auto-create design from AI generation */
export async function createDesign(payload) {
  const { data } = await api.post('/merchant/design', payload)
  return data.data
}

/** Save completed work to portfolio */
export async function saveWork(payload) {
  const { data } = await api.post('/merchant/design/work', payload)
  return data.data
}

/** Upload image and auto-detect nail tags */
export async function detectTags(file) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/merchant/design/detect-tags', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000
  })
  return data.data
}

/** Batch update sort orders after drag reorder */
export async function batchSortDesigns(orders) {
  const { data } = await api.post('/merchant/design/batch-sort', { orders })
  return data.data
}

/** Upload cover image for design */
export async function uploadDesignCover(file) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/merchant/design/upload-cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000
  })
  return data.data
}

// ============ Message (Conversation) APIs ============

/** Get all conversations */
export async function fetchConversations() {
  const { data } = await api.get('/merchant/messages/conversations')
  return data.data
}

/** Get messages for a conversation */
export async function fetchMessages(conversationId) {
  const { data } = await api.get(`/merchant/messages/${conversationId}`)
  return data.data
}

/** Send a message */
export async function sendMessage(conversationId, content) {
  const { data } = await api.post(`/merchant/messages/${conversationId}/send`, { content })
  return data.data
}

/** Create appointment from conversation */
export async function createAppointmentFromChat(conversationId, payload) {
  const { data } = await api.post(`/merchant/messages/${conversationId}/appointment`, payload)
  return data.data
}

/** Modify appointment from conversation */
export async function modifyAppointmentFromChat(conversationId, appointmentId, payload) {
  const { data } = await api.put(`/merchant/messages/${conversationId}/appointment/${appointmentId}`, payload)
  return data.data
}

/** Cancel appointment from conversation */
export async function cancelAppointmentFromChat(conversationId, appointmentId, reason) {
  const { data } = await api.post(`/merchant/messages/${conversationId}/appointment/${appointmentId}/cancel`, { reason })
  return data.data
}

// ============ Order APIs ============

/** Get order list */
export async function fetchOrders({ offset, limit } = {}) {
  const { data } = await api.get('/merchant/order/list', { params: { offset, limit } })
  return data.data
}

/** Get single order detail */
export async function fetchOrderDetail(id) {
  const { data } = await api.get(`/merchant/order/${id}`)
  return data.data
}

/** Create order */
export async function createOrder(payload) {
  const { data } = await api.post('/merchant/order', payload)
  return data.data
}

/** Update order tags / nail artist */
export async function updateOrder(id, payload) {
  const { data } = await api.put(`/merchant/order/${id}`, payload)
  return data.data
}

/** Delete an order */
export async function deleteOrder(id) {
  const { data } = await api.delete(`/merchant/order/${id}`)
  return data.data
}

export default api
