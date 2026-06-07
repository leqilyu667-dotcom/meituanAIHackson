# 妙手 后端技术方案

> 版本：v1.0 | 日期：2026-05-31 | 基于 PRD v1.0

---

## 一、技术选型

| 层次 | 技术 | 说明 |
|---|---|---|
| 语言 | Go 1.22+ | 高并发、低延迟，适合 API 网关 + 实时服务 |
| 框架 | Gin | RESTful API 路由，中间件生态成熟 |
| ORM | GORM | 数据库迁移、关联查询、事务支持 |
| 数据库 | PostgreSQL 16 | 主库，JSONB 存标签/元数据，窗口函数做报表 |
| 缓存 | Redis 7 | 会话、热门数据、实时消息 Pub/Sub、分布式锁 |
| 消息队列 | Redis Streams / RabbitMQ | 异步任务（试戴生成、通知推送、报表计算） |
| 文件存储 | 阿里云 OSS / MinIO | 手照、款式图、素材图、聊天图片 |
| WebSocket | gorilla/websocket | 群聊实时消息、预约状态推送 |
| AI 服务 | Python gRPC 微服务 | SAM 模型（手部分割）、Stable Diffusion（款式生成） |
| 全文搜索 | Elasticsearch 8 | 款式/店铺/美甲师多维度搜索 |
| 容器化 | Docker + K8s | CI/CD、自动扩缩容 |
| 日志/监控 | Prometheus + Grafana + Loki | 指标采集、日志聚合、告警 |

---

## 二、数据库设计

### 2.1 ER 图核心关系

```
users ──< reservations >── salons
  │              │              │
  │              └── artists ───┘
  │                              
  ├──< orders >── salons        
  │      │                      
  │      └── artists            
  │                             
  ├──< conversations >──< messages (群聊)
  │                             
  ├──< favorites (收藏款式)     
  │                             
  ├──< tryon_logs (试戴记录)    
  │                             
  └──< reviews >── artists      
```

```
salons ──< artists ──< artist_works (作品)
  │
  ├──< products (上架款式/货架)
  │      └── product_labels (5维标签)
  │
  ├──< service_items (服务项目)
  │
  └──< inspiration_themes
```

### 2.2 表结构详细设计

#### 2.2.1 用户与认证

**users** — 用户表
```sql
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  phone         VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  nickname      VARCHAR(50) NOT NULL DEFAULT '',
  avatar_url    VARCHAR(500),
  gender        SMALLINT DEFAULT 0,         -- 0未知 1男 2女
  city          VARCHAR(50),
  role          VARCHAR(20) NOT NULL DEFAULT 'customer',  -- customer / merchant / admin
  
  -- 用户端统计（冗余加速）
  tryon_count      INT DEFAULT 0,
  reservation_count INT DEFAULT 0,
  favorite_count   INT DEFAULT 0,
  
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ                 -- 软删除
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
```

**user_tokens** — 登录令牌（JWT Refresh Token 管理）
```sql
CREATE TABLE user_tokens (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    VARCHAR(255) NOT NULL,
  device_info   VARCHAR(500),
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_tokens_user ON user_tokens(user_id);
```

#### 2.2.2 店铺

**salons** — 美甲店铺
```sql
CREATE TABLE salons (
  id            BIGSERIAL PRIMARY KEY,
  merchant_id   BIGINT REFERENCES users(id),     -- 对应商家端登录账号
  name          VARCHAR(100) NOT NULL,
  rating        DECIMAL(2,1) DEFAULT 0,          -- 综合评分 0-5.0
  review_count  INT DEFAULT 0,
  image_url     VARCHAR(500),
  images        JSONB DEFAULT '[]',              -- 店内环境图集
  location      VARCHAR(100),                    -- 行政区（朝阳区/海淀区…）
  address       VARCHAR(500),                    -- 详细地址
  longitude     DECIMAL(10,7),
  latitude      DECIMAL(10,7),
  business_hours JSONB DEFAULT '{"open":"10:00","close":"22:00"}',
  description   TEXT,
  phone         VARCHAR(20),
  scale         VARCHAR(20) DEFAULT '中型店',     -- 小型/中型/大型
  status        VARCHAR(20) DEFAULT 'active',    -- active / suspended / closed
  
  -- 统计冗余
  service_count INT DEFAULT 0,
  artist_count  INT DEFAULT 0,
  
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_salons_location ON salons(location);
CREATE INDEX idx_salons_rating ON salons(rating DESC);
CREATE INDEX idx_salons_merchant ON salons(merchant_id);
```

