import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const XHS_BASE = 'https://www.xiaohongshu.com'
const SCREENSHOT_DIR = path.join(__dirname, '..', 'public', 'processed')

function parseCount(text) {
  if (!text) return 0
  text = String(text).replace(/[^\d.万w]/g, '').trim()
  if (!text) return 0
  if (text.includes('万') || text.includes('w')) return Math.round(parseFloat(text) * 10000)
  const n = parseInt(text)
  return isNaN(n) ? 0 : n
}

/**
 * Poll until operator completes login.
 */
async function waitForLogin(page, timeoutMs = 300000) {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    const state = await page.evaluate(() => {
      const body = document.body?.innerText || ''
      const url = window.location.href

      if (body.includes('登录后查看搜索结果')) {
        return { loggedIn: false, stage: 'search_login_wall' }
      }
      if (body.includes('手机号登录') && body.includes('验证码')) {
        return { loggedIn: false, stage: 'login_popup' }
      }

      const cards = document.querySelectorAll('section.note-item')
      if (url.includes('search_result') && cards.length > 0) {
        const samples = []
        cards.forEach((c, i) => { if (i < 3) samples.push(c.textContent?.slice(0, 25)) })
        return { loggedIn: true, cardCount: cards.length, sample: samples.join(' | ') }
      }

      return { loggedIn: false, stage: url.slice(0, 60) }
    })

    if (state.loggedIn) {
      console.log(`[Scraper] 登录成功 — ${state.cardCount} 张卡片. ${state.sample}`)
      return true
    }

    const elapsed = Math.round((Date.now() - start) / 1000)
    if (elapsed % 15 === 0 || elapsed === 0) {
      console.log(`[Scraper] 等待登录... (${elapsed}s / ${timeoutMs / 1000}s) — ${state.stage}`)
    }

    await new Promise(r => setTimeout(r, 2000))
  }

  throw new Error('登录超时 — 请在 5 分钟内完成扫码登录')
}

/**
 * Apply search filters: image posts only, sort by most likes, within 1 week.
 * Clicks the filter UI elements on the search page.
 */
async function applySearchFilters(page) {
  console.log('[Scraper] 应用筛选条件: 图文 + 最热 + 一周内')

  // Try to find and click the "筛选" button to open filter panel
  const filterSelectors = [
    'div:has-text("筛选")',
    'span:has-text("筛选")',
    '[class*="filter"]',
    'text=筛选',
  ]

  let filterOpened = false
  for (const sel of filterSelectors) {
    try {
      const btn = page.locator(sel).first()
      if (await btn.isVisible({ timeout: 2000 })) {
        await btn.click()
        await page.waitForTimeout(1500)
        filterOpened = true
        console.log('[Scraper] 筛选面板已打开')
        break
      }
    } catch { /* try next selector */ }
  }

  // Click "图文" for image posts only
  if (filterOpened) {
    try {
      const imgFilter = page.locator('text=图文').first()
      if (await imgFilter.isVisible({ timeout: 2000 })) {
        await imgFilter.click()
        await page.waitForTimeout(1500)
        console.log('[Scraper]   ✓ 图文')
      }
    } catch { console.log('[Scraper]   ⚠️ 图文筛选不可用') }
  }

  // Click "最热" for sort by most likes
  try {
    const hotFilter = page.locator('text=最热').first()
    if (await hotFilter.isVisible({ timeout: 2000 })) {
      await hotFilter.click()
      await page.waitForTimeout(1500)
      console.log('[Scraper]   ✓ 最热')
    }
  } catch { console.log('[Scraper]   ⚠️ 最热筛选不可用') }

  // Click "一周内" for within 1 week
  try {
    const weekFilter = page.locator('text=一周内').first()
    if (await weekFilter.isVisible({ timeout: 2000 })) {
      await weekFilter.click()
      await page.waitForTimeout(1500)
      console.log('[Scraper]   ✓ 一周内')
    }
  } catch { console.log('[Scraper]   ⚠️ 一周内筛选不可用') }

  // Wait for filtered results to load
  await page.waitForTimeout(2000)
}

