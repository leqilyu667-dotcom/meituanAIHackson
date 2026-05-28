import express from 'express'
import cors from 'cors'
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

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001

// Initialize database
initDatabase()

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Serve processed images
app.use('/processed', express.static(path.join(__dirname, 'public', 'processed')))

// API Routes
app.use('/api/common/openclaw', openclawRoutes)
app.use('/api/merchant/material', materialRoutes)
app.use('/api/merchant/label', labelRoutes)
app.use('/api/merchant', configRoutes)
app.use('/api/merchant/design', designRoutes)
app.use('/api/merchant/messages', messagesRoutes)
app.use('/api/merchant/order', orderRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
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
