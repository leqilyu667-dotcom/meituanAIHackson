import { Router } from 'express'
import db from '../db.js'

const router = Router()

/**
 * POST /api/merchant/material-library
 * Save generated material to library
 */
router.post('/', (req, res) => {
  const { name, imageUrl, tags } = req.body

  if (!imageUrl) {
    return res.status(422).json({ code: 'INVALID_PARAMS', message: '图片为必填项' })
  }

  const result = db.prepare(`INSERT INTO material_library
    (name, image_url, tags_json, tags_shape, tags_tone, tags_craft, tags_decor, tags_style)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    name || '',
    imageUrl,
    tags ? JSON.stringify(tags) : '{}',
    tags?.shape || '', tags?.tone || '', tags?.craft || '', tags?.decor || '', tags?.style || ''
  )

  return res.json({ code: 0, data: { id: Number(result.lastInsertRowid) } })
})

/**
 * GET /api/merchant/material-library/list
 * List library materials, newest first
 */
router.get('/list', (req, res) => {
  const { offset = 0, limit = 50 } = req.query
  const materials = db.prepare(
    'SELECT * FROM material_library WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(Number(limit), Number(offset))

  const total = db.prepare('SELECT COUNT(*) as c FROM material_library WHERE is_deleted = 0').get()?.c || 0

  return res.json({
    code: 0,
    data: {
      materials: materials.map(m => ({
        id: m.id,
        name: m.name,
        imageUrl: m.image_url,
        tags: {
          shape: m.tags_shape || '',
          tone: m.tags_tone || '',
          craft: m.tags_craft || '',
          decor: m.tags_decor || '',
          style: m.tags_style || ''
        },
        isFavorite: !!m.is_favorite,
        createdAt: m.created_at
      })),
      total
    }
  })
})

/**
 * PUT /api/merchant/material-library/:id/favorite
 * Toggle favorite status
 */
router.put('/:id/favorite', (req, res) => {
  const material = db.prepare('SELECT * FROM material_library WHERE id = ? AND is_deleted = 0').get(req.params.id)
  if (!material) {
    return res.status(404).json({ code: 'NOT_FOUND', message: '素材不存在' })
  }

  const newVal = material.is_favorite ? 0 : 1
  db.prepare('UPDATE material_library SET is_favorite = ? WHERE id = ?').run(newVal, req.params.id)

  return res.json({ code: 0, data: { isFavorite: !!newVal } })
})

/**
 * DELETE /api/merchant/material-library/:id
 * Soft-delete a material
 */
router.delete('/:id', (req, res) => {
  db.prepare('UPDATE material_library SET is_deleted = 1 WHERE id = ?').run(req.params.id)
  return res.json({ code: 0, message: 'ok' })
})

export default router
