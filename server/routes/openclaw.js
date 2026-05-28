import { Router } from 'express'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import db from '../db.js'
import { processMaterialImages } from '../services/imageProcessor.js'
import { runAITagging, filterCoverImages } from '../services/aiTagger.js'
import { openclawLoginAndSearch } from '../services/openclawScraper.js'

const router = Router()

// In production, API key + secret would come from env vars or a secure config store
const OPENCLAW_API_KEY = 'nailia_openclaw_key_2026'
const OPENCLAW_API_SECRET = 'nailia_openclaw_secret_2026'

/**
 * Shared DB insertion — inserts scraped materials into the standard schema.
 * Used by both the OpenClaw push endpoint and the trigger endpoint.
 * Pattern MUST stay consistent with xhs_external_material / xhs_material_image /
 * material_tags table definitions. DO NOT modify downstream processing.
 */
function insertMaterialsToDB(batchId, materials) {
  const insertMaterial = db.prepare(`
    INSERT OR IGNORE INTO xhs_external_material
    (batch_id, source_id, source_url, author_nickname, title, description, cover_image_url,
     publish_time, xhs_tags, likes, collects, comments, shares, heat_score, review_status, sync_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
  `)

  // Screenshot flow: original_url = CDN (for AI tagging), processed_url = screenshot (for display)
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
    for (const note of materials) {
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

      // Screenshot = display, CDN original = AI tagging
      const screenshotPath = note.coverImage || `/processed/${note.noteId}.jpg`
      const cdnUrl = note.cdnCoverUrl || note.coverImage
      const hash = crypto.createHash('sha256').update(note.noteId).digest('hex').substring(0, 16)
      insertImage.run(materialId, 1, cdnUrl, screenshotPath, hash, 1)

      // Additional images (if any CDN images from detail page)
      const extraImages = note.allImages?.slice(1) || []
      extraImages.forEach((url, idx) => {
        const imgHash = crypto.createHash('sha256').update(url || note.noteId).digest('hex').substring(0, 16)
        insertImage.run(materialId, idx + 2, url, '', imgHash, 0)
      })

      insertTag.run(materialId)
      materialResults.push({ source_id: note.noteId, internal_id: materialId, status: 'accepted' })
    }
  })

  txn()

  return { accepted, duplicated, materialResults }
}

/**
 * POST /api/common/openclaw/xhs/push
 * Receive scraped materials from OpenClaw
 */
router.post('/xhs/push', async (req, res) => {
  const { 'x-openclaw-key': apiKey, 'x-openclaw-timestamp': timestamp, 'x-openclaw-sign': sign, 'x-openclaw-batch-id': batchId } = req.headers

  // --- Auth: signature verification ---
  if (!apiKey || !timestamp || !sign || !batchId) {
    return res.status(401).json({ code: 'AUTH_MISSING_HEADERS', message: 'Missing required headers' })
  }

  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    return res.status(401).json({ code: 'AUTH_TIMESTAMP_EXPIRED', message: 'Timestamp expired' })
  }

  const expectedSign = crypto.createHash('sha256')
    .update(`${apiKey}${timestamp}${batchId}${OPENCLAW_API_SECRET}`)
    .digest('hex')

  if (sign !== expectedSign) {
    return res.status(401).json({ code: 'AUTH_SIGN_INVALID', message: 'Invalid signature' })
  }

  // --- Check batch idempotency ---
  const existingBatch = db.prepare('SELECT id FROM xhs_scrape_batch WHERE batch_id=?').get(batchId)
  if (existingBatch) {
    return res.json({
      code: 0, message: 'ok (duplicate batch)',
      data: { batch_id: batchId, received: 0, duplicated: 0, accepted: 0, materials: [] }
    })
  }

  const { materials: payloadMaterials, scrape_time, keyword_set, total_scraped, after_filter } = req.body

  if (!payloadMaterials || !Array.isArray(payloadMaterials)) {
    return res.status(422).json({ code: 'INVALID_PARAMS', message: 'materials array is required' })
  }

  // --- Insert batch ---
  db.prepare(`INSERT INTO xhs_scrape_batch (batch_id, status, total_scraped, after_filter, keyword_set, started_at)
    VALUES (?, 'running', ?, ?, ?, datetime('now','localtime'))`)
    .run(batchId, total_scraped || 0, after_filter || 0, JSON.stringify(keyword_set || []))

  // --- Insert materials ---
  const insertMaterial = db.prepare(`
    INSERT OR IGNORE INTO xhs_external_material
    (batch_id, source_id, source_url, author_nickname, title, description, cover_image_url,
     publish_time, xhs_tags, likes, collects, comments, shares, heat_score, review_status, sync_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
  `)

  const insertImage = db.prepare(`
    INSERT INTO xhs_material_image (material_id, seq, original_url, image_hash, image_status, is_cover)
    VALUES (?, ?, ?, ?, 'pending', ?)
  `)

  const insertTag = db.prepare(`
    INSERT INTO material_tags (material_id, material_type, shape, tone, craft, decor, style, tag_source, confidence)
    VALUES (?, 'xhs', '', '', '', '', '', 'ai_prescan', '{}')
  `)

  let accepted = 0
  let duplicated = 0
  const materialResults = []

  const txn = db.transaction(() => {
    for (const mat of payloadMaterials) {
      const { source_id, source_url, author_nickname, title, description, cover_image_url,
        images, engagement, publish_time, tags } = mat

      if (!source_id || !source_url) continue

      const heatScore = (engagement?.likes || 0) * 1

      const result = insertMaterial.run(
        batchId, source_id, source_url, author_nickname || '', title || '', description || '',
        cover_image_url || '', publish_time || null,
        JSON.stringify(tags || []),
        engagement?.likes || 0, engagement?.collects || 0,
        engagement?.comments || 0, engagement?.shares || 0,
        Math.round(heatScore * 100) / 100
      )

      if (result.changes === 0) {
        duplicated++
        materialResults.push({ source_id, internal_id: null, status: 'duplicated' })
        continue
      }

      const materialId = result.lastInsertRowid
      accepted++

      // Insert cover image
      const imgHash = crypto.createHash('sha256').update(source_id || '').digest('hex').substring(0, 16)
      insertImage.run(materialId, 1, cover_image_url || '', imgHash, 1)

      // Insert additional images
      if (images && Array.isArray(images)) {
        images.forEach((url, idx) => {
          if (idx === 0 && url === cover_image_url) return
          const hash = crypto.createHash('sha256').update(url || '').digest('hex').substring(0, 16)
          insertImage.run(materialId, idx + 2, url, hash, 0)
        })
      }

      // Create empty tag placeholder
      insertTag.run(materialId)

      materialResults.push({ source_id, internal_id: materialId, status: 'accepted' })
    }
  })

  txn()

  // Update batch record
  db.prepare(`UPDATE xhs_scrape_batch SET
    received=?, duplicated=?, accepted=?, status='completed', completed_at=datetime('now','localtime')
    WHERE batch_id=?`).run(accepted + duplicated, duplicated, accepted, batchId)

  // Trigger async processing: image download + AI tagging
  if (accepted > 0) {
    setImmediate(async () => {
      try {
        const newMaterialIds = materialResults
          .filter(r => r.status === 'accepted' && r.internal_id)
          .map(r => r.internal_id)

        for (const id of newMaterialIds) {
          await processMaterialImages(id)
        }
        await runAITagging(newMaterialIds)
        console.log(`[OpenClaw] Async processing complete for batch ${batchId}`)
      } catch (err) {
        console.error(`[OpenClaw] Async processing error for batch ${batchId}:`, err)
      }
    })
  }

  return res.json({
    code: 0, message: 'ok',
    data: { batch_id: batchId, received: payloadMaterials.length, duplicated, accepted, materials: materialResults }
  })
})

