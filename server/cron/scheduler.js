import cron from 'node-cron'
import db from '../db.js'
import { processAllPendingImages } from '../services/imageProcessor.js'

/**
 * Start all scheduled tasks.
 *
 * Scraping is triggered externally by OpenClaw (POST /api/common/openclaw/xhs/trigger).
 * The node-cron scheduler only handles maintenance tasks (image processing).
 */
export function startScheduler() {
  const config = db.prepare('SELECT * FROM openclaw_config LIMIT 1').get()
  if (!config || !config.schedule_enabled) {
    console.log('[Scheduler] Schedule disabled — cron maintenance skipped')
    return
  }

  console.log(`[Scheduler] OpenClaw-managed scraping | cron: ${config.schedule_cron || '0 3 * * 1'}`)
  console.log('[Scheduler] Cron handles: daily image processing cleanup')

  // Daily image processing cleanup at 4am
  cron.schedule('0 4 * * *', async () => {
    console.log('[Scheduler] Running daily image processing check...')
    try {
      await processAllPendingImages()
    } catch (err) {
      console.error('[Scheduler] Image cleanup error:', err.message)
    }
  }, { timezone: 'Asia/Shanghai' })

  console.log('[Scheduler] Cron jobs started')
}
