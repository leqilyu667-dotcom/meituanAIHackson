import db from '../db.js'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const processedDir = path.join(__dirname, '..', 'public', 'processed')

if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir, { recursive: true })
}

/**
 * Download an image from URL and save to processed directory.
 * Returns { buffer, hash } or throws on failure.
 */
async function downloadImage(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const resp = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Referer': 'https://www.xiaohongshu.com/',
          'Accept': 'image/webp,image/*,*/*'
        }
      })

      clearTimeout(timeout)

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`)
      }

      const buffer = Buffer.from(await resp.arrayBuffer())

      if (buffer.length < 1000) {
        throw new Error(`Image too small: ${buffer.length} bytes`)
      }

      const hash = crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 16)
      return { buffer, hash }

    } catch (err) {
      console.error(`[ImageProcessor] Download attempt ${attempt + 1} failed: ${err.message}`)
      if (attempt === retries) throw err
      await new Promise(r => setTimeout(r, 2000))
    }
  }
}

/**
 * Process a single image record for a material.
 * Downloads the original_url image (XHS CDN), saves to disk, updates DB.
 */
async function processImage(materialId, imageRecord) {
  const { id: imageId, original_url, seq } = imageRecord

  try {
    db.prepare('UPDATE xhs_material_image SET image_status=? WHERE id=?')
      .run('processing', imageId)

    if (!original_url || !original_url.startsWith('http')) {
      db.prepare('UPDATE xhs_material_image SET image_status=?, process_error=? WHERE id=?')
        .run('failed', 'No valid URL', imageId)
      return { success: false, error: 'No valid URL' }
    }

    const { buffer, hash } = await downloadImage(original_url)

    const filename = `${materialId}_${seq}_${hash}.jpg`
    const thumbFilename = `${materialId}_${seq}_${hash}_thumb.jpg`
    const filePath = path.join(processedDir, filename)
    const thumbPath = path.join(processedDir, thumbFilename)

    fs.writeFileSync(filePath, buffer)
    fs.writeFileSync(thumbPath, buffer)

    const processedUrl = `/processed/${filename}`
    const thumbnailUrl = `/processed/${thumbFilename}`

    db.prepare(`UPDATE xhs_material_image SET
      image_status='processed', processed_url=?, thumbnail_url=?,
      image_hash=?, file_size=?, width=1024, height=1024
      WHERE id=?`).run(processedUrl, thumbnailUrl, hash, buffer.length, imageId)

    console.log(`[ImageProcessor] Material ${materialId}: saved (${(buffer.length / 1024).toFixed(1)}KB)`)
    return { success: true, processedUrl, thumbnailUrl }

  } catch (err) {
    console.error(`[ImageProcessor] Failed material ${materialId}:`, err.message)
    db.prepare('UPDATE xhs_material_image SET image_status=?, process_error=? WHERE id=?')
      .run('failed', err.message, imageId)
    return { success: false, error: err.message }
  }
}

export async function processMaterialImages(materialId) {
  const images = db.prepare('SELECT * FROM xhs_material_image WHERE material_id=? AND image_status=?')
    .all(materialId, 'pending')

  console.log(`[ImageProcessor] Processing ${images.length} images for material ${materialId}`)
  const results = []
  for (const img of images) {
    const result = await processImage(materialId, img)
    results.push(result)
  }
  return results
}

export async function processAllPendingImages() {
  const images = db.prepare(`
    SELECT i.* FROM xhs_material_image i
    JOIN xhs_external_material m ON m.id = i.material_id
    WHERE i.image_status = 'pending' AND m.is_deleted = 0
  `).all()

  console.log(`[ImageProcessor] Processing ${images.length} pending images`)
  for (const img of images) {
    await processImage(img.material_id, img)
  }
}
