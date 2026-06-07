import 'dotenv/config'
import db from './db.js'
import { filterCoverImages } from './services/aiTagger.js'

const materials = db.prepare(`
  SELECT m.id, m.title, i.processed_url as imagePath
  FROM xhs_external_material m
  JOIN xhs_material_image i ON i.material_id = m.id AND i.is_cover = 1
  WHERE m.is_deleted = 0 AND m.pool_status = 'raw'
`).all()

console.log(`Filtering ${materials.length} materials...`)

const imagePaths = materials.map(m => m.imagePath)
const results = await filterCoverImages(imagePaths)

let kept = 0
let removed = 0
for (let i = 0; i < materials.length; i++) {
  const r = results[i]
  if (r.keep) {
    kept++
    if (r.reason) console.log(`  KEEP #${materials[i].id}: ${r.reason}`)
  } else {
    removed++
    console.log(`  DISCARD #${materials[i].id}: ${r.reason}`)
    db.prepare('UPDATE xhs_external_material SET is_deleted = 1 WHERE id = ?').run(materials[i].id)
  }
}

console.log(`\nDone: ${kept} kept, ${removed} removed`)
process.exit(0)
