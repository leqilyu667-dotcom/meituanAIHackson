import { Router } from 'express'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import db from '../db.js'
import { openclawLoginAndSearch } from '../services/openclawScraper.js'
import { runAITagging, filterCoverImages } from '../services/aiTagger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const router = Router()

/**
 * GET /api/merchant/openclaw/config
 */
router.get('/openclaw/config', (req, res) => {
  const config = db.prepare('SELECT * FROM openclaw_config LIMIT 1').get()
  if (!config) {
    return res.status(404).json({ code: 'CONFIG_NOT_FOUND', message: '配置不存在' })
  }

  return res.json({
    code: 0,
    data: {
      ...config,
      keywords: JSON.parse(config.keywords),
      exclude_keywords: JSON.parse(config.exclude_keywords)
    }
  })
})

/**
 * PUT /api/merchant/openclaw/config
 */
router.put('/openclaw/config', (req, res) => {
  const { keywords, exclude_keywords, min_likes, min_collects, schedule_cron, schedule_enabled, max_per_batch, date_range_days, updated_by } = req.body

  const config = db.prepare('SELECT id FROM openclaw_config LIMIT 1').get()
  if (!config) {
    return res.status(404).json({ code: 'CONFIG_NOT_FOUND', message: '配置不存在' })
  }

  db.prepare(`UPDATE openclaw_config SET
    keywords=?, exclude_keywords=?, min_likes=?, min_collects=?,
    schedule_cron=?, schedule_enabled=?, max_per_batch=?, date_range_days=?,
    updated_by=?, updated_at=datetime('now','localtime')
    WHERE id=?`).run(
    JSON.stringify(keywords), JSON.stringify(exclude_keywords),
    min_likes, min_collects, schedule_cron, schedule_enabled ? 1 : 0,
    max_per_batch, date_range_days, updated_by || 'admin', config.id
  )

  return res.json({ code: 0, message: '配置更新成功' })
})

/**
 * POST /api/merchant/openclaw/config/trigger
 *
 * Manual trigger — launches visible browser, operator logs in,
 * system screenshots search results + inserts to DB + runs AI tagging.
 */
