import { Router } from 'express'
import db from '../db.js'
import { syncApprovedMaterial } from '../services/syncManager.js'

const router = Router()

/**
 * GET /api/merchant/material/xhs/list
 * List XHS materials with filters
 */
router.get('/xhs/list', (req, res) => {
  const { review_status, search, offset = 0, limit = 50, sort = 'heat_score' } = req.query

  // Build WHERE clause for JOIN queries (with m. prefix)
  const joinParts = ['m.is_deleted = 0']
  const params = []

  if (review_status) {
    joinParts.push('m.review_status = ?')
    params.push(review_status)
  }
  if (search) {
    joinParts.push('(m.title LIKE ? OR m.author_nickname LIKE ?)')
    params.push(`%${search}%`, `%${search}%`)
  }
  const joinWhere = joinParts.join(' AND ')

  // Build WHERE clause for standalone queries (no table alias)
  const cleanWhere = joinWhere.replace(/m\./g, '')

  // Auto-cleanup: keep max 60 approved materials, delete lowest-liked beyond
  if (review_status === 'approved') {
    const approvedCount = db.prepare(
      `SELECT COUNT(*) as cnt FROM xhs_external_material WHERE ${cleanWhere}`
    ).get(...params)?.cnt || 0

    if (approvedCount > 60) {
      const excess = approvedCount - 60
      const excessIds = db.prepare(`
        SELECT id FROM xhs_external_material
        WHERE ${cleanWhere}
        ORDER BY likes ASC, id ASC
        LIMIT ?
      `).all(...params, excess).map(r => r.id)

      if (excessIds.length > 0) {
        const ph = excessIds.map(() => '?').join(',')
        db.prepare(`UPDATE xhs_external_material SET is_deleted=1, updated_at=datetime('now','localtime')
          WHERE id IN (${ph})`).run(...excessIds)
        db.prepare(`DELETE FROM material_tags WHERE material_id IN (${ph})`).run(...excessIds)
        console.log(`[Material] Cleaned up ${excessIds.length} old approved materials (limit: 60)`)
      }
    }
  }

  // Count total before pagination
  const total = db.prepare(
    `SELECT COUNT(*) as cnt FROM xhs_external_material m
     JOIN material_tags t ON t.material_id = m.id AND t.is_current = 1
     WHERE ${joinWhere}`
  ).get(...params)?.cnt || 0

  const orderCol = sort === 'likes' ? 'm.likes' : 'm.heat_score'
  const sql = `
    SELECT m.*, t.shape, t.tone, t.craft, t.decor, t.style, t.tag_source, t.confidence,
      (SELECT processed_url FROM xhs_material_image WHERE material_id=m.id AND is_cover=1 LIMIT 1) as image_url,
      (SELECT thumbnail_url FROM xhs_material_image WHERE material_id=m.id AND is_cover=1 LIMIT 1) as thumbnail_url
    FROM xhs_external_material m
    JOIN material_tags t ON t.material_id = m.id AND t.is_current = 1
    WHERE ${joinWhere}
    ORDER BY CASE WHEN m.review_status = 'approved' THEN 2 WHEN m.review_status = 'rejected' THEN 1 ELSE 0 END, ${orderCol} DESC
    LIMIT ? OFFSET ?
  `

  const materials = db.prepare(sql).all(...params, Number(limit), Number(offset))

  // Format for frontend
  const formatted = materials.map(m => ({
    id: m.id,
    image: m.image_url || m.cover_image_url,
    thumbnail: m.thumbnail_url,
    source: m.source_url,
    title: m.title,
    author: m.author_nickname,
    likes: m.likes,
    collects: m.collects,
    comments: m.comments,
    shares: m.shares,
    heatScore: m.heat_score,
    reviewStatus: m.review_status,
    syncStatus: m.sync_status,
    aiTags: {
      shape: m.shape || '',
      tone: m.tone || '',
      craft: m.craft || '',
      decor: m.decor || '',
      style: m.style || ''
    },
    tagSource: m.tag_source,
    confidence: m.confidence ? JSON.parse(m.confidence) : {},
    publishTime: m.publish_time,
    rejectReason: m.reject_reason,
    createdAt: m.created_at
  }))

  // Also count by status
  const counts = db.prepare(`
    SELECT review_status, COUNT(*) as cnt FROM xhs_external_material
    WHERE is_deleted = 0 GROUP BY review_status
  `).all()

  return res.json({
    code: 0,
    data: { materials: formatted, counts, total }
  })
})

