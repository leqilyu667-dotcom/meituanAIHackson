import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDatabase } from './db.js'
import { startScheduler } from './cron/scheduler.js'

import openclawRoutes from './routes/openclaw.js'
import materialRoutes from './routes/material.js'
import labelRoutes from './routes/label.js'
import configRoutes from './routes/config.js'
import designRoutes from './routes/design.js'
import messagesRoutes from './routes/messages.js'
import orderRoutes from './routes/order.js'
import materialLibraryRoutes from './routes/materialLibrary.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001

// Initialize database
initDatabase()

// Ensure upload directories exist
import fs from 'fs'
fs.mkdirSync(path.join(__dirname, 'public', 'processed', 'designs'), { recursive: true })

const app = express()

// Middleware
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : true
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}))
app.use(express.json({ limit: '10mb' }))

// Rate limiting
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false })
const aiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { code: 'RATE_LIMITED', message: '请求过于频繁，请稍后重试' } })
app.use(globalLimiter)
app.use('/api/merchant/design/generate', aiLimiter)
app.use('/api/merchant/design/detect-tags', aiLimiter)

// Serve processed images
app.use('/processed', express.static(path.join(__dirname, 'public', 'processed')))

// Auth middleware
import { requireMerchantAuth } from './middleware/auth.js'

// API Routes
app.use('/api/common/openclaw', openclawRoutes) // external webhook, no auth (uses signature)

// All merchant routes require auth token
const merchantRouter = express.Router()
merchantRouter.use(requireMerchantAuth)
merchantRouter.use('/material', materialRoutes)
merchantRouter.use('/label', labelRoutes)
merchantRouter.use('/', configRoutes)
merchantRouter.use('/design', designRoutes)
merchantRouter.use('/messages', messagesRoutes)
merchantRouter.use('/order', orderRoutes)
merchantRouter.use('/material-library', materialLibraryRoutes)
app.use('/api/merchant', merchantRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve frontend static files in production
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/processed/')) return next()
  res.sendFile(path.join(distPath, 'index.html'))
})

// Start server
app.listen(PORT, async () => {
  console.log(`[Server] Nailia Merchant API running on http://localhost:${PORT}`)

  // Start cron scheduler (OpenClaw manages scraping trigger)
  startScheduler()

  // Log existing material count
  const { default: db } = await import('./db.js')
  const count = db.prepare('SELECT COUNT(*) as c FROM xhs_external_material WHERE is_deleted=0').get()
  console.log(`[Server] ${count.c} materials in database`)

  // Run AI tagging on any untagged materials from previous incomplete runs
  try {
    const untagged = db.prepare(`
      SELECT COUNT(*) as c FROM xhs_external_material m
      JOIN material_tags t ON t.material_id = m.id AND t.is_current = 1
      WHERE m.is_deleted = 0 AND (t.shape IS NULL OR t.shape = '')
    `).get()
    if (untagged.c > 0) {
      console.log(`[Server] ${untagged.c} materials need AI tagging — running...`)
      const { runAITagging } = await import('./services/aiTagger.js')
      await runAITagging()
    }
  } catch (err) {
    console.error('[Server] AI tagging on startup failed:', err.message)
  }
})
