import db from '../db.js'
import { v4 as uuidv4 } from 'uuid'
import { chromium } from 'playwright'

const XHS_BASE = 'https://www.xiaohongshu.com'
const EXPLORE_URL = `${XHS_BASE}/explore`

const NAIL_ART_KEYWORDS = [
  '美甲', 'nail', '美甲师', '美甲店', '指甲', '美甲教程',
  '美甲设计', '美甲款式', '美甲颜色', '美甲造型', '美甲艺术',
  '裸色美甲', '魔镜粉', '延长甲', '光疗', '甲油', '甲片',
  '短甲', '长甲', '方甲', '圆甲', '尖甲', '芭蕾甲',
  '猫眼', '渐变', '法式', '晕染', '大理石', '镜面',
  '钻饰', '贴钻', '贴纸', '手绘', '浮雕', '极光',
  '冰透', '腮红', '碎钻', '金箔', '贝壳', '亮片'
]

async function setupBrowser() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--headless=new'
    ]
  })

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN'
  })

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false })
  })

  const page = await context.newPage()
  return { browser, context, page }
}

function parseCount(text) {
  if (!text) return 0
  text = String(text).replace(/[^\d.万w]/g, '').trim()
  if (!text) return 0
  if (text.includes('万') || text.includes('w')) return Math.round(parseFloat(text) * 10000)
  const n = parseInt(text)
  return isNaN(n) ? 0 : n
}

function hasNailArtKeyword(title, author) {
  const text = `${title || ''} ${author || ''}`.toLowerCase()
  return NAIL_ART_KEYWORDS.some(kw => text.includes(kw.toLowerCase()))
}

/**
 * Extract note cards from the XHS explore page.
 * Each card is a <section class="note-item"> containing:
 *   - a.cover img → cover image (sns-webpic-qc.xhscdn.com)
 *   - a.title → title text
 *   - .name or .author → author name
 *   - .count or .like-wrapper → like count
 */
async function extractExploreCards(page) {
  return page.evaluate(() => {
    const cards = []
    const seen = new Set()

    document.querySelectorAll('section.note-item').forEach((section) => {
      // Find the cover link and image
      const coverLink = section.querySelector('a.cover[href*="/explore/"]')
      if (!coverLink) return

      const href = coverLink.href || coverLink.getAttribute('href') || ''
      const match = href.match(/\/explore\/([a-zA-Z0-9]+)/)
      if (!match || seen.has(match[1])) return

      const noteId = match[1]
      seen.add(noteId)

      // Cover image (first non-avatar image in the section)
      const coverImg = coverLink.querySelector('img')
      const coverImage = coverImg?.src || ''

      // Title
      const titleEl = section.querySelector('a.title')
      const title = titleEl?.textContent?.trim() || ''

      // Author
      const authorEl = section.querySelector('.name, .author')
      const author = authorEl?.textContent?.trim() || ''

      // Likes
      const likeEl = section.querySelector('.count, .like-wrapper')
      const likes = likeEl?.textContent?.trim() || '0'

      // Build the full URL
      const fullUrl = href.startsWith('http') ? href : `https://www.xiaohongshu.com${href}`

      cards.push({
        noteId,
        sourceUrl: fullUrl,
        coverImage,
        title,
        author,
        likes
      })
    })

    return cards
  })
}

/**
 * Main scrape: explore page → extract cards → filter → DB
 */
export async function runScrape(config) {
  const batchId = uuidv4()
  console.log(`[Scraper] ===== XHS scrape batch ${batchId} =====`)

  db.prepare(`INSERT INTO xhs_scrape_batch (batch_id, status, keyword_set, started_at)
    VALUES (?, 'running', ?, datetime('now','localtime'))`).run(batchId, JSON.stringify([]))

  let browser, context, page
  let allCards = []

  try {
    const setup = await setupBrowser()
    browser = setup.browser
    context = setup.context
    page = setup.page

    // 1. Navigate to XHS explore page
    console.log('[Scraper] Loading XHS explore page...')
    await page.goto(EXPLORE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(4000)

    // 2. Scroll to trigger lazy loading and get more cards
    console.log('[Scraper] Scrolling to load content...')
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.7))
      await page.waitForTimeout(2000)
    }

    // 3. Scroll back up and extract
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(1000)

    allCards = await extractExploreCards(page)
    console.log(`[Scraper] Extracted ${allCards.length} note cards`)

    // 4. Filter to cards with valid cover images (exclude avatar-only)
    const withImages = allCards.filter(c =>
      c.coverImage &&
      c.coverImage.includes('xhscdn') &&
      !c.coverImage.includes('avatar')
    )
    console.log(`[Scraper] ${withImages.length} cards have valid cover images`)

    // 5. Prefer nail art content, but also include general content for AI filtering
    const nailArt = withImages.filter(c => hasNailArtKeyword(c.title, c.author))
    const general = withImages.filter(c => !hasNailArtKeyword(c.title, c.author))
    console.log(`[Scraper] ${nailArt.length} nail-art related, ${general.length} general`)

    // Take all nail art + some general (up to 30 total)
    const selected = [...nailArt, ...general].slice(0, 30)

    // 6. Insert into database
    const enriched = selected.map(card => ({
      noteId: card.noteId,
      sourceUrl: card.sourceUrl,
      author: card.author || '小红书用户',
      title: card.title || '小红书笔记',
      description: card.title || '',
      coverImage: card.coverImage,
      allImages: [card.coverImage],
      likes: parseCount(card.likes),
      collects: 0,
      comments: 0,
      tags: [],
      publishTime: new Date().toISOString()
    }))

    console.log(`[Scraper] Processing ${enriched.length} notes`)

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

    const txn = db.transaction(() => {
      for (const note of enriched) {
        const heatScore = note.likes * 1 + note.collects * 2 + note.comments * 0.5

        const result = insertMaterial.run(
          batchId, note.noteId, note.sourceUrl,
          note.author, note.title, note.description,
          note.coverImage, note.publishTime,
          JSON.stringify(note.tags),
          note.likes, note.collects, note.comments,
          0, Math.round(heatScore * 100) / 100
        )

        if (result.changes === 0) { duplicated++; continue }

        const materialId = result.lastInsertRowid
        note.allImages.forEach((url, idx) => {
          insertImage.run(materialId, idx + 1, url, `xhs_${note.noteId}_${idx}`, idx === 0 ? 1 : 0)
        })
        insertTag.run(materialId)
        accepted++
      }
    })

    txn()

    // Update batch status
    db.prepare(`UPDATE xhs_scrape_batch SET
      status='completed', total_scraped=?, after_filter=?, received=?, duplicated=?, accepted=?,
      completed_at=datetime('now','localtime')
      WHERE batch_id=?`).run(
      enriched.length, enriched.length, accepted + duplicated, duplicated, accepted, batchId
    )

    console.log(`[Scraper] Done: ${accepted} accepted, ${duplicated} duplicated`)
    return { batchId, accepted, duplicated }

  } catch (err) {
    console.error(`[Scraper] FATAL: ${err.message}`)
    db.prepare(`UPDATE xhs_scrape_batch SET status='failed', error_message=? WHERE batch_id=?`)
      .run(err.message, batchId)
    return { batchId, accepted: 0, duplicated: 0, error: err.message }
  } finally {
    if (browser) { await browser.close().catch(() => {}); console.log('[Scraper] Browser closed') }
  }
}

export async function triggerScrape() {
  const config = db.prepare('SELECT * FROM openclaw_config LIMIT 1').get()
  if (!config) throw new Error('Scraping config not found')
  return runScrape(config)
}