/**
 * GET /api/merchant/material/xhs/:id
 * Get single material detail with images and review logs
 */
router.get('/xhs/:id', (req, res) => {
  const { id } = req.params

  const material = db.prepare(`
    SELECT m.*, t.shape, t.tone, t.craft, t.decor, t.style, t.tag_source, t.confidence
    FROM xhs_external_material m
    JOIN material_tags t ON t.material_id = m.id AND t.is_current = 1
    WHERE m.id = ? AND m.is_deleted = 0
  `).get(id)

  if (!material) {
    return res.status(404).json({ code: 'MATERIAL_NOT_FOUND', message: '素材不存在或已删除' })
  }

  const images = db.prepare('SELECT * FROM xhs_material_image WHERE material_id=? ORDER BY seq').all(id)
  const logs = db.prepare('SELECT * FROM xhs_review_log WHERE material_id=? ORDER BY created_at DESC').all(id)

  return res.json({
    code: 0,
    data: {
      ...material,
      xhs_tags: material.xhs_tags ? JSON.parse(material.xhs_tags) : [],
      confidence: material.confidence ? JSON.parse(material.confidence) : {},
      images: images.map(img => ({
        ...img,
        image_hash: undefined // Don't expose hash
      })),
      logs
    }
  })
})

/**
 * POST /api/merchant/material/xhs/:id/review
 * Submit review result (approve/reject/defer)
 */
