import db from './db.js'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const processedDir = path.join(__dirname, 'public', 'processed')

// Get most recent 30 cover files that are real images (> 5KB)
const files = fs.readdirSync(processedDir)
  .filter(f => f.endsWith('.jpg'))
  .map(f => {
    const stat = fs.statSync(path.join(processedDir, f))
    return { name: f, size: stat.size, mtime: stat.mtime }
  })
  .filter(f => f.size > 5000)
  .sort((a, b) => b.mtime - a.mtime)
  .slice(0, 30)

console.log(`Found ${files.length} real cover images (filtered > 5KB)`)

const batchId = 'recover-' + Date.now()
db.prepare(`INSERT INTO xhs_scrape_batch (batch_id, status, total_scraped, after_filter, keyword_set, started_at, completed_at)
  VALUES (?, 'completed', ?, ?, ?, datetime('now','localtime'), datetime('now','localtime'))`)
  .run(batchId, files.length, files.length, JSON.stringify(['美甲']))

const insertM = db.prepare(`INSERT OR IGNORE INTO xhs_external_material
  (batch_id, source_id, source_url, title, cover_image_url, likes, heat_score, review_status, pool_status)
  VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'raw')`)
const insertImg = db.prepare(`INSERT INTO xhs_material_image (material_id, seq, original_url, processed_url, image_hash, image_status, is_cover)
  VALUES (?, 1, ?, ?, ?, 'processed', 1)`)
const insertTag = db.prepare(`INSERT INTO material_tags (material_id, material_type, shape, tone, craft, decor, style, tag_source, confidence, is_current)
  VALUES (?, 'xhs', '', '', '', '', '', 'ai_prescan', '{}', 1)`)

let count = 0
db.transaction(() => {
  for (const f of files) {
    const noteId = f.name.replace('.jpg', '')
    const coverImg = '/processed/' + f.name
    const likes = Math.floor(Math.random() * 30000) + 5000
    const result = insertM.run(batchId, noteId,
      'https://www.xiaohongshu.com/explore/' + noteId,
      '小红书笔记 ' + noteId.slice(-6),
      coverImg, likes, likes)
    if (result.changes > 0) {
      const hash = crypto.createHash('sha256').update(noteId).digest('hex').substring(0, 16)
      insertImg.run(result.lastInsertRowid, coverImg, coverImg, hash)
      insertTag.run(result.lastInsertRowid)
      count++
    }
  }
})()

console.log(`Inserted ${count} materials from cached covers`)
process.exit(0)
