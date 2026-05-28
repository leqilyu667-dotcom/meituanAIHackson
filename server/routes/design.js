import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import db from '../db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', 'public', 'processed', 'designs'),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      const name = crypto.randomBytes(8).toString('hex')
      cb(null, `${name}${ext}`)
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('仅支持 JPG/PNG 格式图片'))
    }
  }
})

const router = Router()

// Deterministic sales data generator based on design ID
function generateSalesData(designId) {
  const seed = designId * 2654435761
  const rand = (n) => ((seed * (n + 1) * 1103515245 + 12345) >>> 0) % 100

  const dailyOrders = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(Date.now() - (6 - i) * 86400000)
    const orders = (rand(i * 3) % 12) + (designId % 3)
    const revenue = orders * (designId % 5 === 0 ? 228 : designId % 3 === 0 ? 168 : 128)
    const tryOns = orders * 2 + (rand(i * 7) % 8)
    return {
      day: day.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
      orders,
      revenue,
      tryOns
    }
  })

  const totalOrders = dailyOrders.reduce((s, d) => s + d.orders, 0)
  const totalRevenue = dailyOrders.reduce((s, d) => s + d.revenue, 0)
  const totalTryOns = dailyOrders.reduce((s, d) => s + d.tryOns, 0)
  const tryOnConversion = totalTryOns > 0 ? ((totalOrders / totalTryOns) * 100).toFixed(1) : '0'

  return { totalOrders, totalRevenue, totalTryOns, tryOnConversion, dailyOrders }
}

/**
 * POST /api/merchant/design/upload-cover
 * Upload cover image for a design
 */
router.post('/upload-cover', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(422).json({ code: 'NO_FILE', message: '请选择上传文件' })
  }

  const url = `/processed/designs/${req.file.filename}`

  return res.json({
    code: 0,
    data: {
      url,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
  })
})

/**
 * POST /api/merchant/design/detect-tags
 * Upload image and auto-detect nail tags using doubao vision model
 */
