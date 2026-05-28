import db from '../db.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ARK_BASE = 'https://ark.cn-beijing.volces.com/api/v3'
const ARK_KEY = 'ark-0cae034f-bc13-4ac0-b78d-038a1cf63050-b8046'
const MODEL = 'doubao-seed-1-6-vision-250815'

/** Convert local image path to base64 data URL for ARK vision API */
function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null
  // Already a remote URL or data URL
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl
  // Local path — read file and convert to base64
  const filePath = path.join(__dirname, '..', 'public', imageUrl.replace(/^\/processed\//, 'processed/'))
  if (fs.existsSync(filePath)) {
    const buf = fs.readFileSync(filePath)
    const ext = path.extname(filePath).slice(1) || 'jpeg'
    return `data:image/${ext};base64,${buf.toString('base64')}`
  }
  return null
}

// Load allowed label values for prompt constraint
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

function buildPrompt(labelEnum) {
  return `你是一个美甲图像识别专家。请仔细观察这张美甲图片，按照以下五维标签体系给出分类结果。

## 标签约束（每个维度必须从给定选项中选择，不可超出范围）

- 甲型(shape): ${labelEnum.shape.join('、')}
- 色调(tone): ${labelEnum.tone.join('、')}
- 工艺(craft): ${labelEnum.craft.join('、')}（如果图片中看不出明显工艺特征，填空字符串""）
- 装饰元素(decor): ${labelEnum.decor.join('、')}（如果没有装饰元素，填写"无装饰"）
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
    "shape": 0.0~1.0的置信度,
    "tone": 0.0~1.0的置信度,
    "craft": 0.0~1.0的置信度,
    "decor": 0.0~1.0的置信度,
    "style": 0.0~1.0的置信度
  }
}`
}

/** Extract the first complete JSON object from text using brace-depth tracking */
function extractJSON(text) {
  const start = text.indexOf('{')
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < text.length; i++) {
    const ch = text[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (ch === '\\' && inString) {
      escaped = true
      continue
    }

    if (ch === '"') {
      inString = !inString
      continue
    }

    if (inString) continue

    if (ch === '{') depth++
    if (ch === '}') {
      depth--
      if (depth === 0) {
        return text.slice(start, i + 1)
      }
    }
  }

  return null
}

function parseResponse(text, labelEnum) {
  let jsonStr = text.trim()

  // Strip markdown code fences
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) jsonStr = fenceMatch[1].trim()

  // Extract first complete JSON object with proper nesting support
  const extracted = extractJSON(jsonStr)
  if (!extracted) {
    console.log('[AITagger] No JSON object found in response, marking as non-nail-art')
    return null
  }

  let parsed
  try {
    parsed = JSON.parse(extracted)
  } catch (err) {
    console.log(`[AITagger] JSON parse error: ${err.message} — raw: ${extracted.slice(0, 120)}`)
    return null
  }

  // Validate each dimension against allowed values
  const result = { shape: '', tone: '', craft: '', decor: '', style: '', confidence: {} }
  for (const dim of ['shape', 'tone', 'craft', 'decor', 'style']) {
    const val = parsed[dim] || ''
    const allowed = labelEnum[dim] || []

    if (dim === 'craft' && val === '') {
      result[dim] = ''
    } else if (allowed.includes(val)) {
      result[dim] = val
    } else {
      let best = allowed[0] || ''
      let bestDist = Infinity
      for (const a of allowed) {
        const dist = levenshtein(val, a)
        if (dist < bestDist) { bestDist = dist; best = a }
      }
      result[dim] = best || val
      console.log(`[AITagger] Dimension ${dim}: "${val}" not in enum, fallback to "${best}" (dist=${bestDist})`)
    }
  }

  // Parse confidence
  if (parsed.confidence && typeof parsed.confidence === 'object') {
    for (const dim of ['shape', 'tone', 'craft', 'decor', 'style']) {
      const c = parseFloat(parsed.confidence[dim])
      result.confidence[dim] = isNaN(c) ? 0.5 : Math.min(1, Math.max(0, c))
    }
  }

  return result
}

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

/**
 * Call ARK vision model to tag a single nail image.
 * @param {string} imageUrl — fully qualified URL to processed image
 * @returns {object} { shape, tone, craft, decor, style, confidence }
 */
