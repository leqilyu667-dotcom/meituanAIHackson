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
      pool_status TEXT NOT NULL DEFAULT 'raw',
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

    CREATE TABLE IF NOT EXISTS material_library (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT DEFAULT '',
      image_url TEXT,
      tags_json TEXT DEFAULT '{}',
      tags_shape TEXT DEFAULT '',
      tags_tone TEXT DEFAULT '',
      tags_craft TEXT DEFAULT '',
      tags_decor TEXT DEFAULT '',
      tags_style TEXT DEFAULT '',
      is_favorite INTEGER NOT NULL DEFAULT 0,
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

  // Seed demo XHS materials if empty (for deployment demo)
  const xhsCount = db.prepare('SELECT COUNT(*) as c FROM xhs_external_material WHERE is_deleted=0').get()
  if (xhsCount.c === 0) {
    const demoBatchId = 'demo-seed-batch'
    db.prepare(`INSERT INTO xhs_scrape_batch (batch_id, status, total_scraped, after_filter, keyword_set, started_at, completed_at)
      VALUES (?, 'completed', 30, 30, ?, datetime('now','localtime'), datetime('now','localtime'))`)
      .run(demoBatchId, JSON.stringify(['美甲']))

    const insertM = db.prepare(`INSERT OR IGNORE INTO xhs_external_material
      (batch_id, source_id, source_url, author_nickname, title, likes, heat_score, review_status, pool_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'raw')`)
    const insertImg = db.prepare(`INSERT INTO xhs_material_image (material_id, seq, original_url, processed_url, image_hash, image_status, is_cover)
      VALUES (?, 1, ?, ?, ?, 'processed', 1)`)
    const insertTag = db.prepare(`INSERT INTO material_tags (material_id, material_type, shape, tone, craft, decor, style, tag_source, confidence, is_current)
      VALUES (?, 'xhs', ?, ?, ?, ?, ?, 'ai_prescan', '{}', 1)`)

    const colors = ['f5e6d8','e8d5f0','d5e8f0','f0e8d5','e8f0d5','f0d5e8','d8f0e8','f0d8d5','d5f0e8','e8d8f0',
      'f8e8d0','d0e8f8','f0d8e0','e0f0d8','d8e0f0','f8d8e0','e0f8d8','d8f0e0','f0e0d8','e8f0e0',
      'ffe8d0','d0e8ff','ffd8e8','e8ffd8','d8e8ff','ffd0e0','e0ffd0','d0ffe0','ffe0d0','e0ffe0']
    const svg = (c) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#${c}" width="400" height="400"/><text x="200" y="210" text-anchor="middle" font-size="80">💅</text></svg>`)}`

    const demos = [
      ['xhs_demo_01','美甲达人Lily','春日郁金香美甲温柔到骨子里',23400,['杏仁甲','裸色','渐变','碎钻','温柔风']],
      ['xhs_demo_02','NailArt_CC','冰透裸色美甲黄皮显白天花板',18900,['方圆甲','裸色','纯色','无装饰','简约风']],
      ['xhs_demo_03','指尖魔法师','法式猫眼美甲高级感拉满',32100,['梯形甲','红色系','猫眼','金/银碎箔','法式']],
      ['xhs_demo_04','美甲师小雨','渐变闪粉美甲指尖星河',15600,['圆甲','亮色','魔镜粉','碎钻','甜酷风']],
      ['xhs_demo_05','小红薯美甲控','复古红棕美甲秋冬必备',21200,['杏仁甲','红色系','纯色','无装饰','欧美风']],
      ['xhs_demo_06','指尖日记','ins风简约美甲通勤百搭款',27800,['圆甲','冷色','跳色','无装饰','ins风']],
      ['xhs_demo_07','NailsDaily','甜酷风黑色系美甲又A又飒',19800,['方圆甲','冷色','纯色','无装饰','甜酷风']],
      ['xhs_demo_08','BeautyNails','裸色杏仁甲温柔气质本命美甲',26500,['杏仁甲','裸色','渐变','无装饰','温柔风']],
      ['xhs_demo_09','美甲控小圆','魔镜粉延长甲未来感十足',14300,['建构延长','魔镜粉','魔镜粉','立体雕花','ins风']],
      ['xhs_demo_10','春日美甲日记','手绘花朵美甲把春天画在指尖',18700,['圆甲','亮色','手绘','贴纸','日式']],
      ['xhs_demo_11','NailStudio','纯色跳色美甲简约不简单',12500,['方圆甲','亮色','跳色','无装饰','简约风']],
      ['xhs_demo_12','指尖美学','珍珠铆钉美甲轻奢质感',29100,['杏仁甲','透色','晕染','珍珠/铆钉','日式']],
      ['xhs_demo_13','Luna_Nail','日式晕染美甲如水墨画般温柔',22300,['杏仁甲','冷色','晕染','无装饰','日式']],
      ['xhs_demo_14','MeiJiaDiary','欧美风金属纯色美甲气场全开',16700,['尖甲','金属','纯色','金/银碎箔','欧美风']],
      ['xhs_demo_15','NailsByCoco','碎钻波点美甲精致到指尖',25400,['梯形甲','亮色','猫眼','碎钻','ins风']],
      ['xhs_demo_16','美甲日记本','透色猫眼美甲清冷感绝了',31200,['方圆甲','透色','猫眼','无装饰','简约风']],
      ['xhs_demo_17','ArtNail','建构延长美甲完美甲型',13800,['建构延长','裸色','纯色','无装饰','简约风']],
      ['xhs_demo_18','指尖童话','韩系温柔风渐变美甲约会首选',27900,['杏仁甲','裸色','渐变','碎钻','温柔风']],
      ['xhs_demo_19','NailQueen','立体雕花美甲极致奢华',19200,['杏仁甲','金属','魔镜粉','立体雕花','欧美风']],
      ['xhs_demo_20','DailyNails','冷色调纯色美甲气质款',24100,['圆甲','冷色','纯色','无装饰','简约风']],
      ['xhs_demo_21','美甲日记','春日清新小雏菊美甲',49000,['杏仁甲','亮色','手绘','贴纸','日式']],
      ['xhs_demo_22','NailArt_YY','镜面魔镜粉美甲',38000,['梯形甲','魔镜粉','魔镜粉','无装饰','甜酷风']],
      ['xhs_demo_23','指尖艺术家','棋盘格甜酷美甲',51000,['方圆甲','冷色','纯色','无装饰','甜酷风']],
      ['xhs_demo_24','NailsByAmy','晕染大理石纹美甲高级',27000,['杏仁甲','透色','晕染','金/银碎箔','日式']],
      ['xhs_demo_25','BeautyHand','猫眼渐变美甲极光色',34000,['圆甲','冷色','猫眼','无装饰','ins风']],
      ['xhs_demo_26','美甲控小A','法式白边杏仁甲永不过时',42000,['杏仁甲','裸色','纯色','无装饰','法式']],
      ['xhs_demo_27','NailDiary','金箔碎钻美甲轻奢名媛风',18000,['梯形甲','亮色','渐变','金/银碎箔','温柔风']],
      ['xhs_demo_28','HandArt','裸粉渐变温柔美甲新娘款',31000,['杏仁甲','裸色','渐变','碎钻','温柔风']],
      ['xhs_demo_29','美甲师Luna','冰蓝透色美甲夏日降温神器',26000,['圆甲','冷色','猫眼','无装饰','ins风']],
      ['xhs_demo_30','LittleNail','mini手绘爱心美甲少女心',22000,['杏仁甲','亮色','手绘','贴纸','甜酷风']]
    ]

    db.transaction(() => {
      for (const [sid, author, title, likes, tags] of demos) {
        const url = `https://www.xiaohongshu.com/explore/${sid}`
        const r = insertM.run(demoBatchId, sid, url, author, title, likes, likes)
        if (r.changes > 0) {
          const mid = r.lastInsertRowid
          const img = svg(colors[Math.floor(Math.random() * colors.length)])
          const hash = `demo_${sid}`
          insertImg.run(mid, img, img, hash)
          insertTag.run(mid, tags[0], tags[1], tags[2], tags[3], tags[4])
        }
      }
    })()
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