/**
 * Download a CDN cover image using the browser's session cookies.
 * Returns the file path on success, null on failure.
 */
async function downloadCoverImage(page, cdnUrl, noteId) {
  const filepath = path.join(SCREENSHOT_DIR, `${noteId}.jpg`)

  // Skip if already downloaded
  if (fs.existsSync(filepath)) {
    const stat = fs.statSync(filepath)
    if (stat.size > 1000) {
      console.log(`[Scraper]   ↳ ${noteId}: already cached (${stat.size} bytes)`)
      return filepath
    }
  }

  try {
    const resp = await page.request.get(cdnUrl, { timeout: 20000 })
    if (resp.ok()) {
      const buffer = await resp.body()
      if (buffer.length > 500) {
        fs.writeFileSync(filepath, buffer)
        console.log(`[Scraper]   ↳ ${noteId}: downloaded CDN image (${buffer.length} bytes)`)
        return filepath
      }
    }
    console.log(`[Scraper]   ↳ ${noteId}: CDN download returned ${resp.status()} / ${buffer?.length || 0} bytes`)
  } catch (err) {
    console.log(`[Scraper]   ↳ ${noteId}: CDN download failed (${err.message.slice(0, 60)})`)
  }
  return null
}

/**
 * ─── REWORKED FLOW ───
 *
 * 1. Open Chrome → navigate to XHS search for "爆款美甲"
 * 2. Wait for manual login
 * 3. Apply filters: image posts, most likes, within 1 week
 * 4. Scroll to load 20+ results
 * 5. Extract noteId + CDN cover URL + likes from DOM
 * 6. Download CDN cover images at full resolution (via browser cookies)
 * 7. Sort by likes, return top 20
 */