async function tagSingleImage(imageUrl, retries = 1) {
  const labelEnum = loadLabelEnum()

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 120000)

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
              { type: 'text', text: buildPrompt(labelEnum) }
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
      console.log(`[AITagger] ARK response: ${content.slice(0, 200)}`)

      return parseResponse(content, labelEnum)

    } catch (err) {
      const reason = err.name === 'AbortError' ? 'timeout' : err.message
      console.error(`[AITagger] Attempt ${attempt + 1}/${retries + 1} failed (${reason})`)
      if (attempt === retries) throw err
      // Wait before retry
      await new Promise(r => setTimeout(r, 2000))
    }
  }
}

/**
 * Run AI pre-tagging for materials using the ARK vision model.
 * Tags ALL pending materials (overwrites existing tags with real AI results).
 *
 * @param {number[]|null} materialIds — specific material IDs, or null for all pending
 * @returns {number} count of successfully tagged materials
 */
export async function runAITagging(materialIds) {
  // Get materials that need tagging
  let rows
  if (materialIds && materialIds.length > 0) {
    const placeholders = materialIds.map(() => '?').join(',')
    rows = db.prepare(`
      SELECT DISTINCT m.id
      FROM xhs_external_material m
      WHERE m.id IN (${placeholders}) AND m.is_deleted = 0
    `).all(...materialIds)
  } else {
    rows = db.prepare(`
      SELECT DISTINCT m.id
      FROM xhs_external_material m
      WHERE m.is_deleted = 0 AND m.review_status = 'pending'
    `).all()
  }

  const ids = rows.map(r => r.id)
  if (ids.length === 0) {
    console.log('[AITagger] No materials to tag')
    return 0
  }

  console.log(`[AITagger] Starting AI tagging for ${ids.length} materials via ${MODEL}`)

  const labelEnum = loadLabelEnum()

  // Get image URL for each material
  const getImage = db.prepare(`
    SELECT processed_url, original_url FROM xhs_material_image
    WHERE material_id=? AND is_cover=1 AND image_status='processed'
    LIMIT 1
  `)

  const updateTag = db.prepare(`
    UPDATE material_tags SET shape=?, tone=?, craft=?, decor=?, style=?,
    tag_source='ai_prescan', confidence=?, updated_at=datetime('now','localtime')
    WHERE material_id=? AND is_current=1
  `)

  let tagged = 0

  for (const id of ids) {
    const img = getImage.get(id)

    // Resolve image URL — try local screenshot as base64 first, fallback to CDN
    const imageUrl = resolveImageUrl(img?.processed_url) || resolveImageUrl(img?.original_url)

    if (!imageUrl) {
      console.log(`[AITagger] Material ${id}: no image URL, skipping`)
      continue
    }

    console.log(`[AITagger] Tagging material ${id} with image: ${imageUrl.slice(0, 80)}...`)

    try {
      const tags = await tagSingleImage(imageUrl)

      // null means the model detected non-nail-art content
      if (tags === null) {
        console.log(`[AITagger] Material ${id}: non-nail-art content detected`)
        updateTag.run('', '', '', '', '', JSON.stringify({ error: 'non_nail_art' }), id)
        continue
      }

      // Only write if core dimensions have non-empty values
      if (!tags.shape || !tags.tone) {
        console.log(`[AITagger] Material ${id}: AI returned empty core tags, filling with rules`)
        fillWithRules(id, tags, labelEnum)
      }

      updateTag.run(
        tags.shape || '', tags.tone || '', tags.craft || '', tags.decor || '', tags.style || '',
        JSON.stringify(tags.confidence || {}),
        id
      )
      tagged++
      console.log(`[AITagger] Material ${id} tagged: ${tags.shape}/${tags.tone}/${tags.style} conf=${JSON.stringify(tags.confidence)}`)

    } catch (err) {
      console.error(`[AITagger] Material ${id} failed:`, err.message)
      // Mark as unlabeled — fall back to rule-based
      try {
        const existing = db.prepare('SELECT * FROM material_tags WHERE material_id=? AND is_current=1').get(id)
        if (existing && (!existing.style || existing.style === '')) {
          fillWithRules(id, {
            shape: existing.shape || '',
            tone: existing.tone || '',
            craft: existing.craft || '',
            decor: existing.decor || '',
            style: existing.style || '',
            confidence: { shape: 0, tone: 0, craft: 0, decor: 0, style: 0 }
          }, labelEnum)
          updateTag.run(
            existing.shape || '', existing.tone || '', existing.craft || '', existing.decor || '',
            existing.style || '',
            JSON.stringify({ shape: 0, tone: 0, craft: 0, decor: 0, style: 0, error: 'ai_timeout' }),
            id
          )
        }
      } catch (fallbackErr) {
        console.error(`[AITagger] Material ${id} rule fallback also failed:`, fallbackErr.message)
      }
    }
  }

  console.log(`[AITagger] Complete: ${tagged}/${ids.length} materials tagged by AI`)
  return tagged
}

