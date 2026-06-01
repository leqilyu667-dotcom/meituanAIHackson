import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const XHS_BASE = 'https://www.xiaohongshu.com'
const SCREENSHOT_DIR = path.join(__dirname, '..', 'public', 'processed')

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
        return { loggedIn: true, cardCount: cards.length, stage: 'ok' }
      }

      return { loggedIn: false, stage: url.slice(0, 60) }
    })

    if (state.loggedIn) {
      console.log(`[Scraper] 登录成功 — ${state.cardCount} 张卡片`)
      return true
    }

    const elapsed = Math.round((Date.now() - start) / 1000)
    if (elapsed % 15 === 0) {
      console.log(`[Scraper] 等待登录... (${elapsed}s) — ${state.stage}`)
    }

    await new Promise(r => setTimeout(r, 2000))
  }

  throw new Error('登录超时 — 请在 5 分钟内完成扫码登录')
}

/**
 * Download a CDN cover image using the browser's session cookies.
 */
async function downloadCoverImage(page, cdnUrl, noteId) {
  const filepath = path.join(SCREENSHOT_DIR, `${noteId}.jpg`)

  if (fs.existsSync(filepath)) {
    const stat = fs.statSync(filepath)
    if (stat.size > 1000) return filepath
  }

  try {
    const resp = await page.request.get(cdnUrl, { timeout: 20000 })
    if (resp.ok()) {
      const buffer = await resp.body()
      if (buffer.length > 500) {
        fs.writeFileSync(filepath, buffer)
        return filepath
      }
    }
  } catch (err) {
    console.log(`[Scraper]   ↳ ${noteId}: 下载失败 (${err.message.slice(0, 50)})`)
  }
  return null
}

/**
 * Search one keyword on XHS, extract top N results with covers + descriptions.
 * Returns array of { noteId, sourceUrl, description, likes, coverImage, cdnCoverUrl }
 */
async function searchKeyword(page, keyword, targetCount) {
  const searchUrl = `${XHS_BASE}/search_result?keyword=${encodeURIComponent(keyword)}&source=web_search_result_notes&type=51`
  console.log(`[Scraper] 搜索: "${keyword}" → ${searchUrl}`)
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 })
  await page.waitForTimeout(3000)

  // Scroll to load more results
  const scrollCount = Math.ceil(targetCount / 4)
  for (let i = 0; i < scrollCount; i++) {
    await page.evaluate(() => window.scrollBy(0, 500))
    await page.waitForTimeout(800)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(1000)

  // Extract cards from DOM
  const cards = await page.evaluate(() => {
    const results = []
    document.querySelectorAll('section.note-item').forEach((section) => {
      const exploreA = section.querySelector('a[href*="/explore/"]')
      const href = exploreA?.getAttribute('href') || ''
      const noteIdMatch = href.match(/\/explore\/([a-zA-Z0-9]+)/)
      if (!noteIdMatch) return

      const noteId = noteIdMatch[1]
      const img = section.querySelector('img')
      let cdnCoverUrl = img?.src || img?.getAttribute('data-src') || ''
      if (cdnCoverUrl) cdnCoverUrl = cdnCoverUrl.replace(/\?.*$/, '')

      // Extract likes
      let likes = 0
      for (const span of section.querySelectorAll('span')) {
        if (span.children.length > 0) continue
        const text = span.textContent.trim()
        const m = text.match(/^([\d,.]+)\s*(万|w)?$/)
        if (m) {
          const num = parseFloat(m[1].replace(/,/g, ''))
          if (!isNaN(num)) {
            likes = m[2] ? Math.round(num * 10000) : Math.round(num)
            break
          }
        }
      }
      if (!likes) {
        const nums = (section.textContent || '').match(/\d{3,}/g)
        if (nums) likes = parseInt(nums[nums.length - 1]) || 0
      }

      // Extract title
      const titleEl = section.querySelector('.title, [class*="title"], h3')
      const title = titleEl?.textContent?.trim() || ''

      results.push({ noteId, cdnCoverUrl, likes, title })
    })
    return results
  })

  // Sort by likes, take top N
  cards.sort((a, b) => b.likes - a.likes)
  const top = cards.slice(0, targetCount)
  console.log(`[Scraper] "${keyword}": ${cards.length} 条提取, top${targetCount} 取前 ${top.length}`)
  return top
}

/**
 * ─── BATCH SCRAPE: Two keywords, each top 50 ───
 *
 * 1. Open Chrome → login once
 * 2. For each keyword: search → scroll → extract top 50 with covers + descriptions
 * 3. Download CDN cover images
 * 4. Return merged results
 */
export async function batchScrape(config) {
  const keywords = ['美甲', '春日美甲']
  const perKeyword = 10

  console.log('[Scraper] ===== 批量抓取模式 =====')
  console.log(`[Scraper] 关键词: ${keywords.join(' + ')} × ${perKeyword}`)

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
    // ── Login once ──
    const firstUrl = `${XHS_BASE}/search_result?keyword=${encodeURIComponent(keywords[0])}&source=web_search_result_notes&type=51`
    await page.goto(firstUrl, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForTimeout(3000)
    console.log('[Scraper] >>> 请在浏览器中扫码登录小红书 <<<')
    await waitForLogin(page, 300000)

    // ── Search each keyword ──
    const allCards = []
    for (const kw of keywords) {
      const cards = await searchKeyword(page, kw, perKeyword)
      allCards.push(...cards.map(c => ({ ...c, keyword: kw })))
    }

    // Deduplicate by noteId
    const seen = new Set()
    const unique = allCards.filter(c => {
      if (seen.has(c.noteId)) return false
      seen.add(c.noteId)
      return true
    })

    console.log(`[Scraper] 去重后共 ${unique.length} 条`)

    // ── Download covers ──
    console.log('[Scraper] 下载封面...')
    const results = []

    for (let i = 0; i < unique.length; i++) {
      const card = unique[i]
      const downloaded = card.cdnCoverUrl
        ? await downloadCoverImage(page, card.cdnCoverUrl, card.noteId)
        : null

      if (!downloaded) continue

      results.push({
        noteId: card.noteId,
        sourceUrl: `${XHS_BASE}/explore/${card.noteId}`,
        author: '小红书用户',
        title: card.title || `小红书笔记 ${card.noteId.slice(0, 8)}`,
        description: '',
        coverImage: `/processed/${card.noteId}.jpg`,
        cdnCoverUrl: card.cdnCoverUrl,
        allImages: [`/processed/${card.noteId}.jpg`],
        likes: card.likes,
        tags: [],
        publishTime: new Date().toISOString(),
        keyword: card.keyword
      })
    }

    console.log(`[Scraper] 完成 — ${results.length}/${unique.length} 条入库`)
    return results

  } finally {
    await browser.close().catch(() => {})
    console.log('[Scraper] 浏览器已关闭')
  }
}