**service_items** — 店铺服务项目
```sql
CREATE TABLE service_items (
  id            BIGSERIAL PRIMARY KEY,
  salon_id      BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  description   VARCHAR(300),
  image_url     VARCHAR(500),
  price         INT NOT NULL,                    -- 现价（分）
  original_price INT,                            -- 原价（分）
  discount_text VARCHAR(20),                     -- "6.3折"
  sort_order    INT DEFAULT 0,
  status        VARCHAR(20) DEFAULT 'active',    -- active / inactive
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_items_salon ON service_items(salon_id);
```

#### 2.2.3 美甲师

**artists** — 美甲师
```sql
CREATE TABLE artists (
  id            BIGSERIAL PRIMARY KEY,
  salon_id      BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  user_id       BIGINT REFERENCES users(id),     -- 关联登录账号（可选，美甲师可独立登录聊天）
  name          VARCHAR(50) NOT NULL,
  title         VARCHAR(50),                     -- 高级美甲师 / 资深美甲师 / 创意总监
  avatar_bg     VARCHAR(100),                    -- 头像背景渐变CSS
  bio           TEXT,
  specialty     VARCHAR(200),                    -- "日式 / 法式"（显示用）
  tags          JSONB DEFAULT '[]',              -- 技能标签 ["日式","法式","精细","花卉"]
  certificates  JSONB DEFAULT '[]',              -- ["高级美甲师认证","日式美甲资质证书"]
  years         INT DEFAULT 0,                   -- 从业年限
  service_count INT DEFAULT 0,                   -- 服务人次
  rating_attitude  DECIMAL(2,1) DEFAULT 0,       -- 态度评分
  rating_effect    DECIMAL(2,1) DEFAULT 0,       -- 效果评分
  rating_appearance DECIMAL(2,1) DEFAULT 0,      -- 形象评分
  rating        DECIMAL(2,1) DEFAULT 0,          -- 综合评分
  review_count  INT DEFAULT 0,
  badge         JSONB,                           -- { text: "上次美甲师", style: "last" }
  availability  VARCHAR(300),                    -- "周一至周五 10:00–20:00"
  sort_order    INT DEFAULT 0,
  status        VARCHAR(20) DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artists_salon ON artists(salon_id);
CREATE INDEX idx_artists_rating ON artists(rating DESC);
```

**artist_works** — 美甲师作品
```sql
CREATE TABLE artist_works (
  id            BIGSERIAL PRIMARY KEY,
  artist_id     BIGINT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title         VARCHAR(100),
  customer_ref_url  VARCHAR(500),                -- 顾客参考图
  actual_result_url VARCHAR(500),                -- 实际效果图
  labels        JSONB NOT NULL DEFAULT '{}',     -- {shape, tone, craft, decor, style}
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artist_works_artist ON artist_works(artist_id);
```

#### 2.2.4 款式 / 货架

**products** — 款式（商家货架 + 用户端款式库）
```sql
CREATE TABLE products (
  id            BIGSERIAL PRIMARY KEY,
  salon_id      BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  description   VARCHAR(500),
  image_url     VARCHAR(500),
  category      VARCHAR(50),                     -- 春日 / 裸色 / 法式 ...
  
  -- ═══ 五维标签 ═══
  label_shape   VARCHAR(20),                     -- 圆甲/方圆甲/尖甲/梯形甲/杏仁甲/建构延长
  label_tone    VARCHAR(20),                     -- 裸色/红色系/亮色/冷色/金属/魔镜粉/透色
  label_craft   VARCHAR(20),                     -- 纯色/跳色/渐变/晕染/手绘/猫眼/魔镜粉
  label_decor   VARCHAR(20),                     -- 无装饰/碎钻/珍珠铆钉/贴纸/立体雕花/波点/手绘/金银碎箔
  label_style   VARCHAR(20),                     -- 简约风/法式/ins风/甜酷风/温柔风/日式/欧美风
  
  likes         INT DEFAULT 0,
  is_new        BOOLEAN DEFAULT false,
  is_featured   BOOLEAN DEFAULT false,           -- 首页推荐
  
  -- 货架管理
  shelf_status  VARCHAR(20) DEFAULT 'active',    -- active / inactive / draft
  sort_order    INT DEFAULT 0,
  generated_from VARCHAR(50),                    -- manual / xhs_scrape / ai_generate
  
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- 五维标签联合索引（爆款分析核心查询）
CREATE INDEX idx_products_labels ON products(label_shape, label_tone, label_craft, label_decor, label_style);
CREATE INDEX idx_products_salon ON products(salon_id);
CREATE INDEX idx_products_shelf ON products(shelf_status);
CREATE INDEX idx_products_likes ON products(likes DESC);
CREATE INDEX idx_products_labels_gin ON products USING gin(
  to_jsonb(array[label_shape, label_tone, label_craft, label_decor, label_style])
);
```