/**
 * POST /api/common/openclaw/xhs/trigger
 *
 * OpenClaw-triggered scraping with manual login.
 *
 * Flow:
 *   1. Launch visible Chrome → XHS search/login page
 *   2. Operator manually logs in (QR code / phone)
 *   3. System searches with preset keywords
 *   4. Visits detail pages for full engagement data
 *   5. Filters: likes ≥ min_likes, collects ≥ min_collects
 *   6. Picks top 9 by heat score
 *   7. Inserts to DB → triggers async image processing + AI tagging
 *
 * Downstream (imageProcessor / aiTagger / review / sync) — UNCHANGED.
 */
router.post('/xhs/trigger', async (req, res) => {
  try {
    // Read config from DB
    const config = db.prepare('SELECT * FROM openclaw_config LIMIT 1').get()
    if (!config) {
      return res.status(422).json({ code: 'SCRAPE_CONFIG_EMPTY', message: '请先配置抓取关键词' })
    }

    // ── Phase 1: Scrape 20 posts with CDN cover downloads ──
    console.log('[OpenClaw] ===== Trigger: starting scrape + cover filter flow =====')
    const notes = await openclawLoginAndSearch(config)

    if (!notes || notes.length === 0) {
      return res.json({
        code: 0, message: '搜索完成但未找到符合阈值的美甲笔记',
        data: { batch_id: null, received: 0, duplicated: 0, accepted: 0, materials: [] }
      })
    }

    // ── Phase 2: Filter covers — discard 9-grid collages, keep only single-hand covers ──
    console.log(`[OpenClaw] Phase 2: Filtering ${notes.length} covers with vision model...`)
    const imagePaths = notes.map(n => n.coverImage)
    const filterResults = await filterCoverImages(imagePaths)

    const goodNotes = notes.filter((_, i) => filterResults[i]?.keep)
    console.log(`[OpenClaw] Cover filter: ${goodNotes.length}/${notes.length} covers passed`)

    if (goodNotes.length === 0) {
      return res.json({
        code: 0, message: '封面筛选后无可用素材',
        data: { batch_id: null, received: notes.length, duplicated: 0, accepted: 0, materials: [] }
      })
    }

    // ── Phase 3: Sort by likes, take top 9 ──
    goodNotes.sort((a, b) => b.likes - a.likes)
    const top9 = goodNotes.slice(0, 9)

    // ── Phase 4: Insert to DB ──
    const batchId = uuidv4()

    db.prepare(`INSERT INTO xhs_scrape_batch (batch_id, status, total_scraped, after_filter, keyword_set, started_at)
      VALUES (?, 'running', ?, ?, ?, datetime('now','localtime'))`)
      .run(batchId, notes.length, top9.length, JSON.stringify(JSON.parse(config.keywords || '[]')))

    const { accepted, duplicated, materialResults } = insertMaterialsToDB(batchId, top9)

    // Update batch record
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
          console.log(`[OpenClaw] AI tagging complete for trigger batch ${batchId}`)
        } catch (err) {
          console.error(`[OpenClaw] AI tagging error for trigger batch ${batchId}:`, err)
        }
      })
    }

    return res.json({
      code: 0, message: 'ok',
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
    console.error('[OpenClaw] Trigger failed:', err.message)
    return res.status(500).json({ code: 'OPENCLAW_TRIGGER_FAILED', message: `抓取流程失败: ${err.message}` })
  }
})

export default router