router.post('/openclaw/config/trigger', async (req, res) => {
  try {
    const config = db.prepare('SELECT * FROM openclaw_config LIMIT 1').get()
    if (!config) {
      return res.status(422).json({ code: 'SCRAPE_CONFIG_EMPTY', message: '请先配置抓取关键词' })
    }

    // ── Phase 1: Scrape 20 posts with CDN cover downloads ──
    console.log('[Config] ===== Trigger: starting scrape + cover filter flow =====')
    const notes = await openclawLoginAndSearch(config)

    if (!notes || notes.length === 0) {
      return res.json({
        code: 0, message: '搜索完成但未找到符合条件的美甲笔记',
        data: { batch_id: null, received: 0, accepted: 0, materials: [] }
      })
    }

    // ── Phase 2: Filter covers — discard 9-grid collages, keep only single-hand covers ──
    console.log(`[Config] Phase 2: Filtering ${notes.length} covers with vision model...`)
    const imagePaths = notes.map(n => n.coverImage)
    const filterResults = await filterCoverImages(imagePaths)

    const goodNotes = notes.filter((_, i) => filterResults[i]?.keep)
    console.log(`[Config] Cover filter: ${goodNotes.length}/${notes.length} covers passed`)

    if (goodNotes.length === 0) {
      return res.json({
        code: 0, message: '封面筛选后无可用素材（所有封面均为九宫格或非单手特写）',
        data: { batch_id: null, received: notes.length, accepted: 0, materials: [] }
      })
    }

    // ── Phase 3: Sort by likes, take top 9 ──
    goodNotes.sort((a, b) => b.likes - a.likes)
    const top9 = goodNotes.slice(0, 9)
    console.log(`[Config] Phase 3: Top ${top9.length} by likes`)

    // ── Phase 4: Insert to DB ──
    const batchId = uuidv4()
    db.prepare(`INSERT INTO xhs_scrape_batch (batch_id, status, total_scraped, after_filter, keyword_set, started_at)
      VALUES (?, 'running', ?, ?, ?, datetime('now','localtime'))`)
      .run(batchId, notes.length, top9.length, JSON.stringify(JSON.parse(config.keywords || '["爆款美甲"]')))

    const insertMaterial = db.prepare(`
      INSERT OR IGNORE INTO xhs_external_material
      (batch_id, source_id, source_url, author_nickname, title, description, cover_image_url,
       publish_time, xhs_tags, likes, collects, comments, shares, heat_score, review_status, sync_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
    `)

    const insertImage = db.prepare(`
      INSERT INTO xhs_material_image (material_id, seq, original_url, processed_url, image_hash, image_status, is_cover)
      VALUES (?, ?, ?, ?, ?, 'processed', ?)
    `)

    const insertTag = db.prepare(`
      INSERT INTO material_tags (material_id, material_type, shape, tone, craft, decor, style, tag_source, confidence)
      VALUES (?, 'xhs', '', '', '', '', '', 'ai_prescan', '{}')
    `)

    let accepted = 0
    let duplicated = 0
    const materialResults = []

    const txn = db.transaction(() => {
      for (const note of top9) {
        const heatScore = (note.likes || 0) * 1

        const result = insertMaterial.run(
          batchId, note.noteId, note.sourceUrl,
          note.author || '', note.title || '', note.description || '',
          note.coverImage || '', note.publishTime || new Date().toISOString(),
          JSON.stringify(note.tags || []),
          note.likes || 0, note.collects || 0, note.comments || 0, 0,
          Math.round(heatScore * 100) / 100
        )

        if (result.changes === 0) {
          duplicated++
          materialResults.push({ source_id: note.noteId, internal_id: null, status: 'duplicated' })
          continue
        }

        const materialId = result.lastInsertRowid
        accepted++

        // CDN original for AI tagging, local processed for display
        const cdnUrl = note.cdnCoverUrl || note.coverImage
        const hash = crypto.createHash('sha256').update(note.noteId).digest('hex').substring(0, 16)
        insertImage.run(materialId, 1, cdnUrl, note.coverImage, hash, 1)

        insertTag.run(materialId)
        materialResults.push({ source_id: note.noteId, internal_id: materialId, status: 'accepted' })
      }
    })

    txn()

    // Update batch
    db.prepare(`UPDATE xhs_scrape_batch SET
      received=?, duplicated=?, accepted=?, status='completed', completed_at=datetime('now','localtime')
      WHERE batch_id=?`).run(accepted + duplicated, duplicated, accepted, batchId)

    // ── Phase 5: AI tagging (async) ──
    if (accepted > 0) {
      setImmediate(async () => {
        try {
          const newIds = materialResults
            .filter(r => r.status === 'accepted' && r.internal_id)
            .map(r => r.internal_id)
          await runAITagging(newIds)
          console.log(`[Config] AI tagging complete for batch ${batchId}`)
        } catch (err) {
          console.error(`[Config] AI tagging error for batch ${batchId}:`, err)
        }
      })
    }

    return res.json({
      code: 0, message: '抓取完成',
      data: {
        batch_id: batchId,
        received: notes.length,
        after_filter: top9.length,
        duplicated,
        accepted,
        materials: materialResults
      }
    })

  } catch (err) {
    console.error('[Config] Trigger failed:', err.message)
    return res.status(500).json({ code: 'SCRAPE_TRIGGER_FAILED', message: '抓取触发失败: ' + err.message })
  }
})

/**
 * GET /api/merchant/xhs/trend
 * Get XHS tag trend data (for TrendAnalysis module)
 */
router.get('/xhs/trend', (req, res) => {
  // Aggregate approved materials by tag combinations for trend data
  const materials = db.prepare(`
    SELECT m.*, t.shape, t.tone, t.craft, t.decor, t.style
    FROM xhs_external_material m
    JOIN material_tags t ON t.material_id = m.id AND t.is_current = 1
    WHERE m.review_status = 'approved' AND m.is_deleted = 0
    ORDER BY m.heat_score DESC
  `).all()

  // Group by tag combinations
  const grouped = {}
  for (const m of materials) {
    const key = `${m.shape}|${m.tone}|${m.craft}|${m.decor}|${m.style}`
    if (!grouped[key]) {
      grouped[key] = {
        tags: { shape: m.shape, tone: m.tone, craft: m.craft, decor: m.decor, style: m.style },
        materialCount: 0,
        totalLikes: 0,
        totalCollects: 0,
        avgHeatScore: 0
      }
    }
    grouped[key].materialCount++
    grouped[key].totalLikes += m.likes
    grouped[key].totalCollects += m.collects
    grouped[key].avgHeatScore += m.heat_score
  }

  const trends = Object.values(grouped).map(g => ({
    ...g,
    avgLikes: Math.round(g.totalLikes / g.materialCount),
    avgCollects: Math.round(g.totalCollects / g.materialCount),
    avgHeatScore: Math.round(g.avgHeatScore / g.materialCount * 100) / 100
  }))

  trends.sort((a, b) => b.avgHeatScore - a.avgHeatScore)

  return res.json({ code: 0, data: { trends, total: trends.length } })
})

export default router