#### 2.2.5 灵感库

**inspiration_themes** — 灵感主题合集
```sql
CREATE TABLE inspiration_themes (
  id            BIGSERIAL PRIMARY KEY,
  salon_id      BIGINT REFERENCES salons(id),
  name          VARCHAR(100) NOT NULL,
  cover_image_url VARCHAR(500),
  description   VARCHAR(300),
  label_shape   VARCHAR(20),
  label_tone    VARCHAR(20),
  label_craft   VARCHAR(20),
  label_decor   VARCHAR(20),
  label_style   VARCHAR(20),
  product_count INT DEFAULT 0,                   -- 关联款式数
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2.2.6 预约

**reservations** — 预约记录（两端共用）
```sql
CREATE TABLE reservations (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id),
  salon_id      BIGINT NOT NULL REFERENCES salons(id),
  artist_id     BIGINT REFERENCES artists(id),
  
  -- 预约信息
  service_name  VARCHAR(100),                    -- 服务项目名
  service_price INT,                             -- 价格（分）
  nail_style_id BIGINT REFERENCES products(id),  -- 关联款式
  nail_style_name VARCHAR(100),
  nail_image_url VARCHAR(500),                   -- 款式预览图
  
  -- 时间
  date          DATE NOT NULL,                   -- 预约日期
  time          TIME NOT NULL,                   -- 预约时间
  
  -- 状态
  status        VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- pending → confirmed → completed
  -- pending → changed → confirmed → completed
  -- pending → cancelled
  -- confirmed → changed → confirmed
  
  -- 变更/取消
  cancel_reason VARCHAR(500),
  change_reason VARCHAR(500),
  changed_from  JSONB,                           -- 变更前的 { date, time }
  
  -- 标签（报表分析用）
  labels        JSONB DEFAULT '{}',
  
  -- 备注
  remark        TEXT,
  design_image_url VARCHAR(500),                 -- 试戴效果图
  
  -- 联系方式
  contact_name  VARCHAR(50),
  contact_phone VARCHAR(20),
  
  -- 状态变更日志
  status_history JSONB DEFAULT '[]',             -- [{status, time, operator}]
  
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_salon ON reservations(salon_id);
CREATE INDEX idx_reservations_artist ON reservations(artist_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_salon_date ON reservations(salon_id, date);
```

#### 2.2.7 订单

**orders** — 订单记录（预约完成后生成）
```sql
CREATE TABLE orders (
  id            BIGSERIAL PRIMARY KEY,
  order_no      VARCHAR(30) UNIQUE NOT NULL,     -- NM20260408001
  reservation_id BIGINT REFERENCES reservations(id),
  user_id       BIGINT NOT NULL REFERENCES users(id),
  salon_id      BIGINT NOT NULL REFERENCES salons(id),
  artist_id     BIGINT REFERENCES artists(id),
  
  service_name  VARCHAR(100),
  actual_receivable INT NOT NULL,               -- 实收金额（分）
  
  labels        JSONB DEFAULT '{}',
  work_image_url VARCHAR(500),                   -- 完成作品图
  design_image_url VARCHAR(500),                 -- 用户试戴图
  
  status        VARCHAR(20) DEFAULT 'completed', -- completed / cancelled / refunded
  remark        TEXT,
  
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_salon ON orders(salon_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE UNIQUE INDEX idx_orders_no ON orders(order_no);
```

#### 2.2.8 评价

**reviews** — 用户评价（关联订单）
```sql
CREATE TABLE reviews (
  id            BIGSERIAL PRIMARY KEY,
  order_id      BIGINT REFERENCES orders(id),
  user_id       BIGINT NOT NULL REFERENCES users(id),
  artist_id     BIGINT NOT NULL REFERENCES artists(id),
  salon_id      BIGINT NOT NULL REFERENCES salons(id),
  
  rating        SMALLINT NOT NULL CHECK(rating BETWEEN 1 AND 5),
  content       TEXT,
  
  -- 参考图/结果图（用户上传对比）
  style_image_url  VARCHAR(500),
  result_image_url VARCHAR(500),
  
  -- 商家回复
  reply_content TEXT,
  reply_at      TIMESTAMPTZ,
  
  status        VARCHAR(20) DEFAULT 'approved',  -- pending / approved / rejected
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_artist ON reviews(artist_id);
CREATE INDEX idx_reviews_salon ON reviews(salon_id);
CREATE INDEX idx_reviews_order ON reviews(order_id);
```

#### 2.2.9 消息 / 群聊

**conversations** — 会话（群聊）
```sql
CREATE TABLE conversations (
  id            BIGSERIAL PRIMARY KEY,
  salon_id      BIGINT NOT NULL REFERENCES salons(id),
  artist_id     BIGINT NOT NULL REFERENCES artists(id),
  user_id       BIGINT NOT NULL REFERENCES users(id),
  salon_name    VARCHAR(100),
  artist_name   VARCHAR(50),
  customer_nickname VARCHAR(50),
  
  last_message  TEXT,
  last_message_at TIMESTAMPTZ,
  
  unread_count_user    INT DEFAULT 0,            -- 用户端未读数
  unread_count_merchant INT DEFAULT 0,           -- 商家端未读数
  
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(salon_id, artist_id, user_id)
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_salon ON conversations(salon_id);
CREATE INDEX idx_conversations_artist ON conversations(artist_id);
```

**chat_messages** — 聊天消息
```sql
CREATE TABLE chat_messages (
  id            BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  sender_type   VARCHAR(20) NOT NULL,            -- salon / artist / user
  sender_id     BIGINT,                          -- users.id / artists.id
  sender_name   VARCHAR(50),
  
  message_type  VARCHAR(20) DEFAULT 'text',      -- text / image / system
  content       TEXT,                            -- 文字内容
  image_url     VARCHAR(500),                    -- 图片消息
  
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_conv ON chat_messages(conversation_id, created_at);
```

#### 2.2.10 试戴记录

**tryon_logs** — 试戴埋点日志
```sql
CREATE TABLE tryon_logs (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT REFERENCES users(id),
  hand_image_url VARCHAR(500),
  design_image_url VARCHAR(500),
  result_image_url VARCHAR(500),
  
  -- 试戴时选中的标签
  labels        JSONB DEFAULT '{}',
  
  -- 来源
  source        VARCHAR(50),                     -- discovery / nail_detail / artist_work / inspiration
  
  -- 转化
  converted     BOOLEAN DEFAULT false,           -- 是否转化为预约
  reservation_id BIGINT REFERENCES reservations(id),
  
  match_score   INT,                             -- AI 匹配度
  duration_ms   INT,                             -- 生成耗时
  
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tryon_logs_user ON tryon_logs(user_id);
CREATE INDEX idx_tryon_logs_created ON tryon_logs(created_at);
CREATE INDEX idx_tryon_logs_converted ON tryon_logs(converted);
CREATE INDEX idx_tryon_logs_labels ON tryon_logs USING gin(labels);
```

#### 2.2.11 收藏

**favorites** — 用户收藏款式
```sql
CREATE TABLE favorites (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id    BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
```

#### 2.2.12 优惠券

**coupons** — 优惠券模板
```sql
CREATE TABLE coupons (
  id            BIGSERIAL PRIMARY KEY,
  title         VARCHAR(100) NOT NULL,
  discount_text VARCHAR(100),                    -- "满100减30"
  condition     VARCHAR(300),
  amount        INT,                             -- 优惠金额（分）
  discount_type VARCHAR(20) DEFAULT 'fixed',     -- fixed / percent
  salon_id      BIGINT REFERENCES salons(id),    -- NULL = 全平台
  expire_days   INT DEFAULT 30,                  -- 领取后有效天数
  total_count   INT DEFAULT 1000,
  used_count    INT DEFAULT 0,
  status        VARCHAR(20) DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

**user_coupons** — 用户持有的优惠券
```sql
CREATE TABLE user_coupons (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coupon_id     BIGINT NOT NULL REFERENCES coupons(id),
  used          BOOLEAN DEFAULT false,
  used_at       TIMESTAMPTZ,
  order_id      BIGINT REFERENCES orders(id),
  expire_at     TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_coupons_user ON user_coupons(user_id);
```

#### 2.2.13 商家素材

**merchant_materials** — 商家素材库
```sql
CREATE TABLE merchant_materials (
  id            BIGSERIAL PRIMARY KEY,
  salon_id      BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  image_url     VARCHAR(500) NOT NULL,
  source_url    VARCHAR(500),                    -- 小红书原始链接
  source_type   VARCHAR(50),                     -- xhs_scrape / manual_upload / ai_generate
  source_likes  INT,
  source_collects INT,
  source_comments INT,
  
  labels        JSONB DEFAULT '{}',
  status        VARCHAR(20) DEFAULT 'pending',   -- pending / approved / generated
  generated_product_id BIGINT REFERENCES products(id),
  
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2.2.14 商家经营数据

**daily_reports** — 经营日报（每天凌晨计算写入）
```sql
CREATE TABLE daily_reports (
  id            BIGSERIAL PRIMARY KEY,
  salon_id      BIGINT NOT NULL REFERENCES salons(id),
  report_date   DATE NOT NULL,
  
  -- 核心指标
  revenue       INT DEFAULT 0,                   -- 营收（分）
  traffic       INT DEFAULT 0,                   -- 客流量
  avg_ticket    INT DEFAULT 0,                   -- 客单价（分）
  completion_rate DECIMAL(5,2) DEFAULT 0,        -- 完成率 %
  
  -- 试戴数据
  tryon_count   INT DEFAULT 0,
  tryon_convert_count INT DEFAULT 0,
  tryon_convert_rate DECIMAL(5,2) DEFAULT 0,
  
  -- 按标签维度汇总（JSONB）
  tag_revenue   JSONB DEFAULT '[]',
  tag_orders    JSONB DEFAULT '[]',
  
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(salon_id, report_date)
);
```

#### 2.2.15 系统消息

**system_notifications** — 系统通知
```sql
CREATE TABLE system_notifications (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT REFERENCES users(id),     -- NULL = 全局广播
  title         VARCHAR(200) NOT NULL,
  content       TEXT,
  type          VARCHAR(50) DEFAULT 'system',    -- system / booking / promotion
  is_read       BOOLEAN DEFAULT false,
  link          VARCHAR(300),                    -- 点击跳转路由
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON system_notifications(user_id, is_read);
```

### 2.3 数据库 ER 图（文字版）

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  users   │────< reservations >────│  salons  │──< service_items
│          │     │  (C端预约)    │     │          │──< inspiration_themes
│          │     └──────┬───────┘     │          │──< artists >──< artist_works
│          │            │             │          │──< products (货架)
│          │     ┌──────┴───────┐     │          │──< merchant_materials
│          │────<    orders     >────│          │──< daily_reports
│          │     │  (订单记录)   │     │          │
│          │     └──────────────┘     └──────────┘
│          │
│          │────< reviews >── artists
│          │────< favorites >── products
│          │────< tryon_logs
│          │────< user_coupons >── coupons
│          │
│          │────< conversations >──< chat_messages
│          │────< system_notifications
└──────────┘
```

---

## 三、API 设计

### 3.1 通用规范

```
Base URL:  https://api.miaoshou.com/v1
Content-Type: application/json
Auth:       Bearer {JWT_ACCESS_TOKEN}
Pagination: ?page=1&page_size=20
Response:   { "code": 0, "data": {...}, "message": "ok" }
```

### 3.2 API 清单（按模块）

#### 3.2.1 认证 (Auth)

| Method | Path | 说明 | 鉴权 |
|---|---|---|---|
| POST | `/auth/send-code` | 发送短信验证码 | 无 |
| POST | `/auth/login` | 手机号+验证码登录，返回 JWT | 无 |
| POST | `/auth/refresh` | 刷新 Access Token | Refresh Token |
| POST | `/auth/logout` | 登出，吊销 Token | JWT |
| GET | `/auth/profile` | 获取当前用户信息 | JWT |

#### 3.2.2 用户 (Users)

| Method | Path | 说明 | 鉴权 |
|---|---|---|---|
| GET | `/users/me` | 个人中心数据 | JWT |
| PUT | `/users/me` | 编辑个人资料 | JWT |
| GET | `/users/me/tryon-logs` | 试戴历史 | JWT |
| GET | `/users/me/favorites` | 收藏列表 | JWT |
| POST | `/users/me/favorites` | 收藏款式 {product_id} | JWT |
| DELETE | `/users/me/favorites/:id` | 取消收藏 | JWT |
| GET | `/users/me/coupons` | 我的优惠券 | JWT |

#### 3.2.3 款式 / 灵感 (Products & Inspiration)

| Method | Path | 说明 | 鉴权 |
|---|---|---|---|
| GET | `/products` | 款式列表（支持分类/标签/搜索筛选） | 无 |
| GET | `/products/:id` | 款式详情 | 无 |
| GET | `/products/hot` | 热门款式 Top N | 无 |
| GET | `/products/recommend` | 个性化推荐 | 可选 |
| GET | `/inspiration-themes` | 灵感合集列表 | 无 |
| GET | `/inspiration-themes/:id` | 灵感合集详情（含关联产品） | 无 |
| GET | `/labels/dimensions` | 五维标签枚举 | 无 |

**products 查询参数示例：**
```
GET /products?category=春日&label_style=温柔风&label_tone=裸色&sort=likes&page=1&page_size=20
GET /products?search=法式猫眼&label_shape=杏仁甲&lat=39.9&lng=116.4&radius=5km
```

#### 3.2.4 店铺 (Salons)

| Method | Path | 说明 | 鉴权 |
|---|---|---|---|
| GET | `/salons` | 店铺列表（按距离/评分排序） | 无 |
| GET | `/salons/:id` | 店铺详情（含服务项目、美甲师、作品） | 无 |
| GET | `/salons/:id/artists` | 店铺的美甲师列表 | 无 |
| GET | `/salons/:id/products` | 店铺货架款式 | 无 |
| GET | `/salons/:id/reviews` | 店铺评价列表 | 无 |
| GET | `/salons/:id/available-slots` | 可预约时段 `?date=2026-06-01&artist_id=1` | 无 |

#### 3.2.5 美甲师 (Artists)

| Method | Path | 说明 | 鉴权 |
|---|---|---|---|
| GET | `/artists` | 美甲师列表（可按店铺/评分筛选） | 无 |
| GET | `/artists/:id` | 美甲师详情（含作品集、评价） | 无 |
| GET | `/artists/:id/works` | 美甲师作品列表 | 无 |
| GET | `/artists/:id/reviews` | 美甲师评价列表 | 无 |
| GET | `/artists/:id/available-slots` | 美甲师可预约时段 | 无 |

#### 3.2.6 预约 (Reservations) — 核心业务流程

| Method | Path | 说明 | 鉴权 |
|---|---|---|---|
| POST | `/reservations` | 用户提交预约 | JWT(C) |
| GET | `/reservations` | 用户端：我的预约列表 | JWT(C) |
| GET | `/reservations/:id` | 预约详情 | JWT |
| PUT | `/reservations/:id/confirm` | 商家确认预约 | JWT(B) |
| PUT | `/reservations/:id/change` | 变更预约时间 | JWT |
| PUT | `/reservations/:id/cancel` | 取消预约 | JWT |
| PUT | `/reservations/:id/complete` | 标记完成 → 生成订单 | JWT(B) |
| GET | `/merchant/reservations` | 商家端：预约管理列表 | JWT(B) |

**POST /reservations 请求体：**
```json
{
  "salon_id": 1,
  "artist_id": 1,
  "service_name": "日式美甲",
  "service_price": 16800,
  "date": "2026-06-15",
  "time": "14:00",
  "nail_style_id": 3,
  "design_image_url": "https://oss.../tryon-result.jpg",
  "labels": {
    "shape": "方圆甲",
    "tone": "裸色",
    "craft": "纯色",
    "decor": "无装饰",
    "style": "法式"
  },
  "remark": "想做温柔一点的款式",
  "contact_name": "小美",
  "contact_phone": "138****6789"
}
```

#### 3.2.7 订单 (Orders)

| Method | Path | 说明 | 鉴权 |
|---|---|---|---|
| GET | `/orders` | 用户端：我的订单 | JWT(C) |
| GET | `/orders/:id` | 订单详情 | JWT |
| POST | `/orders/:id/review` | 写评价 | JWT(C) |
| GET | `/merchant/orders` | 商家端：订单记录列表 | JWT(B) |
| GET | `/merchant/orders/stats` | 商家端：订单统计（累计营收等） | JWT(B) |

#### 3.2.8 评价 (Reviews)

| Method | Path | 说明 | 鉴权 |
|---|---|---|---|
| POST | `/reviews` | 提交评价（关联订单） | JWT(C) |
| PUT | `/reviews/:id/reply` | 商家回复评价 | JWT(B) |

#### 3.2.9 消息 / 群聊 (Messages) — WebSocket

| Method | Path | 说明 | 鉴权 |
|---|---|---|---|
| GET | `/conversations` | 会话列表 | JWT |
| GET | `/conversations/:id/messages` | 聊天记录（分页） | JWT |
| POST | `/conversations` | 创建会话（首次预约后自动创建） | JWT |
| POST | `/conversations/:id/messages/image` | 上传聊天图片 | JWT |
| WS | `/ws/chat?token={JWT}` | WebSocket 实时消息 | JWT |

**WebSocket 消息协议：**
```json
// 发送消息
{ "type": "message", "conversation_id": 1, "content": "你好", "message_type": "text" }
{ "type": "message", "conversation_id": 1, "content": "", "message_type": "image", "image_url": "https://..." }

// 接收消息
{ "type": "new_message", "conversation_id": 1, "message": { "id": 123, "sender_type": "artist", "sender_name": "Luna", "content": "好的收到~", "created_at": "..." } }

// 预约状态推送
{ "type": "reservation_update", "reservation_id": 5, "status": "confirmed" }
```

#### 3.2.10 试戴 (TryOn)

| Method | Path | 说明 | 鉴权 |
|---|---|---|---|
| POST | `/tryon/segment` | 上传手照 → 返回手部掩码（SAM） | JWT |
| POST | `/tryon/generate` | 手照 + 款式图 → 试戴效果 | JWT |
| POST | `/tryon/log` | 试戴埋点（转化追踪） | JWT |

#### 3.2.11 商家后台 (Merchant)

| Method | Path | 说明 | 鉴权 |
|---|---|---|---|
| GET | `/merchant/daily-report` | 经营日报数据 | JWT(B) |
| GET | `/merchant/trend-data` | 近7天趋势 | JWT(B) |
| GET | `/merchant/tag-ranking` | 标签营收TOP10 | JWT(B) |
| GET | `/merchant/anomaly-alerts` | 异常预警 | JWT(B) |
| GET | `/merchant/hot-tags` | 站内爆款标签 | JWT(B) |
| GET | `/merchant/peer-comparison` | 竞品对比 | JWT(B) |
| GET | `/merchant/operation-advice` | 运营建议 | JWT(B) |
| POST | `/merchant/products` | 新增款式 | JWT(B) |
| PUT | `/merchant/products/:id` | 编辑款式 | JWT(B) |
| PUT | `/merchant/products/:id/shelf` | 上下架 | JWT(B) |
| PUT | `/merchant/products/sort` | 批量排序 | JWT(B) |
| PUT | `/merchant/profile` | 编辑店铺信息 | JWT(B) |
| POST | `/merchant/materials/scrape` | 触发小红书素材抓取 | JWT(B) |
| PUT | `/merchant/materials/:id/approve` | 审核素材 | JWT(B) |
| POST | `/merchant/materials/:id/generate` | AI生成款式 → 上架 | JWT(B) |
| GET | `/merchant/service-items` | 服务项目管理 | JWT(B) |
| POST | `/merchant/service-items` | 新增服务项目 | JWT(B) |
| PUT | `/merchant/service-items/:id` | 编辑服务项目 | JWT(B) |
| PUT | `/merchant/artists/:id` | 编辑美甲师信息 | JWT(B) |

---

## 四、认证与权限

### 4.1 JWT 双 Token 机制

```
Access Token:  15分钟过期，存内存（前端），调用 API
Refresh Token: 7天过期，存 httpOnly cookie 或安全存储，刷新 Access Token
```

### 4.2 RBAC 角色权限

| 角色 | 权限范围 |
|---|---|
| `customer` | 用户端全部 API + 自己的数据 |
| `merchant` | 商家后台 API + 自己店铺的数据 + 消息管理 |
| `admin` | 全平台管理 |

**中间件链：** `AuthMiddleware → RoleMiddleware → RateLimiter → Handler`

### 4.3 API 限流

| 端点类型 | 限制 |
|---|---|
| `/auth/*` | 5 req/min/IP（防短信轰炸） |
| `/tryon/generate` | 10 req/min/user（GPU资源保护） |
| 普通 GET | 100 req/min/user |
| WebSocket | 每用户1个连接 |

---

## 五、AI 服务架构

### 5.1 服务拓扑

```
前端 → API Gateway (Go/Gin) → gRPC → AI Service (Python)
                                     ├── Hand Segmentation (SAM)
                                     ├── Nail Try-On (Stable Diffusion + ControlNet)
                                     ├── Label Auto-Tagging (CLIP)
                                     └── XHS Material Scraper (Playwright)
```

### 5.2 AI 能力矩阵

| 能力 | 模型/方案 | 输入 | 输出 | GPU | 延迟目标 |
|---|---|---|---|---|---|
| 手部分割 | SAM-ViT-B | 手照 1024×1024 | 甲床 mask | T4 | <500ms |
| 试戴生成 | SD 1.5 + ControlNet Canny | 手照 + 款式图 + mask | 试戴效果图 | A10G | <3s |
| 标签自动打标 | CLIP ViT-L/14 | 款式图 | 5维 labels | T4 | <200ms |
| 小红书素材抓取 | Playwright + 截图 | URL | 图片 + 互动数据 | CPU | <5s |
| 爆款标签分析 | SQL 聚合 + 评分算法 | 7天数据 | topN 标签 | CPU | <100ms |

### 5.3 任务队列（异步化）

```
试戴生成流程：
1. API 接收请求 → 写入 tryon_logs(status=processing)
2. 投递消息到 Redis Stream: { task: "tryon", user_id, hand_url, design_url, labels }
3. Python Worker 消费 → 调用 SAM + SD → 上传结果到 OSS
4. 回调 API → 更新 tryon_logs(status=completed, result_url) → 推送 WS 通知

素材抓取流程：
1. 商家触发抓取 → 入队 { task: "scrape_xhs", urls: [...] }
2. Worker 抓取 → CLIP 打标 → 写入 merchant_materials
3. 商家审核 → AI 生成 → product 上架
```

---

## 六、实时消息架构

```
                    Redis Pub/Sub
                    ┌──────────┐
   Client A ──WS──→ │  chat:1  │ ←──WS── Client B
   (用户端)          │reservation│          (商家端)
                     └──────────┘
                         │
                    PostgreSQL
                    (持久化)
```

- 每个 WebSocket 连接对应一个 goroutine
- 消息写入 PostgreSQL → 发布到 Redis channel `chat:{conv_id}`
- 在线用户通过 WS 实时收到，离线用户通过 GET API 拉取
- 预约状态变更也通过 Redis Pub/Sub 推送：`reservation:{id}` → WS → 前端更新

---

## 七、缓存策略

| 数据 | 缓存方式 | TTL | 失效策略 |
|---|---|---|---|
| 热门款式 Top 100 | Redis String (JSON) | 5 min | 定时刷新 + 新订单时失效 |
| 款式详情 | Redis String | 30 min | 商家编辑时主动删除 |
| 店铺信息 + 美甲师 | Redis String | 15 min | 编辑时删除 |
| 标签枚举 (labelSystem) | Redis Hash | 永久 | 部署时写入 |
| 五维热度 (dimensionHeat) | Redis Sorted Set | 1 hour | 定时任务重新计算 |
| 用户会话 (JWT) | Redis String | 15 min | 登录时写入 |
| 短信验证码 | Redis String | 5 min | 用完即删 |
| API 限流计数器 | Redis INCR + EXPIRE | 窗口时长 | 自动过期 |

---

## 八、定时任务 (Cron Jobs)

| 任务 | 频率 | 说明 |
|---|---|---|
| 日报计算 | 每天 00:30 | 汇总当天营收/流量/转化 → daily_reports |
| 标签热度更新 | 每 1 小时 | 汇总 7 天 hotTags / dimensionHeat |
| 异常检测 | 每 4 小时 | 对比同环比数据 → anomaly_alerts |
| 竞品对比更新 | 每天 06:00 | 更新 peer_comparison |
| 临时文件清理 | 每天 03:00 | OSS 过期文件 / 压缩日志 |
| 会话清理 | 每天 04:00 | 清理过期 Refresh Token |

---

## 九、部署架构

```
                     ┌──────────────┐
                     │   CDN / OSS  │  (静态资源 + 图片)
                     └──────┬───────┘
                            │
    ┌──────────┐    ┌───────┴───────┐    ┌──────────┐
    │  Nginx   │───→│  API Gateway  │───→│  Go API  │
    │ (TLS终止)│    │  (K8s Ingress)│    │  (Gin)   │
    └──────────┘    └───────────────┘    └────┬─────┘
                                              │
              ┌───────────────────────────────┼───────────────┐
              │                               │               │
        ┌─────┴─────┐   ┌──────────┐   ┌─────┴─────┐   ┌────┴─────┐
        │ PostgreSQL │   │  Redis   │   │  ES (搜索) │   │  gRPC    │
        │  (主 + 从)  │   │ (缓存/Pub)│   │            │   │ AI Svc   │
        └───────────┘   └──────────┘   └───────────┘   └──────────┘
```

| 组件 | 规格建议 |
|---|---|
| Go API | 3 Pods × 2C4G，HPA 自动扩缩 |
| PostgreSQL | 4C16G，SSD 200G，主从复制 |
| Redis | 2C8G，AOF 持久化 |
| Elasticsearch | 3 节点 × 4C8G |
| AI Worker | 2 × T4 GPU (推理)，按需扩容 |
| OSS | 标准存储 + CDN 加速 |

---

## 十、开发路线图

### Phase 1（核心闭环）- 4 周
- [ ] 用户认证（手机号+验证码登录）
- [ ] 店铺/美甲师/款式 CRUD + 列表 API
- [ ] 预约提交 + 状态流转
- [ ] 文件上传（OSS 集成）
- [ ] 基础数据库建表迁移

### Phase 2（实时+AI）- 4 周
- [ ] WebSocket 群聊
- [ ] SAM 手部分割服务
- [ ] SD 试戴生成服务（MVP：模板匹配方案先上线）
- [ ] CLIP 标签自动打标
- [ ] 消息推送（预约状态变更通知）

### Phase 3（商家后台）- 3 周
- [ ] 经营日报 + 趋势图 API
- [ ] 货架管理 + 排序 API
- [ ] 爆款标签分析（SQL 聚合）
- [ ] 小红书素材抓取 + 审核流
- [ ] 竞品对比 + 运营建议 API

### Phase 4（体验优化）- 2 周
- [ ] ES 全文搜索集成
- [ ] 个性化推荐（协同过滤 / 标签匹配）
- [ ] 优惠券系统
- [ ] 评价闭环
- [ ] 性能压测 + 优化