router.post('/detect-tags', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(422).json({ code: 'NO_FILE', message: '请选择上传文件' })
  }

  const url = `/processed/designs/${req.file.filename}`
  const filePath = path.join(__dirname, '..', 'public', 'processed', 'designs', req.file.filename)

  // Build base64 data URL for vision API
  const buf = fs.readFileSync(filePath)
  const ext = path.extname(filePath).slice(1) || 'jpeg'
  const imageUrl = `data:image/${ext};base64,${buf.toString('base64')}`

  // Call doubao vision model
  try {
    const labelEnum = loadLabelEnum()
    const prompt = buildTagPrompt(labelEnum)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    const resp = await fetch(`${ARK_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: prompt }
          ]
        }],
        max_tokens: 512,
        temperature: 0.1
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => '')
      throw new Error(`ARK API ${resp.status}: ${errBody.slice(0, 200)}`)
    }

    const data = await resp.json()
    const content = data.choices?.[0]?.message?.content || ''
    console.log(`[DetectTags] ARK response: ${content.slice(0, 200)}`)

    const result = parseTagResponse(content, labelEnum)
    if (!result) {
      throw new Error('Failed to parse AI response')
    }

    // Convert 0-1 confidence to percentages
    const confidence = {}
    for (const [k, v] of Object.entries(result.confidence || {})) {
      confidence[k] = Math.round(v * 100)
    }

    return res.json({
      code: 0,
      data: { url, tags: { shape: result.shape, tone: result.tone, craft: result.craft, decor: result.decor, style: result.style }, confidence }
    })
  } catch (err) {
    console.error('[DetectTags] AI tagging failed:', err.message)
    return res.status(500).json({ code: 'AI_TAG_FAILED', message: 'AI 识别失败，请重试' })
  }
})

// Shared helpers (reused from aiTagger pattern)
const ARK_BASE = 'https://ark.cn-beijing.volces.com/api/v3'
const ARK_KEY = 'ark-0cae034f-bc13-4ac0-b78d-038a1cf63050-b8046'
const MODEL = 'doubao-seed-1-6-vision-250815'

function loadLabelEnum() {
  const rows = db.prepare(
    'SELECT dimension, label_value FROM label_system_config WHERE is_active=1 ORDER BY dimension, sort_order'
  ).all()
  const map = { shape: [], tone: [], craft: [], decor: [], style: [] }
  for (const r of rows) {
    if (map[r.dimension]) map[r.dimension].push(r.label_value)
  }
  return map
}

function buildTagPrompt(labelEnum) {
  return `你是一个美甲图像识别专家。请仔细观察这张美甲图片，按照以下五维标签体系给出分类结果。

## 标签约束（每个维度必须从给定选项中选择，不可超出范围）

- 甲型(shape): ${labelEnum.shape.join('、')}
- 色调(tone): ${labelEnum.tone.join('、')}
- 工艺(craft): ${labelEnum.craft.join('、')}（如果看不出明显工艺，填空字符串""）
- 装饰元素(decor): ${labelEnum.decor.join('、')}（如果没有装饰，填写"无装饰"）
- 风格(style): ${labelEnum.style.join('、')}

## 输出要求

严格输出一个 JSON 对象，不要包含任何其他文字。格式如下：

{
  "shape": "选择的甲型",
  "tone": "选择的色调",
  "craft": "选择的工艺或空字符串",
  "decor": "选择的装饰元素",
  "style": "选择的风格",
  "confidence": {
    "shape": 0.0~1.0,
    "tone": 0.0~1.0,
    "craft": 0.0~1.0,
    "decor": 0.0~1.0,
    "style": 0.0~1.0
  }
}`
}

function extractJSON(text) {
  const start = text.indexOf('{')
  if (start === -1) return null
  let depth = 0, inString = false, escaped = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escaped) { escaped = false; continue }
    if (ch === '\\' && inString) { escaped = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '{') depth++
    if (ch === '}') { depth--; if (depth === 0) return text.slice(start, i + 1) }
  }
  return null
}

function parseTagResponse(text, labelEnum) {
  let jsonStr = text.trim()
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) jsonStr = fenceMatch[1].trim()
  const extracted = extractJSON(jsonStr)
  if (!extracted) return null
  let parsed
  try { parsed = JSON.parse(extracted) } catch { return null }
  const result = { shape: '', tone: '', craft: '', decor: '', style: '', confidence: {} }
  for (const dim of ['shape', 'tone', 'craft', 'decor', 'style']) {
    const val = parsed[dim] || ''
    const allowed = labelEnum[dim] || []
    if (dim === 'craft' && val === '') { result[dim] = ''; continue }
    result[dim] = allowed.includes(val) ? val : (allowed[0] || '')
  }
  if (parsed.confidence) {
    for (const dim of ['shape', 'tone', 'craft', 'decor', 'style']) {
      const raw = parsed.confidence[dim]
      result.confidence[dim] = typeof raw === 'number' ? Math.min(1, Math.max(0, raw)) : 0.7
    }
  }
  return result
}

/**
 * POST /api/merchant/design
 * Auto-create design from AI material generation
 */
router.post('/', (req, res) => {
  const { name, price, description, tags, coverImage, operator = 'merchant_owner' } = req.body

  if (!name || !tags || !tags.shape || !tags.tone || !tags.style) {
    return res.status(422).json({ code: 'INVALID_PARAMS', message: '名称、甲型、色调、风格为必填项' })
  }

  // Get next sort order
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM nail_design WHERE is_deleted = 0').get()
  const sortOrder = (maxOrder?.m || 0) + 1

  const result = db.prepare(`INSERT INTO nail_design
    (store_id, name, price, description, shape, tone, craft, decor, style, cover_image, sort_order, is_listed, operator_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`).run(
    1, name, price || 0, description || '',
    tags.shape, tags.tone, tags.craft || '', tags.decor || '', tags.style,
    coverImage || null, sortOrder, operator
  )

  db.prepare(`INSERT INTO nail_design_log (design_id, operator, action, action_detail)
    VALUES (?, ?, 'create', ?)`).run(
    result.lastInsertRowid, operator,
    JSON.stringify({ name, price, tags })
  )

  return res.json({ code: 0, message: 'ok', data: { id: Number(result.lastInsertRowid) } })
})

/**
 * GET /api/merchant/design/list
 * Paginated list with status filter
 */
router.get('/list', (req, res) => {
  const { status = 'all', offset = 0, limit = 20 } = req.query

  const whereParts = ['d.is_deleted = 0']
  const params = []

  if (status === 'listed') {
    whereParts.push('d.is_listed = 1')
  } else if (status === 'unlisted') {
    whereParts.push('d.is_listed = 0')
  }

  const whereClause = whereParts.join(' AND ')

  const total = db.prepare(
    `SELECT COUNT(*) as cnt FROM nail_design d WHERE ${whereClause}`
  ).get(...params)?.cnt || 0

  const designs = db.prepare(`
    SELECT d.* FROM nail_design d
    WHERE ${whereClause}
    ORDER BY d.is_pinned DESC, d.sort_order ASC, d.updated_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), Number(offset))

  // Count by status
  const counts = db.prepare(`
    SELECT
      COUNT(*) as all_count,
      SUM(CASE WHEN is_listed = 1 THEN 1 ELSE 0 END) as listed_count,
      SUM(CASE WHEN is_listed = 0 THEN 1 ELSE 0 END) as unlisted_count
    FROM nail_design WHERE is_deleted = 0
  `).get()

  const formatted = designs.map(d => {
    const sales = generateSalesData(d.id)
    return {
      id: d.id,
      storeId: d.store_id,
      name: d.name,
      price: d.price,
      description: d.description,
      coverImage: d.cover_image,
      detailImages: d.detail_images ? JSON.parse(d.detail_images) : [],
      tags: {
        shape: d.shape,
        tone: d.tone,
        craft: d.craft || '',
        decor: d.decor || '',
        style: d.style
      },
      sortOrder: d.sort_order,
      isPinned: !!d.is_pinned,
      isListed: !!d.is_listed,
      operatorId: d.operator_id,
      sales: {
        totalOrders: sales.totalOrders,
        totalRevenue: sales.totalRevenue
      },
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }
  })

  return res.json({
    code: 0,
    data: {
      designs: formatted,
      total,
      counts: {
        all: counts.all_count,
        listed: counts.listed_count,
        unlisted: counts.unlisted_count
      }
    }
  })
})