export async function openclawLoginAndSearch(config) {
  const keywords = JSON.parse(config.keywords || '["美甲爆款","春日美甲"]')
  const targetCount = 20

  // Combine up to 3 keywords into one search query (XHS supports space-separated terms)
  const searchQuery = keywords.slice(0, 3).join(' ')

  console.log('[Scraper] ===== 新流程：CDN原图下载 + 20张封面 =====')
  console.log(`[Scraper] 关键词: ${searchQuery}`)
  console.log(`[Scraper] 目标数量: ${targetCount}`)

  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--start-maximized']
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

  try {
    // ── Step 1: Navigate to search page ──
    const searchUrl = `${XHS_BASE}/search_result?keyword=${encodeURIComponent(searchQuery)}&source=web_search_result_notes&type=51`
    console.log(`[Scraper] 打开搜索页: ${searchUrl}`)
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForTimeout(3000)

    // ── Step 2: Wait for manual login ──
    console.log('[Scraper] >>> 请在浏览器中扫码登录小红书 <<<')
    await waitForLogin(page, 300000)

    // ── Step 3: Apply filters ──
    await applySearchFilters(page)

    // ── Step 4: Scroll to load 20+ results ──
    console.log('[Scraper] 滚动加载更多结果...')
    for (let i = 0; i < 15; i++) {
      await page.evaluate(() => window.scrollBy(0, 500))
      await page.waitForTimeout(1000)
    }
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(1000)

    // ── Step 5: Extract noteId + CDN cover URL + likes ──
    const cardMeta = await page.evaluate(() => {
      const cards = []
      document.querySelectorAll('section.note-item').forEach((section, idx) => {
        const exploreA = section.querySelector('a[href*="/explore/"]')
        const href = exploreA?.getAttribute('href') || ''
        const noteIdMatch = href.match(/\/explore\/([a-zA-Z0-9]+)/)
        if (!noteIdMatch) return

        const noteId = noteIdMatch[1]

        // Get highest-resolution CDN cover image
        const img = section.querySelector('img')
        let cdnCoverUrl = img?.src || img?.getAttribute('data-src') || ''

        // Try to get higher-res version from srcset or other attributes
        if (cdnCoverUrl) {
          // Remove size constraints to get full resolution
          cdnCoverUrl = cdnCoverUrl.replace(/\?.*$/, '')
        }

        // Parse likes count from XHS search card.
        // XHS search cards show likes as a plain number (no "赞" label).
        // The number typically appears in a dedicated span or at the end of textContent.
        function parseCountEl(text) {
          if (!text) return 0
          text = text.trim()
          const m = text.match(/^([\d,.]+)\s*(万|w)?$/)
          if (!m) return 0
          const num = parseFloat(m[1].replace(/,/g, ''))
          if (isNaN(num)) return 0
          if (m[2]) return Math.round(num * 10000)
          return Math.round(num)
        }

        let likes = 0

        // Strategy 1: find leaf <span> elements that contain only a number
        const allSpans = section.querySelectorAll('span')
        for (const span of allSpans) {
          if (span.children.length > 0) continue
          const val = parseCountEl(span.textContent || '')
          if (val > 0) { likes = val; break }
        }

        // Strategy 2: fallback — find last standalone number in textContent
        // XHS format: "...authorMM-DDlikes" where likes is the trailing number
        if (!likes) {
          const text = section.textContent || ''
          // Look for the last occurrence of 3+ digit number
          const numMatches = text.match(/\d{3,}/g)
          if (numMatches) {
            const last = numMatches[numMatches.length - 1]
            likes = parseInt(last) || 0
          }
        }

        cards.push({
          index: idx, noteId, cdnCoverUrl,
          likes,
          rawText: (section.textContent || '').slice(0, 80)
        })
      })
      return cards
    })

    console.log(`[Scraper] 提取到 ${cardMeta.length} 个 noteId`)

    // Debug: print raw text of first 3 cards to diagnose engagement extraction
    console.log('[Scraper] === 前3张卡片 rawText（用于诊断互动数据提取） ===')
    cardMeta.slice(0, 3).forEach((c, i) => {
      console.log(`  [${i}] noteId=${c.noteId} likes=${c.likes}`)
      console.log(`      rawText: "${c.rawText}"`)
    })

    if (cardMeta.length === 0) {
      console.log('[Scraper] ⚠️ 未提取到任何卡片，请检查页面状态')
      return []
    }

    // ── Step 6: Sort by likes, take top 20 ──
    cardMeta.sort((a, b) => b.likes - a.likes)
    const top20 = cardMeta.slice(0, targetCount)

    console.log('[Scraper] Top 20 笔记预览:')
    top20.forEach((c, i) => console.log(`  ${i + 1}. ${c.noteId} | ❤️${c.likes} | ${c.cdnCoverUrl?.slice(0, 50)}...`))

    // ── Step 7: Download CDN cover images at full resolution ──
    console.log('[Scraper] 下载 CDN 封面原图...')
    const results = []

    for (const card of top20) {
      if (!card.cdnCoverUrl) {
        console.log(`[Scraper]   ⚠️ ${card.noteId}: 无 CDN URL，跳过`)
        continue
      }

      const downloaded = await downloadCoverImage(page, card.cdnCoverUrl, card.noteId)

      if (!downloaded) {
        console.log(`[Scraper]   ⚠️ ${card.noteId}: 下载失败，跳过`)
        continue
      }

      results.push({
        noteId: card.noteId,
        sourceUrl: `${XHS_BASE}/explore/${card.noteId}`,
        author: '小红书用户',
        title: `小红书笔记 ${card.noteId.slice(0, 8)}`,
        description: '',
        coverImage: `/processed/${card.noteId}.jpg`,
        cdnCoverUrl: card.cdnCoverUrl,
        allImages: [`/processed/${card.noteId}.jpg`],
        likes: card.likes,
        tags: [],
        publishTime: new Date().toISOString()
      })
    }

    console.log(`[Scraper] 完成 — ${results.length}/${targetCount} 张封面下载成功`)
    return results

  } finally {
    await browser.close().catch(() => {})
    console.log('[Scraper] 浏览器已关闭')
  }
}