/**
 * Fallback: fill missing dimensions using rule-based heuristics
 */
function fillWithRules(materialId, tags, labelEnum) {
  if ((!tags.style || tags.style === '') && tags.shape && tags.tone) {
    const rules = {
      '杏仁甲|裸色': '温柔风', '杏仁甲|亮色': '甜酷风', '杏仁甲|透色': '日式',
      '杏仁甲|红色系': '温柔风',
      '方圆甲|裸色': '简约风', '方圆甲|红色系': '法式', '方圆甲|金属': 'ins风',
      '圆甲|裸色': '简约风', '圆甲|冷色': '简约风', '圆甲|透色': '日式',
      '梯形甲|冷色': 'ins风', '梯形甲|红色系': '温柔风', '梯形甲|亮色': '甜酷风',
      '尖甲|金属': '欧美风', '尖甲|亮色': '甜酷风', '尖甲|红色系': '甜酷风',
      '建构延长|魔镜粉': '欧美风', '建构延长|裸色': '欧美风'
    }
    const key = `${tags.shape}|${tags.tone}`
    tags.style = rules[key] || '简约风'
  }
  if (!tags.craft || tags.craft === '') tags.craft = ''
  if (!tags.decor || tags.decor === '') tags.decor = '无装饰'
}

function buildFilterPrompt() {
  return `你是一个图片内容审核助手。请判断这张图片是否适合作为美甲标签识别的素材。

适合（回复 KEEP）：
- 图片展示1只手或1双手的美甲特写
- 手指和指甲清晰可见
- 美甲款式是画面主体

不适合（回复 DISCARD）：
- 九宫格拼图（多张图片拼接在一起）
- 多图组合、拼贴画
- 只有产品照片、没有真人手
- 对比图（before/after左右对比）
- 手部太小或距离太远看不清指甲细节
- 插画、卡通、纯文字图片

只回复 KEEP 或 DISCARD，不要包含其他文字。`
}

/**
 * Filter cover images using ARK vision model.
 * Keeps only covers showing a single hand or pair of hands (nail art close-ups).
 * Discards 9-grid collages, product photos, etc.
 *
 * @param {string[]} imagePaths — array of local file paths (e.g. /processed/xxx.jpg)
 * @returns {Promise<{keep: boolean, reason: string}[]>}
 */
export async function filterCoverImages(imagePaths) {
  const results = []

  for (const imagePath of imagePaths) {
    const imageUrl = resolveImageUrl(imagePath)
    if (!imageUrl) {
      console.log(`[CoverFilter] ${imagePath}: no image, DISCARD`)
      results.push({ keep: false, reason: 'no_image' })
      continue
    }

    try {
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
              { type: 'text', text: buildFilterPrompt() }
            ]
          }],
          max_tokens: 16,
          temperature: 0.1
        }),
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (!resp.ok) {
        const errBody = await resp.text().catch(() => '')
        console.log(`[CoverFilter] ${imagePath.slice(0, 50)}... API ${resp.status}: ${errBody.slice(0, 80)}`)
        results.push({ keep: false, reason: `api_error_${resp.status}` })
        continue
      }

      const data = await resp.json()
      const content = (data.choices?.[0]?.message?.content || '').trim().toUpperCase()
      const keep = content.includes('KEEP')
      console.log(`[CoverFilter] ${path.basename(imagePath)} → ${keep ? 'KEEP' : 'DISCARD'} (${content.slice(0, 30)})`)
      results.push({ keep, reason: content })

    } catch (err) {
      const reason = err.name === 'AbortError' ? 'timeout' : err.message
      console.log(`[CoverFilter] ${path.basename(imagePath)}: error (${reason})`)
      results.push({ keep: false, reason })
    }
  }

  const kept = results.filter(r => r.keep).length
  console.log(`[CoverFilter] Complete: ${kept}/${imagePaths.length} covers kept`)
  return results
}

export { tagSingleImage }