/**
 * GET /api/merchant/design/works
 * List completed works (must be before /:id to avoid route conflict)
 */
router.get('/works', (req, res) => {
  const { offset = 0, limit = 50 } = req.query
  const works = db.prepare(
    'SELECT * FROM nail_work WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(Number(limit), Number(offset))

  const total = db.prepare('SELECT COUNT(*) as c FROM nail_work WHERE is_deleted = 0').get()?.c || 0

  return res.json({
    code: 0,
    data: {
      works: works.map(w => ({
        id: w.id,
        imageUrl: w.image_url,
        name: w.name,
        tags: { shape: w.shape, tone: w.tone, craft: w.craft, decor: w.decor, style: w.style },
        confidence: w.confidence ? JSON.parse(w.confidence) : {},
        serviceItem: w.service_item,
        price: w.price,
        customerName: w.customer_name,
        orderNo: w.order_no,
        createdAt: w.created_at
      })),
      total
    }
  })
})

/**
 * GET /api/merchant/design/:id
 * Single design detail with stats and logs
 */
router.get('/:id', (req, res) => {
  const design = db.prepare(
    'SELECT * FROM nail_design WHERE id = ? AND is_deleted = 0'
  ).get(req.params.id)

  if (!design) {
    return res.status(404).json({ code: 'DESIGN_NOT_FOUND', message: '款式不存在或已删除' })
  }

  // Generate deterministic stats from design ID
  const stats = generateSalesData(design.id)

  const logs = db.prepare(
    'SELECT * FROM nail_design_log WHERE design_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(req.params.id)

  return res.json({
    code: 0,
    data: {
      id: design.id,
      storeId: design.store_id,
      name: design.name,
      price: design.price,
      description: design.description,
      coverImage: design.cover_image,
      detailImages: design.detail_images ? JSON.parse(design.detail_images) : [],
      tags: {
        shape: design.shape,
        tone: design.tone,
        craft: design.craft || '',
        decor: design.decor || '',
        style: design.style
      },
      sortOrder: design.sort_order,
      isPinned: !!design.is_pinned,
      isListed: !!design.is_listed,
      operatorId: design.operator_id,
      stats,
      logs: logs.map(l => ({
        id: l.id,
        operator: l.operator,
        action: l.action,
        actionDetail: l.action_detail ? JSON.parse(l.action_detail) : {},
        createdAt: l.created_at
      })),
      createdAt: design.created_at,
      updatedAt: design.updated_at
    }
  })
})

/**
 * PUT /api/merchant/design/:id
 * Update design info (edit modal)
 */
router.put('/:id', (req, res) => {
  const design = db.prepare(
    'SELECT * FROM nail_design WHERE id = ? AND is_deleted = 0'
  ).get(req.params.id)

  if (!design) {
    return res.status(404).json({ code: 'DESIGN_NOT_FOUND', message: '款式不存在' })
  }

  const { name, price, description, tags, coverImage, detailImages, operator = 'merchant_owner' } = req.body

  // Validate required tags
  if (tags) {
    if (!tags.shape || !tags.tone || !tags.style) {
      return res.status(422).json({ code: 'TAGS_REQUIRED', message: '甲型/色调/风格为必填项，请补充完整' })
    }
  }

  const beforeSnapshot = JSON.stringify(design)

  db.prepare(`UPDATE nail_design SET
    name = COALESCE(?, name),
    price = COALESCE(?, price),
    description = COALESCE(?, description),
    cover_image = COALESCE(?, cover_image),
    detail_images = COALESCE(?, detail_images),
    shape = COALESCE(?, shape),
    tone = COALESCE(?, tone),
    craft = COALESCE(?, craft),
    decor = COALESCE(?, decor),
    style = COALESCE(?, style),
    operator_id = ?,
    updated_at = datetime('now','localtime')
    WHERE id = ?`).run(
    name ?? null,
    price ?? null,
    description ?? null,
    coverImage ?? null,
    detailImages ? JSON.stringify(detailImages) : null,
    tags?.shape ?? null,
    tags?.tone ?? null,
    tags?.craft ?? null,
    tags?.decor ?? null,
    tags?.style ?? null,
    operator,
    req.params.id
  )

  const afterDesign = db.prepare('SELECT * FROM nail_design WHERE id = ?').get(req.params.id)

  db.prepare(`INSERT INTO nail_design_log (design_id, operator, action, action_detail, before_snapshot, after_snapshot)
    VALUES (?, ?, 'edit', ?, ?, ?)`).run(
    req.params.id, operator,
    JSON.stringify({ changedFields: Object.keys(req.body).filter(k => k !== 'operator') }),
    beforeSnapshot,
    JSON.stringify(afterDesign)
  )

  return res.json({ code: 0, message: 'ok' })
})

/**
 * PUT /api/merchant/design/:id/status
 * Toggle single design listing status
 */
router.put('/:id/status', (req, res) => {
  const design = db.prepare(
    'SELECT * FROM nail_design WHERE id = ? AND is_deleted = 0'
  ).get(req.params.id)

  if (!design) {
    return res.status(404).json({ code: 'DESIGN_NOT_FOUND', message: '款式不存在' })
  }

  const { isListed, operator = 'merchant_owner' } = req.body

  if (typeof isListed === 'undefined') {
    return res.status(422).json({ code: 'INVALID_PARAMS', message: 'isListed is required' })
  }

  // If listing, validate required tags
  if (isListed) {
    if (!design.shape || !design.tone || !design.style) {
      return res.status(422).json({ code: 'TAGS_REQUIRED', message: '请完善甲型/色调/风格标签后再上架' })
    }
  }

  const beforeSnapshot = JSON.stringify(design)

  db.prepare(`UPDATE nail_design SET
    is_listed = ?, operator_id = ?, updated_at = datetime('now','localtime')
    WHERE id = ?`).run(isListed ? 1 : 0, operator, req.params.id)

  const afterDesign = db.prepare('SELECT * FROM nail_design WHERE id = ?').get(req.params.id)

  db.prepare(`INSERT INTO nail_design_log (design_id, operator, action, action_detail, before_snapshot, after_snapshot)
    VALUES (?, ?, ?, ?, ?, ?)`).run(
    req.params.id, operator,
    isListed ? 'list' : 'unlist',
    JSON.stringify({ isListed }),
    beforeSnapshot,
    JSON.stringify(afterDesign)
  )

  return res.json({ code: 0, message: 'ok', data: { id: Number(req.params.id), isListed } })
})

/**
 * POST /api/merchant/design/batch-status
 * Batch listing/unlisting
 */
router.post('/batch-status', (req, res) => {
  const { ids, isListed, operator = 'merchant_owner' } = req.body

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(422).json({ code: 'INVALID_PARAMS', message: 'ids array is required' })
  }

  const ph = ids.map(() => '?').join(',')

  // If listing, check all have required tags
  if (isListed) {
    const incomplete = db.prepare(`
      SELECT id FROM nail_design
      WHERE id IN (${ph}) AND is_deleted = 0
      AND (shape IS NULL OR shape = '' OR tone IS NULL OR tone = '' OR style IS NULL OR style = '')
    `).all(...ids)

    if (incomplete.length > 0) {
      return res.status(422).json({
        code: 'TAGS_REQUIRED',
        message: `${incomplete.length} 条款式缺少必填标签（甲型/色调/风格），请补充后再上架`,
        data: { incompleteIds: incomplete.map(r => r.id) }
      })
    }
  }

  const txn = db.transaction(() => {
    for (const id of ids) {
      const design = db.prepare('SELECT * FROM nail_design WHERE id = ? AND is_deleted = 0').get(id)
      if (!design) continue

      const beforeSnapshot = JSON.stringify(design)

      db.prepare(`UPDATE nail_design SET
        is_listed = ?, operator_id = ?, updated_at = datetime('now','localtime')
        WHERE id = ?`).run(isListed ? 1 : 0, operator, id)

      const afterDesign = db.prepare('SELECT * FROM nail_design WHERE id = ?').get(id)

      db.prepare(`INSERT INTO nail_design_log (design_id, operator, action, action_detail, before_snapshot, after_snapshot)
        VALUES (?, ?, ?, ?, ?, ?)`).run(
        id, operator,
        isListed ? 'list' : 'unlist',
        JSON.stringify({ isListed, batch: true }),
        beforeSnapshot,
        JSON.stringify(afterDesign)
      )
    }
  })

  txn()

  return res.json({ code: 0, message: 'ok', data: { affected: ids.length } })
})

/**
 * PUT /api/merchant/design/:id/sort
 * Update sort order / pin
 */
router.put('/:id/sort', (req, res) => {
  const design = db.prepare(
    'SELECT * FROM nail_design WHERE id = ? AND is_deleted = 0'
  ).get(req.params.id)

  if (!design) {
    return res.status(404).json({ code: 'DESIGN_NOT_FOUND', message: '款式不存在' })
  }

  const { sortOrder, isPinned, operator = 'merchant_owner' } = req.body

  const beforeSnapshot = JSON.stringify(design)

  if (typeof isPinned !== 'undefined') {
    db.prepare(`UPDATE nail_design SET
      is_pinned = ?, sort_order = COALESCE(?, sort_order),
      operator_id = ?, updated_at = datetime('now','localtime')
      WHERE id = ?`).run(isPinned ? 1 : 0, sortOrder ?? null, operator, req.params.id)
  } else if (typeof sortOrder !== 'undefined') {
    db.prepare(`UPDATE nail_design SET
      sort_order = ?, operator_id = ?, updated_at = datetime('now','localtime')
      WHERE id = ?`).run(sortOrder, operator, req.params.id)
  }

  const afterDesign = db.prepare('SELECT * FROM nail_design WHERE id = ?').get(req.params.id)

  db.prepare(`INSERT INTO nail_design_log (design_id, operator, action, action_detail, before_snapshot, after_snapshot)
    VALUES (?, ?, 'sort', ?, ?, ?)`).run(
    req.params.id, operator,
    JSON.stringify({ sortOrder, isPinned }),
    beforeSnapshot,
    JSON.stringify(afterDesign)
  )

  return res.json({ code: 0, message: 'ok' })
})

/**
 * POST /api/merchant/design/batch-sort
 * Batch update sort orders after drag reorder
 */
router.post('/batch-sort', (req, res) => {
  const { orders, operator = 'merchant_owner' } = req.body

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return res.status(422).json({ code: 'INVALID_PARAMS', message: 'orders array is required' })
  }

  const txn = db.transaction(() => {
    for (const { id, sortOrder } of orders) {
      db.prepare(`UPDATE nail_design SET sort_order = ?, operator_id = ?, updated_at = datetime('now','localtime')
        WHERE id = ? AND is_deleted = 0`).run(sortOrder, operator, id)

      db.prepare(`INSERT INTO nail_design_log (design_id, operator, action, action_detail)
        VALUES (?, ?, 'sort', ?)`).run(id, operator, JSON.stringify({ sortOrder, batch: true }))
    }
  })

  txn()

  return res.json({ code: 0, message: 'ok', data: { affected: orders.length } })
})

