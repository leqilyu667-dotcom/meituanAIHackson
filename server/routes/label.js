import { Router } from 'express'
import db from '../db.js'

const router = Router()

/**
 * GET /api/merchant/label/system
 * Get full label system config
 */
router.get('/system', (req, res) => {
  const labels = db.prepare('SELECT * FROM label_system_config WHERE is_active=1 ORDER BY dimension, sort_order').all()

  // Format as the frontend expects: { shape: [...], tone: [...], ... }
  const system = {}
  for (const l of labels) {
    if (!system[l.dimension]) system[l.dimension] = []
    system[l.dimension].push(l.label_value)
  }

  // Also return dimensions metadata
  const dimensions = db.prepare('SELECT DISTINCT dimension as "key", dimension_name as name FROM label_system_config WHERE is_active=1 ORDER BY dimension').all()

  return res.json({ code: 0, data: { system, dimensions } })
})

/**
 * POST /api/merchant/label/create
 * Create a new label in the system
 */
router.post('/create', (req, res) => {
  const { dimension, labelName, supplementDesc, sourceMaterialId, requester = 'platform_ops' } = req.body

  // Validate
  if (!dimension || !labelName || !labelName.trim()) {
    return res.status(422).json({ code: 'LABEL_INVALID_PARAMS', message: '维度和标签名称不能为空' })
  }

  const validDims = ['shape', 'tone', 'craft', 'decor', 'style']
  if (!validDims.includes(dimension)) {
    return res.status(422).json({ code: 'LABEL_INVALID_DIMENSION', message: '无效的标签维度' })
  }

  const name = labelName.trim()
  if (name.length > 16) {
    return res.status(422).json({ code: 'LABEL_TOO_LONG', message: '标签名称不超过16个字符' })
  }
  if (/[<>"'&]/.test(name)) {
    return res.status(422).json({ code: 'LABEL_INVALID_CHARS', message: '标签名称包含非法字符' })
  }

  // Check duplicate
  const existing = db.prepare('SELECT id FROM label_system_config WHERE dimension=? AND label_value=?').get(dimension, name)
  if (existing) {
    return res.status(409).json({ code: 'LABEL_DUPLICATE', message: '标签已存在，请重新选择' })
  }

  // Insert into label system
  const maxSort = db.prepare('SELECT MAX(sort_order) as m FROM label_system_config WHERE dimension=?').get(dimension)
  db.prepare(`INSERT INTO label_system_config (dimension, dimension_name, label_value, sort_order, is_active, source)
    VALUES (?, ?, ?, ?, 1, 'manual_add')`)
    .run(dimension, getDimName(dimension), name, (maxSort?.m || 0) + 1)

  // Record the request
  db.prepare(`INSERT INTO label_new_request (dimension, label_name, requester, source_material_id, supplement_desc, status)
    VALUES (?, ?, ?, ?, ?, 'approved')`)
    .run(dimension, name, requester, sourceMaterialId || null, supplementDesc || null)

  return res.json({ code: 0, message: '标签创建成功', data: { dimension, labelName: name } })
})

function getDimName(dim) {
  const map = { shape: '甲型', tone: '色调', craft: '工艺', decor: '装饰元素', style: '风格' }
  return map[dim] || dim
}

export default router
