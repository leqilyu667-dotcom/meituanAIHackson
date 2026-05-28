import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'data.db')

const db = new Database(dbPath)

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS openclaw_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keywords TEXT NOT NULL DEFAULT '["美甲爆款","显白美甲","春日美甲","猫眼美甲","渐变美甲"]',
      exclude_keywords TEXT NOT NULL DEFAULT '["穿搭","护肤","美妆","发型","减肥"]',
      min_likes INTEGER NOT NULL DEFAULT 100,
      min_collects INTEGER NOT NULL DEFAULT 50,
      schedule_cron TEXT NOT NULL DEFAULT '0 3 * * 1',
      schedule_enabled INTEGER NOT NULL DEFAULT 1,
      max_per_batch INTEGER NOT NULL DEFAULT 200,
      date_range_days INTEGER NOT NULL DEFAULT 7,
      updated_by TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS xhs_scrape_batch (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      total_scraped INTEGER,
      after_filter INTEGER,
      received INTEGER,
      duplicated INTEGER NOT NULL DEFAULT 0,
      accepted INTEGER NOT NULL DEFAULT 0,
      keyword_set TEXT,
      error_message TEXT,
      started_at TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS xhs_external_material (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id TEXT NOT NULL,
      source_id TEXT UNIQUE NOT NULL,
      source_url TEXT NOT NULL,
      author_nickname TEXT,
      title TEXT,
      description TEXT,
      cover_image_url TEXT,
      publish_time TEXT,
      xhs_tags TEXT,
      likes INTEGER NOT NULL DEFAULT 0,
      collects INTEGER NOT NULL DEFAULT 0,
      comments INTEGER NOT NULL DEFAULT 0,
      shares INTEGER NOT NULL DEFAULT 0,
      heat_score REAL NOT NULL DEFAULT 0.0,
      review_status TEXT NOT NULL DEFAULT 'pending',
      reviewed_by TEXT,
      reviewed_at TEXT,
      reject_reason TEXT,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS xhs_material_image (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER NOT NULL,
      seq INTEGER NOT NULL DEFAULT 1,
      original_url TEXT NOT NULL,
      processed_url TEXT,
      thumbnail_url TEXT,
      image_hash TEXT NOT NULL,
      width INTEGER,
      height INTEGER,
      file_size INTEGER,
      image_status TEXT NOT NULL DEFAULT 'pending',
      process_error TEXT,
      is_cover INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (material_id) REFERENCES xhs_external_material(id)
    );

    CREATE TABLE IF NOT EXISTS material_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER NOT NULL,
      material_type TEXT NOT NULL DEFAULT 'xhs',
      shape TEXT,
      tone TEXT,
      craft TEXT,
      decor TEXT,
      style TEXT,
      tag_source TEXT NOT NULL DEFAULT 'ai_prescan',
      confidence TEXT,
      is_current INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (material_id) REFERENCES xhs_external_material(id)
    );

    CREATE TABLE IF NOT EXISTS xhs_review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER NOT NULL,
      operator TEXT NOT NULL,
      operator_role TEXT NOT NULL,
      action TEXT NOT NULL,
      action_detail TEXT,
      before_snapshot TEXT,
      after_snapshot TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (material_id) REFERENCES xhs_external_material(id)
    );

    CREATE TABLE IF NOT EXISTS label_system_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dimension TEXT NOT NULL,
      dimension_name TEXT NOT NULL,
      label_value TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      source TEXT NOT NULL DEFAULT 'system',
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      UNIQUE(dimension, label_value)
    );

    CREATE TABLE IF NOT EXISTS appointment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT DEFAULT '',
      nail_artist TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      service_item TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT DEFAULT '',
      cancel_reason TEXT,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS label_new_request (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dimension TEXT NOT NULL,
      label_name TEXT NOT NULL,
      requester TEXT NOT NULL,
      source_material_id INTEGER,
      supplement_desc TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      reviewed_by TEXT,
      review_comment TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS nail_design (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL DEFAULT 1,
      name TEXT NOT NULL,
      price REAL DEFAULT 0,
      description TEXT DEFAULT '',
      cover_image TEXT,
      detail_images TEXT DEFAULT '[]',
      shape TEXT NOT NULL,
      tone TEXT NOT NULL,
      craft TEXT DEFAULT '',
      decor TEXT DEFAULT '',
      style TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      is_listed INTEGER NOT NULL DEFAULT 0,
      operator_id TEXT DEFAULT 'merchant_owner',
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS nail_design_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      design_id INTEGER NOT NULL,
      operator TEXT NOT NULL,
      action TEXT NOT NULL,
      action_detail TEXT,
      before_snapshot TEXT,
      after_snapshot TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (design_id) REFERENCES nail_design(id)
    );

    CREATE INDEX IF NOT EXISTS idx_batch_id ON xhs_external_material(batch_id);
    CREATE INDEX IF NOT EXISTS idx_review_status ON xhs_external_material(review_status);
    CREATE INDEX IF NOT EXISTS idx_sync_status ON xhs_external_material(sync_status);
    CREATE INDEX IF NOT EXISTS idx_material_id ON xhs_material_image(material_id);
    CREATE INDEX IF NOT EXISTS idx_image_hash ON xhs_material_image(image_hash);
    CREATE INDEX IF NOT EXISTS idx_review_log_material ON xhs_review_log(material_id);
    CREATE INDEX IF NOT EXISTS idx_review_log_created ON xhs_review_log(created_at);
    CREATE TABLE IF NOT EXISTS nail_order (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT NOT NULL,
      customer_name TEXT DEFAULT '',
      customer_phone TEXT DEFAULT '',
      appointment_id INTEGER,
      nail_artist TEXT DEFAULT '',
      service_item TEXT DEFAULT '',
      price REAL DEFAULT 0,
      quantity INTEGER DEFAULT 1,
      discount_type TEXT DEFAULT 'amount',
      discount REAL DEFAULT 0,
      subtotal REAL DEFAULT 0,
      work_image TEXT,
      tags_json TEXT DEFAULT '{}',
      confidence_json TEXT DEFAULT '{}',
      payment_cash REAL DEFAULT 0,
      payment_card REAL DEFAULT 0,
      total_receivable REAL DEFAULT 0,
      total_discount REAL DEFAULT 0,
      actual_receivable REAL DEFAULT 0,
      change_amount REAL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS nail_work (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_url TEXT,
      name TEXT DEFAULT '',
      shape TEXT DEFAULT '',
      tone TEXT DEFAULT '',
      craft TEXT DEFAULT '',
      decor TEXT DEFAULT '',
      style TEXT DEFAULT '',
      confidence TEXT DEFAULT '{}',
      service_item TEXT DEFAULT '',
      price REAL DEFAULT 0,
      customer_name TEXT DEFAULT '',
      order_no TEXT DEFAULT '',
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS customer_conversation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT DEFAULT '',
      last_message TEXT DEFAULT '',
      last_message_at TEXT,
      unread_count INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS customer_message (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      sender TEXT NOT NULL CHECK (sender IN ('customer', 'merchant')),
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (conversation_id) REFERENCES customer_conversation(id)
    );

    CREATE INDEX IF NOT EXISTS idx_msg_conv ON customer_message(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_msg_time ON customer_message(created_at);
    CREATE INDEX IF NOT EXISTS idx_design_store ON nail_design(store_id);
    CREATE INDEX IF NOT EXISTS idx_design_listed ON nail_design(is_listed);
    CREATE INDEX IF NOT EXISTS idx_design_sort ON nail_design(sort_order);
    CREATE INDEX IF NOT EXISTS idx_design_log_design ON nail_design_log(design_id);
  `)

  // Seed default config if empty
  const configCount = db.prepare('SELECT COUNT(*) as c FROM openclaw_config').get()
  if (configCount.c === 0) {
    db.prepare(`INSERT INTO openclaw_config (keywords, exclude_keywords, min_likes, min_collects, schedule_cron, schedule_enabled, max_per_batch, date_range_days)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
      '["美甲爆款","显白美甲","春日美甲","猫眼美甲","渐变美甲","法式美甲","手绘美甲","晕染美甲","延长甲","裸色美甲"]',
      '["穿搭","护肤","美妆教程","发型","减肥","健身"]',
      500, 200, '0 3 * * 1', 1, 200, 7
    )
  }

  // Seed default label system if empty
  const labelCount = db.prepare('SELECT COUNT(*) as c FROM label_system_config').get()
  if (labelCount.c === 0) {
    const insertLabel = db.prepare('INSERT OR IGNORE INTO label_system_config (dimension, dimension_name, label_value, sort_order) VALUES (?, ?, ?, ?)')
    const labels = [
      ['shape', '甲型', '圆甲', 1], ['shape', '甲型', '方圆甲', 2], ['shape', '甲型', '尖甲', 3],
      ['shape', '甲型', '梯形甲', 4], ['shape', '甲型', '杏仁甲', 5], ['shape', '甲型', '建构延长', 6],
      ['tone', '色调', '裸色', 1], ['tone', '色调', '红色系', 2], ['tone', '色调', '亮色', 3],
      ['tone', '色调', '冷色', 4], ['tone', '色调', '金属', 5], ['tone', '色调', '魔镜粉', 6], ['tone', '色调', '透色', 7],
      ['craft', '工艺', '纯色', 1], ['craft', '工艺', '跳色', 2], ['craft', '工艺', '渐变', 3],
      ['craft', '工艺', '晕染', 4], ['craft', '工艺', '手绘', 5], ['craft', '工艺', '猫眼', 6], ['craft', '工艺', '魔镜粉', 7],
      ['decor', '装饰元素', '无装饰', 1], ['decor', '装饰元素', '碎钻', 2], ['decor', '装饰元素', '珍珠/铆钉', 3],
      ['decor', '装饰元素', '贴纸', 4], ['decor', '装饰元素', '立体雕花', 5], ['decor', '装饰元素', '波点', 6],
      ['decor', '装饰元素', '手绘', 7], ['decor', '装饰元素', '金/银碎箔', 8],
      ['style', '风格', '简约风', 1], ['style', '风格', '法式', 2], ['style', '风格', 'ins风', 3],
      ['style', '风格', '甜酷风', 4], ['style', '风格', '温柔风', 5], ['style', '风格', '日式', 6], ['style', '风格', '欧美风', 7]
    ]
    const seed = db.transaction(() => {
      for (const [dim, name, val, order] of labels) {
        insertLabel.run(dim, name, val, order)
      }
    })
    seed()
  }

  // Seed default nail designs if empty
  const designCount = db.prepare('SELECT COUNT(*) as c FROM nail_design WHERE is_deleted=0').get()
  if (designCount.c === 0) {
    const insertDesign = db.prepare(`INSERT INTO nail_design (store_id, name, price, description, shape, tone, craft, decor, style, sort_order, is_listed, operator_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    const designs = [
      [1, '裸色渐变温柔风杏仁甲', 168, '小红书爆款同款，裸色渐变搭配碎钻，温柔显白', '杏仁甲', '裸色', '渐变', '碎钻', '温柔风', 1, 1, 'merchant_owner'],
      [1, '红色法式方圆甲', 128, '经典法式红色纯色，简约大方', '方圆甲', '红色系', '纯色', '无装饰', '法式', 2, 1, 'merchant_owner'],
      [1, '冷色猫眼梯形甲', 228, '冷色调猫眼效果，搭配金银碎箔', '梯形甲', '冷色', '猫眼', '金/银碎箔', 'ins风', 3, 1, 'merchant_owner'],
      [1, '亮色手绘甜酷圆甲', 198, '亮色手绘花卉贴纸，甜酷风格', '圆甲', '亮色', '手绘', '贴纸', '甜酷风', 4, 1, 'merchant_owner'],
      [1, '金属欧美风尖甲', 268, '金属纯色搭配碎箔，欧美风延长', '尖甲', '金属', '纯色', '金/银碎箔', '欧美风', 5, 1, 'merchant_owner'],
      [1, '透色晕染日式杏仁甲', 188, '透色晕染配珍珠铆钉，日式精致', '杏仁甲', '透色', '晕染', '珍珠/铆钉', '日式', 6, 1, 'merchant_owner'],
      [1, '裸色简约方圆甲', 98, '裸色纯色基础款，简约百搭', '方圆甲', '裸色', '纯色', '', '简约风', 7, 1, 'merchant_owner'],
      [1, '魔镜粉欧美延长甲', 288, '魔镜粉立体雕花，欧美风建构延长', '建构延长', '魔镜粉', '魔镜粉', '立体雕花', '欧美风', 8, 1, 'merchant_owner'],
      [1, '红色渐变温柔风杏仁甲', 178, '红色渐变气质款，温柔优雅', '杏仁甲', '红色系', '渐变', '', '温柔风', 9, 0, 'merchant_owner'],
      [1, '冷色纯色简约圆甲', 88, '冷色纯色基础款，简约清新', '圆甲', '冷色', '纯色', '', '简约风', 10, 0, 'merchant_owner'],
      [1, '亮色猫眼甜酷梯形甲', 218, '亮色猫眼效果，甜酷个性', '梯形甲', '亮色', '猫眼', '', '甜酷风', 11, 0, 'merchant_owner'],
      [1, '裸色波点简约方圆甲', 138, '裸色波点装饰，简约不失趣味', '方圆甲', '裸色', '', '波点', '简约风', 12, 0, 'merchant_owner']
    ]
    const seedDesigns = db.transaction(() => {
      for (const d of designs) {
        insertDesign.run(...d)
      }
    })
    seedDesigns()
  }

  // Seed default conversations if empty
  const convCount = db.prepare('SELECT COUNT(*) as c FROM customer_conversation WHERE is_deleted = 0').get()
  if (convCount.c === 0) {
    const insertConv = db.prepare(`INSERT INTO customer_conversation (customer_name, customer_phone, last_message, last_message_at, unread_count) VALUES (?, ?, ?, datetime('now','localtime', ?), ?)`)
    const insertMsg = db.prepare(`INSERT INTO customer_message (conversation_id, sender, content, created_at) VALUES (?, ?, ?, datetime('now','localtime', ?))`)

    const seedConvs = db.transaction(() => {
      // Conv 1 — 小美: 新预约
      const c1 = insertConv.run('小美', '138****6789', '好的谢谢，明天见！', '-30 minutes', 1)
      insertMsg.run(c1.lastInsertRowid, 'customer', '你好，我想预约明天下午的日式美甲', '-2 hours')
      insertMsg.run(c1.lastInsertRowid, 'merchant', '好的，明天下午3点Luna老师有空，可以帮您预约', '-1.5 hours')
      insertMsg.run(c1.lastInsertRowid, 'customer', '可以，就定3点吧', '-1 hour')
      insertMsg.run(c1.lastInsertRowid, 'merchant', '已为您预约明天下午3点，Luna老师，日式美甲', '-45 minutes')
      insertMsg.run(c1.lastInsertRowid, 'customer', '好的谢谢，明天见！', '-30 minutes')

      // Conv 2 — 花花: 已有预约，想改时间
      const c2 = insertConv.run('花花', '139****8901', '那可以约下午吗？', '-1 hours', 1)
      insertMsg.run(c2.lastInsertRowid, 'customer', '你好，我之前预约的猫眼美甲可以改时间吗？', '-3 hours')
      insertMsg.run(c2.lastInsertRowid, 'merchant', '可以的，请问想改到什么时间？', '-2 hours')
      insertMsg.run(c2.lastInsertRowid, 'customer', '那可以约下午吗？', '-1 hours')

      // Conv 3 — 娜娜: 已完成预约，反馈好评
      const c3 = insertConv.run('娜娜', '136****0123', '太满意了，下次还来！', '-1 days', 0)
      insertMsg.run(c3.lastInsertRowid, 'customer', '昨天做的法式美甲效果太好了', '-1 days')
      insertMsg.run(c3.lastInsertRowid, 'merchant', '很高兴您喜欢，欢迎下次再来哦～', '-1 days')
      insertMsg.run(c3.lastInsertRowid, 'customer', '太满意了，下次还来！', '-1 days')
    })
    seedConvs()

    // Seed appointments
    const aptCount = db.prepare('SELECT COUNT(*) as c FROM appointment').get()
    if (aptCount.c === 0) {
      const insertApt = db.prepare(`INSERT INTO appointment
        (customer_name, customer_phone, nail_artist, appointment_time, service_item, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)`)

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}T15:00`

      // 小美: 新预约 — 明天下午3点 Luna 日式美甲
      insertApt.run('小美', '138****6789', 'Luna', tomorrowStr, '日式美甲', 'confirmed', '')

      // 花花: 已有预约 — 后天上午10点 小雨 猫眼美甲（想改时间）
      const afterTomorrow = new Date()
      afterTomorrow.setDate(afterTomorrow.getDate() + 2)
      const afterTomorrowStr = `${afterTomorrow.getFullYear()}-${String(afterTomorrow.getMonth()+1).padStart(2,'0')}-${String(afterTomorrow.getDate()).padStart(2,'0')}T10:00`
      insertApt.run('花花', '139****8901', '小雨', afterTomorrowStr, '猫眼美甲', 'confirmed', '')

      // 娜娜: 已完成预约 — 昨天 Amy 法式美甲
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}T14:00`
      insertApt.run('娜娜', '136****0123', 'Amy', yesterdayStr, '法式美甲', 'completed', '客户非常满意')
    }
  }

  console.log('[DB] Database initialized successfully')
}

export default db