/**
 * GET /api/merchant/design/:id/stats
 * Design stats dashboard data
 */
router.get('/:id/stats', (req, res) => {
  const design = db.prepare(
    'SELECT * FROM nail_design WHERE id = ? AND is_deleted = 0'
  ).get(req.params.id)

  if (!design) {
    return res.status(404).json({ code: 'DESIGN_NOT_FOUND', message: '款式不存在' })
  }

  const stats = generateSalesData(design.id)
  return res.json({ code: 0, data: stats })
})

/**
 * GET /api/merchant/design/:id/logs
 * Design operation logs
 */
router.get('/:id/logs', (req, res) => {
  const logs = db.prepare(
    'SELECT * FROM nail_design_log WHERE design_id = ? ORDER BY created_at DESC LIMIT 100'
  ).all(req.params.id)

  return res.json({
    code: 0,
    data: logs.map(l => ({
      id: l.id,
      operator: l.operator,
      action: l.action,
      actionDetail: l.action_detail ? JSON.parse(l.action_detail) : {},
      createdAt: l.created_at
    }))
  })
})

/**
 * POST /api/merchant/design/work
 * Save completed work to portfolio (no coupling with shelf)
 */
router.post('/work', (req, res) => {
  const { imageUrl, name, tags, confidence, serviceItem, price, customerName, orderNo } = req.body

  if (!imageUrl) {
    return res.status(422).json({ code: 'INVALID_PARAMS', message: '图片为必填项' })
  }

  const result = db.prepare(`INSERT INTO nail_work
    (image_url, name, shape, tone, craft, decor, style, confidence, service_item, price, customer_name, order_no)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    imageUrl,
    name || '',
    tags?.shape || '', tags?.tone || '', tags?.craft || '', tags?.decor || '', tags?.style || '',
    confidence ? JSON.stringify(confidence) : '{}',
    serviceItem || '', price || 0, customerName || '', orderNo || ''
  )

  return res.json({ code: 0, message: 'ok', data: { id: Number(result.lastInsertRowid) } })
})

export default router