router.post('/xhs/:id/review', (req, res) => {
  const { id } = req.params
  const { action, reason, reasonCategory, tags, operator = 'platform_ops', operatorRole = 'platform_ops' } = req.body

  if (!['approve', 'reject', 'defer'].includes(action)) {
    return res.status(422).json({ code: 'INVALID_ACTION', message: '无效的操作类型' })
  }

  if (action === 'reject' && (!reason || !reason.trim())) {
    return res.status(422).json({ code: 'REJECT_REASON_REQUIRED', message: '驳回必须填写原因' })
  }

  const material = db.prepare('SELECT * FROM xhs_external_material WHERE id=? AND is_deleted=0').get(id)
  if (!material) {
    return res.status(404).json({ code: 'MATERIAL_NOT_FOUND', message: '素材不存在或已删除' })
  }

  // Snapshot before
  const beforeTags = db.prepare('SELECT * FROM material_tags WHERE material_id=? AND is_current=1').get(id)

  const txn = db.transaction(() => {
    // Update material review status
    const reviewStatus = action === 'defer' ? 'deferred' : (action === 'reject' ? 'rejected' : 'approved')
    db.prepare(`UPDATE xhs_external_material SET
      review_status=?, reviewed_by=?, reviewed_at=datetime('now','localtime'),
      reject_reason=?, updated_at=datetime('now','localtime')
      WHERE id=?`).run(reviewStatus, operator, reason || null, id)

    // Update tags if provided
    if (tags && (tags.shape || tags.tone || tags.style)) {
      // Mark old tags as not current
      db.prepare('UPDATE material_tags SET is_current=0 WHERE material_id=?').run(id)
      // Insert new version
      db.prepare(`INSERT INTO material_tags (material_id, material_type, shape, tone, craft, decor, style, tag_source, confidence, is_current)
        VALUES (?, 'xhs', ?, ?, ?, ?, ?, 'manual_review', '{}', 1)`)
        .run(id, tags.shape || '', tags.tone || '', tags.craft || '', tags.decor || '', tags.style || '')
    }

    // Log the review action
    const afterTags = db.prepare('SELECT * FROM material_tags WHERE material_id=? AND is_current=1').get(id)
    db.prepare(`INSERT INTO xhs_review_log (material_id, operator, operator_role, action, action_detail, before_snapshot, after_snapshot)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      id, operator, operatorRole, action,
      JSON.stringify({ reason, reasonCategory, tagChanges: { before: beforeTags, after: afterTags } }),
      JSON.stringify({ material, tags: beforeTags }),
      JSON.stringify({ material: db.prepare('SELECT * FROM xhs_external_material WHERE id=?').get(id), tags: afterTags })
    )
  })

  txn()

  // If approved, trigger sync
  if (action === 'approve') {
    setImmediate(() => {
      syncApprovedMaterial(Number(id))
    })
  }

  return res.json({ code: 0, message: 'ok', data: { id: Number(id), reviewStatus: action === 'defer' ? 'deferred' : (action === 'reject' ? 'rejected' : 'approved') } })
})

/**
 * PUT /api/merchant/material/xhs/:id/tags
 * Update material tags without changing review status
 */
router.put('/xhs/:id/tags', (req, res) => {
  const { id } = req.params
  const { tags, operator = 'platform_ops', operatorRole = 'platform_ops' } = req.body

  const material = db.prepare('SELECT * FROM xhs_external_material WHERE id=? AND is_deleted=0').get(id)
  if (!material) {
    return res.status(404).json({ code: 'MATERIAL_NOT_FOUND', message: '素材不存在' })
  }

  const beforeTags = db.prepare('SELECT * FROM material_tags WHERE material_id=? AND is_current=1').get(id)

  db.prepare('UPDATE material_tags SET is_current=0 WHERE material_id=?').run(id)
  db.prepare(`INSERT INTO material_tags (material_id, material_type, shape, tone, craft, decor, style, tag_source, confidence, is_current)
    VALUES (?, 'xhs', ?, ?, ?, ?, ?, 'manual_review', '{}', 1)`)
    .run(id, tags.shape || '', tags.tone || '', tags.craft || '', tags.decor || '', tags.style || '')

  const afterTags = db.prepare('SELECT * FROM material_tags WHERE material_id=? AND is_current=1').get(id)
  db.prepare(`INSERT INTO xhs_review_log (material_id, operator, operator_role, action, action_detail, before_snapshot, after_snapshot)
    VALUES (?, ?, ?, 'tag_modify', ?, ?, ?)`).run(
    id, operator, operatorRole,
    JSON.stringify({ tagChanges: { before: beforeTags, after: afterTags } }),
    JSON.stringify({ tags: beforeTags }),
    JSON.stringify({ tags: afterTags })
  )

  return res.json({ code: 0, message: 'ok' })
})

/**
 * GET /api/merchant/material/xhs/logs/:id
 */
router.get('/xhs/logs/:id', (req, res) => {
  const logs = db.prepare('SELECT * FROM xhs_review_log WHERE material_id=? ORDER BY created_at DESC').all(req.params.id)
  return res.json({ code: 0, data: logs })
})

/**
 * DELETE /api/merchant/material/xhs/batch
 * Soft-delete multiple materials by IDs
 */
router.delete('/xhs/batch', (req, res) => {
  const { ids } = req.body

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(422).json({ code: 'INVALID_PARAMS', message: 'ids array is required' })
  }

  const ph = ids.map(() => '?').join(',')
  const txn = db.transaction(() => {
    db.prepare(`UPDATE xhs_external_material SET is_deleted=1, updated_at=datetime('now','localtime')
      WHERE id IN (${ph}) AND is_deleted=0`).run(...ids)
    db.prepare(`DELETE FROM material_tags WHERE material_id IN (${ph})`).run(...ids)
  })

  txn()

  return res.json({ code: 0, message: 'ok', data: { deleted: ids.length } })
})

export default router
