import db from '../db.js'

/**
 * Sync an approved material to downstream targets:
 * 1. AI try-on material pool
 * 2. Trending material library
 * 3. Label heat counter update
 * 4. Cross-module data sync (label trend)
 */

export function syncApprovedMaterial(materialId) {
  const material = db.prepare(`
    SELECT m.*, t.shape, t.tone, t.craft, t.decor, t.style
    FROM xhs_external_material m
    JOIN material_tags t ON t.material_id = m.id AND t.is_current = 1
    WHERE m.id = ? AND m.is_deleted = 0
  `).get(materialId)

  if (!material) {
    return { success: false, error: 'Material not found' }
  }

  if (material.review_status !== 'approved') {
    return { success: false, error: 'Material not approved' }
  }

  const results = {}
  const errors = []

  // Mark as syncing
  db.prepare('UPDATE xhs_external_material SET sync_status=? WHERE id=?')
    .run('syncing', materialId)

  try {
    // 1. Sync to try-on pool (in production: insert into tryon_material_pool)
    results.tryonPool = syncToTryOnPool(material)
    if (!results.tryonPool.success) errors.push('tryonPool')

    // 2. Sync to trending library
    results.trendingLibrary = syncToTrendingLibrary(material)
    if (!results.trendingLibrary.success) errors.push('trendingLibrary')

    // 3. Update label heat counters
    results.labelHeat = updateLabelHeat(material)
    if (!results.labelHeat.success) errors.push('labelHeat')

    // 4. Sync tag trend data
    results.tagTrend = syncTagTrend(material)
    if (!results.tagTrend.success) errors.push('tagTrend')

    // Determine final sync status
    if (errors.length === 0) {
      db.prepare('UPDATE xhs_external_material SET sync_status=? WHERE id=?')
        .run('synced', materialId)
    } else if (errors.length < 4) {
      db.prepare('UPDATE xhs_external_material SET sync_status=? WHERE id=?')
        .run('partial', materialId)
    } else {
      db.prepare('UPDATE xhs_external_material SET sync_status=? WHERE id=?')
        .run('failed', materialId)
    }

    return { success: errors.length === 0, results, errors }
  } catch (err) {
    console.error(`[SyncManager] Sync failed for material ${materialId}:`, err)
    db.prepare('UPDATE xhs_external_material SET sync_status=? WHERE id=?')
      .run('failed', materialId)
    return { success: false, error: err.message }
  }
}

function syncToTryOnPool(material) {
  try {
    // In production: INSERT INTO tryon_material_pool
    // For now, we log the sync and return success
    console.log(`[SyncManager] Material ${material.id} synced to try-on pool`)
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

function syncToTrendingLibrary(material) {
  try {
    // In production: INSERT INTO trending_material_library
    console.log(`[SyncManager] Material ${material.id} synced to trending library`)
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

function updateLabelHeat(material) {
  try {
    // In production: UPSERT label_heat_counter for each dimension
    const dims = [
      { dim: 'shape', val: material.shape },
      { dim: 'tone', val: material.tone },
      { dim: 'craft', val: material.craft },
      { dim: 'decor', val: material.decor },
      { dim: 'style', val: material.style }
    ]
    for (const d of dims) {
      if (d.val) {
        console.log(`[SyncManager] Label heat +1: ${d.dim}=${d.val}`)
      }
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

function syncTagTrend(material) {
  try {
    // In production: UPSERT xhs_tag_trend
    console.log(`[SyncManager] Tag trend synced for material ${material.id}`)
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
