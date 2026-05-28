# 3.7 站外小红书爆款信息抓取与素材入库 — 全链路详细设计

> 文档版本：V2.0 | 编制日期：2026-05-27 | 更新日期：2026-05-27
> 依赖：Playwright（Chrome 浏览器自动化）、doubao-seed-1-6-vision-250815（视觉模型）
> 本文档为 PRD §3.7 的完整技术实现文档，所有命名、枚举、错误码严格沿用 `customer` 分支规范。

---

## 目录

1. [OpenClaw 对接规范](#1-openclaw-对接规范)
2. [定时任务配置](#2-定时任务配置)
3. [抓取过滤规则](#3-抓取过滤规则)
4. [图片全流程处理规则](#4-图片全流程处理规则)
5. [AI 预打标逻辑](#5-ai-预打标逻辑)
6. [数据库设计](#6-数据库设计)
7. [人工复审全逻辑](#7-人工复审全逻辑)
8. [素材分流入库逻辑](#8-素材分流入库逻辑)
9. [新增标签链路](#9-新增标签链路)
10. [跨模块数据同步](#10-跨模块数据同步)
11. [全量异常与边界处理](#11-全量异常与边界处理)

---

## 0. 实际实现架构（V2.0 更新）

> 以下为实际代码实现的全流程，与原始设计（§1-§11）的主要差异：
> - 抓取方式：Playwright 直接操控 Chrome 浏览器，非 OpenClaw 外部 API
> - AI 模型：doubao-seed-1-6-vision-250815（豆包视觉模型）
> - 图片处理：CDN 原图直接下载，未实现去水印/裁剪/脱敏 pipeline（待后续迭代）
> - 封面筛选：视觉模型逐张判断 KEEP/DISCARD，过滤九宫格拼图等非单手特写
> - 新增功能：素材批量删除、管理模式、分页（9条/页）、待审优先排序

### 0.1 整体数据流

```
配置关键词 (openclaw_config)
  │
  ▼
┌────────────────────────────────────────────────────────┐
│ Phase 1: Playwright 浏览器抓取                          │
│ Chrome → XHS搜索 → 手动扫码登录(5分钟超时) → 筛选条件  │
│ (图文+最热+一周内) → 滚动加载20条 → 提取noteId/CDN     │
│ 封面URL/点赞数 → 按点赞排序取Top20 → 下载CDN原图       │
│ 文件: server/services/openclawScraper.js               │
└────────────────────────────────────────────────────────┘
  │ 20条素材 (noteId + coverImage + likes)
  ▼
┌────────────────────────────────────────────────────────┐
│ Phase 2: 封面筛选 (视觉模型)                            │
│ 逐张调用 doubao-seed-1-6-vision → KEEP(单手/双手美甲   │
│ 特写) / DISCARD(九宫格/拼图/产品照/对比图/插画)        │
│ 函数: filterCoverImages()                              │
│ 文件: server/services/aiTagger.js                      │
└────────────────────────────────────────────────────────┘
  │ ~12-15条通过
  ▼
┌────────────────────────────────────────────────────────┐
│ Phase 3: 排序入库                                       │
│ 按点赞降序 → 取Top9 → 创建batch记录 → INSERT OR        │
│ IGNORE 素材(source_id去重) → 写入图片记录(CDN原图=      │
│ original_url, 本地路径=processed_url) → 空标签占位      │
│ 状态: review_status='pending', tag_source='ai_prescan' │
│ 路由: POST /api/merchant/openclaw/config/trigger       │
│ 文件: server/routes/config.js                          │
└────────────────────────────────────────────────────────┘
  │
  ├─ 同步返回前端 (列表即时可见，状态=待审)
  │
  └─ 异步 ─────────────────────────────────────┐
                                                ▼
┌────────────────────────────────────────────────────────┐
│ Phase 4: AI 自动打标 (异步)                             │
│ 遍历新入库素材 → 获取封面图(本地转base64) → 调用       │
│ doubao-seed-1-6-vision → 五维标签约束prompt →          │
│ 花括号深度追踪解析JSON → Levenshtein模糊匹配纠正       │
│ → 写入 material_tags (shape/tone/craft/decor/style     │
│ + confidence)                                          │
│ 失败兜底: 规则表 (shape+tone → style映射)              │
│ 函数: runAITagging() / tagSingleImage()                │
│ 文件: server/services/aiTagger.js                      │
└────────────────────────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────────────────────────┐
│ Phase 5: 人工复审                                       │
│ ① 排序: CASE review_status — pending→rejected→approved │
│ ② 分页: 每页9条, 底部分页栏                            │
│ ③ 管理模式: 点击「管理」→ 复选框多选 → 全选/批量删除   │
│ ④ 复审弹窗: 查看/修正AI标签 → 通过/驳回(必填原因)/暂存 │
│ ⑤ 通过后异步同步: syncApprovedMaterial()               │
│ 文件: src/views/merchant/TrendAnalysis.vue             │
│       src/components/merchant/ReviewModal.vue           │
│       server/routes/material.js                        │
└────────────────────────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────────────────────────┐
│ Phase 6: 素材管理                                       │
│ 批量删除: DELETE /api/merchant/material/xhs/batch      │
│ → 软删除(is_deleted=1) + 清除material_tags             │
│ → 同步影响「爆款素材生成」页面(is_deleted=0过滤)       │
│ 刷新列表: 重新走Phase 1-4全流程                        │
│ 修改配置: PUT /api/merchant/openclaw/config            │
└────────────────────────────────────────────────────────┘
```

### 0.2 核心技术细节

#### 0.2.1 Playwright 抓取 (openclawScraper.js)

| 项目 | 实现 |
|------|------|
| 浏览器 | Chromium，`channel: 'chrome'`, `headless: false` |
| 反检测 | `--disable-blink-features=AutomationControlled` + 真实 UA + `navigator.webdriver=false` |
| 登录 | 轮询 DOM 检测 `section.note-item`，每2秒一次，超时5分钟 |
| 搜索URL | `/search_result?keyword=关键词1+关键词2+关键词3&type=51` |
| 筛选器 | 依次点击「筛选」→「图文」→「最热」→「一周内」 |
| 滚动 | 15次 × 500px，间隔1秒 |
| 提取 | `section.note-item` → `a[href*="/explore/"]` → noteId；`img.src` 去参数 → CDN原图 |
| 点赞提取 | 策略1：找叶子 `<span>` 中纯数字内容；策略2：textContent 最后 ≥3位数字 |
| 图片下载 | `page.request.get(cdnUrl)` 利用浏览器cookie，保存至 `server/public/processed/<noteId>.jpg`，文件>500字节且已缓存则跳过 |

#### 0.2.2 封面筛选 (filterCoverImages)

| 项目 | 实现 |
|------|------|
| 模型 | `doubao-seed-1-6-vision-250815` |
| API | `https://ark.cn-beijing.volces.com/api/v3/chat/completions` |
| 超时 | 60秒 |
| 输出 | KEEP（单手/双手美甲特写）或 DISCARD（九宫格/拼图/产品照/对比图/插画/文字） |
| 典型过滤率 | 约30-40%（九宫格为主） |

#### 0.2.3 AI 打标 (tagSingleImage / runAITagging)

| 项目 | 实现 |
|------|------|
| 模型 | `doubao-seed-1-6-vision-250815` |
| 超时 | 120秒，失败自动重试1次 |
| Prompt | 五维标签枚举约束 + 严格JSON输出格式 |
| JSON解析 | 花括号深度追踪算法(`extractJSON`)，正确处理嵌套confidence对象 |
| 模糊匹配 | Levenshtein编辑距离，将超范围标签值纠正为最近枚举值 |
| 规则兜底 | shape+tone → style映射表（如 `杏仁甲|裸色 → 温柔风`） |
| 置信度阈值 | 单维度 < 0.5 留空，待人工复审 |

#### 0.2.4 素材管理功能

| 功能 | 实现 |
|------|------|
| 排序 | `CASE WHEN review_status='approved' THEN 2 WHEN 'rejected' THEN 1 ELSE 0 END` — 待审最前 |
| 分页 | 每页9条，`GET /api/merchant/material/xhs/list?limit=9&offset=N`，返回total用于计算总页数 |
| 管理模式 | 默认隐藏复选框，点击「管理」→ 出现复选框/全选/批量删除/完成 |
| 批量删除 | `DELETE /api/merchant/material/xhs/batch` — 软删除 `is_deleted=1` + 清除 material_tags |
| 删除确认 | 前端 `confirm()` 弹窗，显示选中数量 |
| 同步影响 | MaterialGenerate.vue「爆款素材生成」自动同步（共用 `is_deleted=0` 过滤） |

### 0.3 接口清单（实际实现）

| 方法 | 路径 | 说明 | 文件 |
|------|------|------|------|
| `GET` | `/api/merchant/openclaw/config` | 查询抓取配置 | server/routes/config.js |
| `PUT` | `/api/merchant/openclaw/config` | 更新抓取配置 | server/routes/config.js |
| `POST` | `/api/merchant/openclaw/config/trigger` | 手动触发抓取(全流程) | server/routes/config.js |
| `GET` | `/api/merchant/material/xhs/list` | 素材列表(排序/分页/筛选) | server/routes/material.js |
| `GET` | `/api/merchant/material/xhs/:id` | 素材详情 | server/routes/material.js |
| `POST` | `/api/merchant/material/xhs/:id/review` | 提交复审 | server/routes/material.js |
| `PUT` | `/api/merchant/material/xhs/:id/tags` | 修正标签 | server/routes/material.js |
| `DELETE` | `/api/merchant/material/xhs/batch` | 批量删除(新增) | server/routes/material.js |
| `GET` | `/api/merchant/material/xhs/logs/:id` | 操作日志 | server/routes/material.js |
| `GET` | `/api/merchant/label/system` | 标签体系 | server/routes/label.js |
| `POST` | `/api/merchant/label/create` | 新建标签 | server/routes/label.js |
| `GET` | `/api/merchant/xhs/trend` | 站外标签趋势 | server/routes/config.js |
| `POST` | `/api/common/openclaw/xhs/push` | OpenClaw推送(备用) | server/routes/openclaw.js |

### 0.4 数据库表（实际使用）

| 表名 | 用途 |
|------|------|
| `openclaw_config` | 抓取配置（关键词/min_likes等） |
| `xhs_scrape_batch` | 抓取批次记录 |
| `xhs_external_material` | 站外素材主表（source_id唯一，is_deleted软删除） |
| `xhs_material_image` | 素材图片（original_url=CDN原图，processed_url=本地路径） |
| `material_tags` | 五维标签（is_current版本控制，tag_source区分AI/人工） |
| `xhs_review_log` | 复审操作日志（含操作前后快照） |
| `label_system_config` | 标签体系配置（dimension+label_value唯一约束） |

### 0.5 与原始设计的差异对照

| 原始设计 | 实际实现 | 原因 |
|----------|----------|------|
| OpenClaw 外部API抓取 | Playwright 直接操控Chrome | 开发阶段无OpenClaw环境 |
| seeddream2.0 图片处理 | CDN原图直接下载 | 去水印/裁剪/脱敏待后续迭代 |
| seeddream2.0 AI打标 | doubao-seed-1-6-vision | 豆包视觉模型可用 |
| 无封面筛选 | 视觉模型KEEP/DISCARD | 过滤九宫格提升素材质量 |
| 无批量删除 | 管理模式+批量删除 | 运营需要素材管理能力 |
| 按热度排序 | 待审优先+热度排序 | 未审核素材需要优先处理 |
| 无分页 | 9条/页+分页栏 | 素材增多后需要分页 |

---

## 1. OpenClaw 对接规范

### 1.1 接口定义

OpenClaw 为外部自动化抓取工具，负责按配置规则从小红书平台采集美甲相关笔记素材，经预处理后推送至本平台。

#### 1.1.1 素材推送接口（OpenClaw → 本平台）

```
POST /api/common/openclaw/xhs/push
```

**请求头**：

| Header | 值 | 说明 |
|--------|-----|------|
| `Content-Type` | `application/json` | — |
| `X-OpenClaw-Key` | `<api_key>` | 平台签发的 API Key，后台可配置/轮换 |
| `X-OpenClaw-Timestamp` | `1716790800` | Unix 秒级时间戳 |
| `X-OpenClaw-Sign` | `<sha256_hex>` | 签名，算法见 §1.2 |
| `X-OpenClaw-Batch-Id` | `uuid` | 本批次的唯一标识，用于幂等 |

**请求体**：

```json
{
  "batch_id": "b7f8a9c1-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
  "scrape_time": "2026-05-27T03:00:00Z",
  "keyword_set": ["美甲爆款", "显白美甲", "春日美甲"],
  "total_scraped": 150,
  "after_filter": 42,
  "materials": [
    {
      "source_id": "xhs_642a1b3c8f9e",
      "source_url": "https://www.xiaohongshu.com/explore/642a1b3c8f9e",
      "author_nickname": "美甲达人Luna",
      "title": "春日显白美甲合集｜温柔到骨子里",
      "description": "整理了最近超火的几款显白美甲...",
      "cover_image_url": "https://sns-webpic.xhscdn.com/xxx",
      "images": [
        "https://sns-webpic.xhscdn.com/xxx_1",
        "https://sns-webpic.xhscdn.com/xxx_2"
      ],
      "engagement": {
        "likes": 3200,
        "collects": 1800,
        "comments": 456,
        "shares": 120
      },
      "publish_time": "2026-05-25T10:30:00Z",
      "tags": ["美甲", "显白美甲", "春日美甲", "温柔风"],
      "scrape_time": "2026-05-27T03:00:05Z"
    }
  ]
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `batch_id` | string(uuid) | 是 | 批次唯一标识，用于幂等去重 |
| `scrape_time` | string(datetime) | 是 | 抓取任务执行时间 |
| `keyword_set` | string[] | 是 | 本批次使用的关键词集合 |
| `total_scraped` | int | 是 | 原始抓取总量 |
| `after_filter` | int | 是 | 经 OpenClaw 侧初筛后数量 |
| `materials[].source_id` | string | 是 | 小红书笔记唯一 ID |
| `materials[].source_url` | string | 是 | 笔记原始链接 |
| `materials[].author_nickname` | string | 是 | 作者昵称（入库脱敏） |
| `materials[].title` | string | 否 | 笔记标题 |
| `materials[].description` | string | 否 | 笔记正文摘要 |
| `materials[].cover_image_url` | string | 是 | 封面图 URL |
| `materials[].images` | string[] | 否 | 全部图片 URL 列表 |
| `materials[].engagement.likes` | int | 是 | 点赞数 |
| `materials[].engagement.collects` | int | 是 | 收藏数 |
| `materials[].engagement.comments` | int | 是 | 评论数 |
| `materials[].engagement.shares` | int | 否 | 分享数 |
| `materials[].publish_time` | string(datetime) | 是 | 笔记发布时间 |
| `materials[].tags` | string[] | 否 | 小红书原文标签 |
| `materials[].scrape_time` | string(datetime) | 是 | 该条抓取时间 |

**成功响应**（HTTP 200）：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "batch_id": "b7f8a9c1-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
    "received": 42,
    "duplicated": 5,
    "accepted": 37,
    "materials": [
      {
        "source_id": "xhs_642a1b3c8f9e",
        "internal_id": 1001,
        "status": "accepted"
      }
    ]
  }
}
```

**幂等处理**：同一 `batch_id` 的重复推送返回 `duplicated` 计数，不重复入库。`source_id` 维度的重复素材自动跳过，记录在 `duplicated` 中。

### 1.2 签名算法

```
sign = SHA256(api_key + timestamp + batch_id + api_secret)
```

- `api_key`：取自请求头 `X-OpenClaw-Key`
- `timestamp`：取自请求头 `X-OpenClaw-Timestamp`
- `batch_id`：取自请求头 `X-OpenClaw-Batch-Id`
- `api_secret`：平台为 OpenClaw 签发的密钥，服务端存储

**验签流程**：
1. 检查 `timestamp` 与服务器时间偏差 ≤ 300 秒（防重放）
2. 服务端以同样算法计算签名，恒定时间比较
3. 验签失败返回 HTTP 401，错误码 `AUTH_SIGN_INVALID`

### 1.3 重试策略

| 场景 | 策略 |
|------|------|
| 网络超时（连接超时 30s，读取超时 60s） | OpenClaw 侧指数退避重试，间隔 1min / 5min / 15min，最多 3 次 |
| 验签失败 | 不重试，人工排查密钥配置 |
| 业务错误（如参数校验失败） | 不重试，记录错误日志 |
| 服务端 5xx | 间隔 5min，最多重试 2 次 |

### 1.4 抓取配置查询接口（本平台 → OpenClaw 配置管理）

```
GET  /api/merchant/openclaw/config          # 查询当前配置
PUT  /api/merchant/openclaw/config          # 更新配置
POST /api/merchant/openclaw/config/trigger   # 手动触发一次抓取
```

配置项结构：

```json
{
  "keywords": ["美甲爆款", "显白美甲", "春日美甲", "猫眼美甲", "渐变美甲"],
  "exclude_keywords": ["穿搭", "护肤", "美妆", "发型", "减肥"],
  "min_engagement": {
    "likes": 100,
    "collects": 50
  },
  "schedule": {
    "cron": "0 3 * * 1",
    "enabled": true
  },
  "max_per_batch": 200,
  "date_range_days": 7
}
```

---

## 2. 定时任务配置

### 2.1 任务定义

| 属性 | 值 |
|------|-----|
| 任务名称 | `xhs_scrape_scheduler` |
| 执行周期 | 每周一 03:00（北京时间），可通过配置修改 |
| Cron 表达式 | `0 3 * * 1`（默认） |
| 任务类型 | 定时触发 → 调用 OpenClaw API → 等待回调 → 入库 |
| 超时时间 | 30 分钟（含 OpenClaw 抓取 + 推送全链路） |
| 并发控制 | 同一时刻仅允许 1 个实例运行 |

### 2.2 执行流程

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│ Cron 触发    │ →   │ 调用 OpenClaw │ →   │ OpenClaw    │ →   │ 接收 Push API│
│ (03:00 Mon) │     │ 启动抓取任务  │     │ 抓取+预处理  │     │ 素材入库     │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
```

详细步骤：
1. **03:00** — Cron 触发，检查是否有未完成的任务实例，有则跳过本次
2. **03:00** — 读取 `openclaw_config` 表当前配置，组装请求参数
3. **03:01** — 调用 OpenClaw 抓取启动接口，传入关键词、互动阈值、时间范围
4. **03:01~03:25** — OpenClaw 执行抓取、初筛、图片下载、预处理
5. **03:25~03:30** — OpenClaw 调用 `POST /api/common/openclaw/xhs/push` 逐批推送
6. **03:30** — 本平台完成入库、图片处理、AI 预打标，任务结束

### 2.3 幂等保障

| 层级 | 机制 |
|------|------|
| 任务级 | 分布式锁（Redis key `lock:xhs_scrape`，TTL 30min），获取失败则跳过 |
| 批次级 | `batch_id` 唯一约束，重复推送幂等返回 |
| 素材级 | `source_id` 唯一约束，重复素材自动去重 |
| 图片级 | 图片 hash（SHA256）去重，相同图片不重复处理 |

### 2.4 失败重试

| 失败阶段 | 重试策略 |
|----------|----------|
| OpenClaw 抓取启动失败 | 间隔 1h 重试 1 次，仍失败则标记任务异常，次日凌晨补跑 |
| 图片下载超时/失败 | 单张重试 2 次（间隔 10s），仍失败则标记 `image_status=failed` |
| AI 预打标失败 | 标记 `tag_status=unlabeled`，人工复审时手动打标 |
| 整批次推送超时 | OpenClaw 侧自动重试，30min 内未完成则标记任务超时 |

---

## 3. 抓取过滤规则

### 3.1 关键词库

**正向关键词（满足任一即采集）**：

| 类别 | 关键词 |
|------|--------|
| 核心词 | 美甲、美甲款式、美甲推荐、美甲设计 |
| 款式词 | 渐变美甲、猫眼美甲、法式美甲、纯色美甲、手绘美甲、晕染美甲、跳色美甲、延长甲 |
| 场景词 | 显白美甲、春日美甲、夏日美甲、秋冬美甲、约会美甲、婚礼美甲、通勤美甲 |
| 风格词 | 温柔风美甲、ins风美甲、日式美甲、欧美美甲、简约美甲、甜酷美甲 |
| 特征词 | 短甲美甲、方圆甲、杏仁甲、裸色美甲、红色美甲、猫眼、魔镜粉 |

**负向关键词（命中任一则排除）**：

| 类别 | 关键词 |
|------|--------|
| 非美甲 | 穿搭、护肤、美妆教程、发型、减肥、健身、美食 |
| 广告嫌疑 | 拼单、代购、加V、私信、免费送、招代理 |
| 非目标内容 | 美甲培训、美甲学校、开店加盟、美甲批发、穿戴甲、甲片贴纸 |

### 3.2 内容过滤规则

| 过滤条件 | 阈值 | 处理方式 |
|----------|------|----------|
| 互动量过低 | 点赞 < 100 或 收藏 < 50 | 排除（OpenClaw 侧初筛） |
| 非美甲图片 | AI 图像分类置信度 < 0.7 | 排除 |
| 含人脸（非手部） | 人脸检测面积 > 图片 15% | 脱敏后保留，无法脱敏则排除 |
| 广告/营销内容 | 文案含违规词 ≥ 3 个 | 排除 |
| 重复笔记 | 同 `source_id` 已存在 | 去重跳过 |
| 图片数量不足 | 有效美甲图片 = 0 | 排除 |
| 发布时间过旧 | 发布时间 > 30 天 | 排除 |

### 3.3 热度阈值（分平台运营后台可配置）

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `min_likes` | 100 | 最低点赞数 |
| `min_collects` | 50 | 最低收藏数 |
| `min_comments` | 0 | 最低评论数（不过滤） |
| `heat_formula` | `likes×1 + collects×2 + comments×0.5 + shares×1.5` | 综合热度排序公式 |

---

## 4. 图片全流程处理规则

### 4.1 处理流水线

```
原始图片下载 → 格式校验 → 去水印 → 美甲区域裁剪 → 隐私脱敏 → 合规检查 → 压缩存储 → 入库
```

### 4.2 各阶段详细规则

#### 4.2.1 下载与格式校验

| 规则 | 说明 |
|------|------|
| 支持格式 | JPG、PNG、WebP |
| 最大尺寸 | 单张 ≤ 10MB，超出则等比压缩至 10MB 以内 |
| 最小尺寸 | 短边 ≥ 200px，小于则排除 |
| 下载超时 | 单张 15s，超时重试 2 次 |
| 重命名规则 | `{material_id}_{seq}_{sha256_prefix8}.jpg` |

#### 4.2.2 去水印

调用 **seeddream2.0 模型 inpainting 能力**，去除图片中的水印/文字覆盖区域：

- **输入**：原始图片 + 水印检测框（由 OCR + 边缘检测预处理定位）
- **处理**：seeddream2.0 inpainting，仅填充水印区域，保持美甲主体不变
- **输出**：去水印后的图片
- **失败降级**：水印区域 > 图片面积 30% 则标记 `image_status=watermark_failed`，保留原图进入人工复审

#### 4.2.3 美甲区域裁剪

调用 **seeddream2.0 模型分割能力** 识别手部/美甲区域：

- **目标**：提取图片中美甲核心展示区域，去除无关背景
- **裁剪策略**：
  - 检测手部关键点 → 定位指甲区域 bounding box
  - 向外扩展 15% 作为安全边距
  - 输出为 1:1 正方形（短边补白填充）
- **最小裁剪区域**：裁剪后 ≥ 300×300px，否则保留原图
- **多手检测**：若图片含多只手，取最大美甲区域

#### 4.2.4 隐私脱敏

调用 **seeddream2.0 模型人脸检测 + 模糊**：

- **检测**：人脸检测（含镜面反射中人脸）、身份证/二维码/手机号 OCR
- **处理**：
  - 人脸区域：高斯模糊（核大小 = 区域宽度 × 0.1）
  - 敏感文字：同色块覆盖
- **脱敏失败**：人脸面积 > 图片 30% 或无法有效脱敏 → 排除该图片

#### 4.2.5 合规检查

| 检查项 | 方法 | 不通过处理 |
|--------|------|------------|
| 色情/低俗内容 | seeddream2.0 NSFW 分类 | 排除，标记 `compliance_blocked` |
| 暴力/血腥 | seeddream2.0 安全分类 | 排除，标记 `compliance_blocked` |
| 侵权水印（其他平台Logo） | OCR + 模板匹配 | 去水印处理，无法去除则标记 |
| 非美甲内容 | seeddream2.0 细粒度分类 | 置信度 < 0.5 则排除 |

#### 4.2.6 输出规格

| 参数 | 值 |
|------|-----|
| 最终格式 | JPG（质量 85%）|
| 最大分辨率 | 1200×1200px（等比缩放，短边 ≥ 600px）|
| 文件名 | `{material_id}_{seq}_processed.jpg` |
| 存储路径 | `{oss_bucket}/nailia/material/xhs/{yyyy}/{mm}/{material_id}/` |
| 缩略图 | 生成 300×300 缩略图用于列表展示 |

### 4.3 图片处理状态枚举

```
pending        — 待处理
processing     — 处理中
processed      — 处理完成
watermark_failed — 去水印失败（保留原图）
crop_failed    — 裁剪失败（保留原图）
privacy_failed — 脱敏失败
compliance_blocked — 合规拦截
failed         — 处理失败
```

---

## 5. AI 预打标逻辑

### 5.1 调用流程

```
素材入库 → 提取封面图 → 调用 AI 打标 API → 解析五维标签 → 写入 material_tags 表
```

### 5.2 AI 打标接口

**内部调用（非对外 API）**：

```
POST /api/internal/ai/tag-nail-image
```

**请求体**：

```json
{
  "image_url": "https://oss/nailia/material/xhs/2026/05/1001/1001_1_processed.jpg",
  "material_id": 1001,
  "context": {
    "title": "春日显白美甲合集",
    "description": "整理了最近超火的几款显白美甲...",
    "xhs_tags": ["美甲", "显白美甲", "温柔风"]
  }
}
```

**响应体**：

```json
{
  "code": 0,
  "data": {
    "tags": {
      "shape": "杏仁甲",
      "tone": "裸色",
      "craft": "渐变",
      "decor": "碎钻",
      "style": "温柔风"
    },
    "confidence": {
      "shape": 0.92,
      "tone": 0.88,
      "craft": 0.75,
      "decor": 0.68,
      "style": 0.85
    }
  }
}
```

### 5.3 标签匹配规则

| 规则 | 说明 |
|------|------|
| 映射约束 | AI 输出标签**必须**在 `label_system` 枚举值范围内，超范围标签回退到最相近的已存在标签 |
| 置信度阈值 | 单维度置信度 < 0.5 时，该维度留空（`''`），待人工复审补充 |
| 风格缺失 | 风格维度优先用图片 + 标题/描述综合分析；仍无法判断则调用 `styleRecommendMap` 逻辑给出 Top 3 推荐 |
| 多图素材 | 取所有图片的打标结果，按置信度加权投票，取最优标签组合 |
| 上下文增强 | 标题/描述中的关键词（如"猫眼""渐变""法式"）作为标签推理的增强 prompt |

### 5.4 预打标结果存储

预打标结果写入 `material_tags` 表，`source` 字段标记为 `ai_prescan`，`confidence` 字段记录各维度置信度 JSON。

| 字段 | 值 |
|------|-----|
| `tag_source` | `ai_prescan` |
| `is_auto` | `1` |
| `confidence` | `{"shape":0.92,"tone":0.88,"craft":0.75,"decor":0.68,"style":0.85}` |

---

## 6. 数据库设计

### 6.1 ER 关系

```
openclaw_config (1)  ←→  (N) xhs_scrape_batch
xhs_scrape_batch (1)  ←→  (N) xhs_external_material
xhs_external_material (1)  ←→  (N) xhs_material_image
xhs_external_material (1)  ←→  (1) material_tags
xhs_external_material (1)  ←→  (N) xhs_review_log
label_system (1)  ←→  (N) label_new_request
```

### 6.2 表结构

#### `openclaw_config` — OpenClaw 抓取配置表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | int | PK, AUTO_INCREMENT | 主键 |
| `keywords` | json | NOT NULL | 正向关键词数组 |
| `exclude_keywords` | json | NOT NULL | 负向关键词数组 |
| `min_likes` | int | NOT NULL, DEFAULT 100 | 最低点赞数 |
| `min_collects` | int | NOT NULL, DEFAULT 50 | 最低收藏数 |
| `schedule_cron` | varchar(32) | NOT NULL, DEFAULT '0 3 * * 1' | Cron 表达式 |
| `schedule_enabled` | tinyint | NOT NULL, DEFAULT 1 | 是否启用定时 |
| `max_per_batch` | int | NOT NULL, DEFAULT 200 | 每批上限 |
| `date_range_days` | int | NOT NULL, DEFAULT 7 | 抓取时间范围（天） |
| `updated_by` | varchar(64) | NULL | 最后修改人 |
| `created_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

#### `xhs_scrape_batch` — 抓取批次记录表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | int | PK, AUTO_INCREMENT | 主键 |
| `batch_id` | varchar(64) | UNIQUE, NOT NULL | 批次 UUID |
| `status` | varchar(24) | NOT NULL, DEFAULT 'pending' | pending/running/completed/failed/timeout |
| `total_scraped` | int | NULL | 原始抓取总量 |
| `after_filter` | int | NULL | 初筛后数量 |
| `received` | int | NULL | 平台接收数量 |
| `duplicated` | int | NOT NULL, DEFAULT 0 | 重复数量 |
| `accepted` | int | NOT NULL, DEFAULT 0 | 实际入库数量 |
| `keyword_set` | json | NULL | 本批次使用的关键词 |
| `error_message` | text | NULL | 异常信息 |
| `started_at` | datetime | NULL | 开始时间 |
| `completed_at` | datetime | NULL | 完成时间 |
| `created_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

#### `xhs_external_material` — 站外素材表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | int | PK, AUTO_INCREMENT | 内部素材 ID |
| `batch_id` | varchar(64) | FK → xhs_scrape_batch.batch_id | 所属批次 |
| `source_id` | varchar(128) | UNIQUE, NOT NULL | 小红书笔记 ID |
| `source_url` | varchar(512) | NOT NULL | 原始链接 |
| `author_nickname` | varchar(64) | NULL | 作者昵称（脱敏存储） |
| `title` | varchar(256) | NULL | 笔记标题 |
| `description` | text | NULL | 正文摘要 |
| `cover_image_url` | varchar(512) | NULL | 原始封面图 URL |
| `publish_time` | datetime | NULL | 笔记发布时间 |
| `xhs_tags` | json | NULL | 小红书原文标签 |
| `likes` | int | NOT NULL, DEFAULT 0 | 点赞数 |
| `collects` | int | NOT NULL, DEFAULT 0 | 收藏数 |
| `comments` | int | NOT NULL, DEFAULT 0 | 评论数 |
| `shares` | int | NOT NULL, DEFAULT 0 | 分享数 |
| `heat_score` | decimal(10,2) | NOT NULL, DEFAULT 0.00 | 综合热度分（按热度公式） |
| `review_status` | varchar(24) | NOT NULL, DEFAULT 'pending' | pending/approved/rejected/deferred |
| `reviewed_by` | varchar(64) | NULL | 复审人 |
| `reviewed_at` | datetime | NULL | 复审时间 |
| `reject_reason` | varchar(512) | NULL | 驳回原因 |
| `sync_status` | varchar(24) | NOT NULL, DEFAULT 'pending' | pending/synced/partial/failed |
| `is_deleted` | tinyint | NOT NULL, DEFAULT 0 | 逻辑删除 |
| `created_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**：
- `idx_batch_id` ON (`batch_id`)
- `idx_review_status` ON (`review_status`)
- `idx_sync_status` ON (`sync_status`)
- `idx_heat_score` ON (`heat_score` DESC)
- `idx_created_at` ON (`created_at`)

#### `xhs_material_image` — 素材图片表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | int | PK, AUTO_INCREMENT | 主键 |
| `material_id` | int | FK → xhs_external_material.id | 所属素材 |
| `seq` | tinyint | NOT NULL, DEFAULT 1 | 图片序号 |
| `original_url` | varchar(512) | NOT NULL | 原始图片 URL |
| `processed_url` | varchar(512) | NULL | 处理后图片 URL |
| `thumbnail_url` | varchar(512) | NULL | 缩略图 URL |
| `image_hash` | varchar(64) | NOT NULL | 图片 SHA256（去重用）|
| `width` | int | NULL | 宽度 |
| `height` | int | NULL | 高度 |
| `file_size` | int | NULL | 文件大小（bytes） |
| `image_status` | varchar(32) | NOT NULL, DEFAULT 'pending' | 处理状态（见 §4.3 枚举） |
| `process_error` | varchar(256) | NULL | 处理异常信息 |
| `is_cover` | tinyint | NOT NULL, DEFAULT 0 | 是否为封面图 |
| `created_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**：
- `idx_material_id` ON (`material_id`)
- `idx_image_hash` ON (`image_hash`)
- `idx_image_status` ON (`image_status`)

#### `material_tags` — 素材标签关联表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | int | PK, AUTO_INCREMENT | 主键 |
| `material_id` | int | FK → xhs_external_material.id | 素材 ID |
| `material_type` | varchar(24) | NOT NULL, DEFAULT 'xhs' | 素材类型：xhs/internal/generated |
| `shape` | varchar(32) | NULL | 甲型 |
| `tone` | varchar(32) | NULL | 色调 |
| `craft` | varchar(32) | NULL | 工艺 |
| `decor` | varchar(32) | NULL | 装饰元素 |
| `style` | varchar(32) | NULL | 风格 |
| `tag_source` | varchar(24) | NOT NULL, DEFAULT 'ai_prescan' | ai_prescan/manual_review/manual_create |
| `confidence` | json | NULL | 各维度置信度 |
| `is_current` | tinyint | NOT NULL, DEFAULT 1 | 是否为当前生效版本 |
| `created_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**：
- `idx_material_id` ON (`material_id`, `material_type`)
- `idx_tag_source` ON (`tag_source`)

#### `xhs_review_log` — 复审操作日志表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | int | PK, AUTO_INCREMENT | 主键 |
| `material_id` | int | FK → xhs_external_material.id | 素材 ID |
| `operator` | varchar(64) | NOT NULL | 操作人账号 |
| `operator_role` | varchar(24) | NOT NULL | 操作人角色 |
| `action` | varchar(24) | NOT NULL | approve/reject/defer/tag_modify/tag_create |
| `action_detail` | json | NULL | 操作详情（标签变更前后、驳回原因等） |
| `before_snapshot` | json | NULL | 操作前素材快照 |
| `after_snapshot` | json | NULL | 操作后素材快照 |
| `created_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 操作时间 |

**索引**：
- `idx_material_id` ON (`material_id`)
- `idx_operator` ON (`operator`)
- `idx_action` ON (`action`)
- `idx_created_at` ON (`created_at`)

#### `label_new_request` — 新增标签申请表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | int | PK, AUTO_INCREMENT | 主键 |
| `dimension` | varchar(24) | NOT NULL | 归属维度（shape/tone/craft/decor/style） |
| `label_name` | varchar(64) | NOT NULL | 新标签名称 |
| `requester` | varchar(64) | NOT NULL | 申请人 |
| `source_material_id` | int | NULL | 来源素材 ID |
| `supplement_desc` | varchar(256) | NULL | 补充说明 |
| `status` | varchar(24) | NOT NULL, DEFAULT 'pending' | pending/approved/rejected |
| `reviewed_by` | varchar(64) | NULL | 审批人 |
| `review_comment` | varchar(256) | NULL | 审批意见 |
| `created_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 申请时间 |
| `updated_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**：
- `idx_dimension` ON (`dimension`)
- `idx_status` ON (`status`)
- `uq_dim_label` UNIQUE (`dimension`, `label_name`)

### 6.3 全局标签体系配置表

扩展现有 `label_system` 常量对应的存储，支持动态新增：

#### `label_system_config` — 标签体系配置表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | int | PK, AUTO_INCREMENT | 主键 |
| `dimension` | varchar(24) | NOT NULL | 维度 key |
| `dimension_name` | varchar(32) | NOT NULL | 维度中文名 |
| `label_value` | varchar(64) | NOT NULL | 标签值 |
| `sort_order` | int | NOT NULL, DEFAULT 0 | 排序权重 |
| `is_active` | tinyint | NOT NULL, DEFAULT 1 | 是否启用 |
| `source` | varchar(24) | NOT NULL, DEFAULT 'system' | system/manual_add |
| `created_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**唯一约束**：`uq_dim_value` UNIQUE (`dimension`, `label_value`)

---

## 7. 人工复审全逻辑

### 7.1 复审入口

仅**平台运营账号**可进行复审操作。入口位于「爆款报告 → 站外小红书素材」区域的待审素材列表。

### 7.2 操作类型与状态流转

```
                     ┌──────────────┐
                     │   pending    │  ← 新入库素材默认状态
                     └──────┬───────┘
                            │
            ┌───────────────┼────────────────┐
            ▼               ▼                ▼
      ┌──────────┐   ┌──────────┐    ┌───────────┐
      │ approved │   │ rejected │    │ deferred  │
      └────┬─────┘   └────┬─────┘    └─────┬─────┘
           │               │                │
           ▼               ▼                ▼
      素材分流入库     记录驳回原因      保留待审库
      同步至素材池     不入库           后续再处理
```

### 7.3 各操作详细规则

#### 通过（approve）

1. 确认素材质量合格、标签标注准确
2. 可选：修正 AI 预打标签（点击标签进入编辑态，选择已有标签或新建）
3. 点击「通过」按钮 → 素材状态更新为 `approved`
4. 触发 §8 素材分流入库流程
5. 写入 `xhs_review_log`：action=`approve`

#### 驳回（reject）

1. **强制填写驳回原因**（前端校验，不可为空）
2. 驳回原因分类（下拉选择 + 文本补充）：
   - `quality_issue` — 图片质量不合格（模糊、非美甲主体、构图差）
   - `tag_mismatch` — AI 标签与实物严重不符
   - `duplicate_content` — 与已有素材高度重复
   - `content_policy` — 内容不合规
   - `other` — 其他（必填补充说明）
3. 素材状态更新为 `rejected`
4. 素材**不入库**，不进入后续分流
5. 写入 `xhs_review_log`：action=`reject`，`action_detail` 含驳回原因

#### 暂存（defer）

1. 素材有一定价值但不急于处理（如趋势未明朗、需更多参考）
2. 可选填写暂存备注
3. 素材状态更新为 `deferred`
4. 保留在待审库，后续可从「暂存」筛选器中找回
5. 写入 `xhs_review_log`：action=`defer`

### 7.4 标签修正操作

复审过程中可对 AI 预打标签进行修正：

1. 点击任意标签 → 弹出该维度的可选值列表（从 `label_system_config` 读取）
2. 选择已有标签值 → 即时更新
3. 若需新建标签 → 触发 §9 新增标签流程
4. 标签修正后自动写入 `material_tags` 新版本（`tag_source=manual_review`，`is_current=1`），旧版本 `is_current=0`

### 7.5 复审日志

每条复审操作写入 `xhs_review_log`，关键字段：

| 字段 | 说明 |
|------|------|
| `action_detail` | 操作上下文 JSON：`{"reject_reason":"...", "reason_category":"quality_issue", "tag_changes":{"before":{...},"after":{...}}}` |
| `before_snapshot` | 操作前 `xhs_external_material` + `material_tags` 快照 |
| `after_snapshot` | 操作后对应快照 |

日志保存 ≥ 180 天，支持按素材 ID / 操作人 / 操作类型 / 时间范围检索。

---

## 8. 素材分流入库逻辑

### 8.1 分流目标

复审通过（`review_status=approved`）的素材，自动分流至以下目标：

```
审核通过素材
    ├── ① AI试戴素材池（用户端可见，可用于试戴）
    ├── ② 爆款素材库（MaterialGenerate.vue 可引用）
    ├── ③ 全局标签库关联（标签维度热度数据更新）
    └── ④ 热度趋势数据（同步至 TrendAnalysis 模块）
```

### 8.2 分流规则

#### ① AI试戴素材池同步

| 操作 | 说明 |
|------|------|
| 写入表 | `tryon_material_pool`（如已有，否则新建） |
| 写入字段 | `material_id → source_material_id`，`image_url → processed_url`，`tags → material_tags`，`source_type = 'xhs'` |
| 同步时机 | 复审通过后立即执行 |
| 冲突处理 | `source_id` 已存在则更新图片和标签，不重复创建 |

#### ② 爆款素材库同步

| 操作 | 说明 |
|------|------|
| 写入表 | `trending_material_library` |
| 写入字段 | `material_id → source_material_id`，`image_url → thumbnail_url`，`tags → material_tags`，`heat_score → xhs_external_material.heat_score` |
| 同步时机 | 复审通过后立即执行 |
| 前端展示 | MaterialGenerate.vue「站外热门素材」区域展示 `source_type='xhs'` 且 `review_status='approved'` 的素材 |

#### ③ 全局标签库热度更新

| 操作 | 说明 |
|------|------|
| 更新维度 | 素材标签对应的五维标签值热度计数 +1 |
| 更新表 | `label_heat_counter`：`dimension, label_value, total_count, xhs_count, last_updated` |
| 热度重算 | 每日凌晨统一重算全维度热度权重 |
| 同步时机 | 素材复审通过后实时累加计数，热度分值每日重算 |

#### ④ 站外爆款标签热度同步

| 操作 | 说明 |
|------|------|
| 目标 | TrendAnalysis 模块「站外趋势」数据 |
| 同步数据 | `标签组合 × 出现频次 × 平均互动量` |
| 同步表 | `xhs_tag_trend`：`tags(json), material_count, avg_likes, avg_collects, period_start, period_end` |
| 同步时机 | 每日凌晨定时汇总近7天审核通过素材 |

### 8.3 同步状态追踪

`xhs_external_material.sync_status` 枚举：

| 值 | 说明 |
|-----|------|
| `pending` | 待同步（复审通过但尚未执行分流） |
| `syncing` | 同步进行中 |
| `synced` | 全部分流目标同步成功 |
| `partial` | 部分目标同步失败（`sync_error` 记录失败项） |
| `failed` | 全部同步失败 |

---

## 9. 新增标签链路

### 9.1 触发场景

1. **复审修正标签时**：现有 `label_system_config` 中无合适标签值，复审人员手动新建
2. **平台运营直接管理**：进入标签管理页，主动新增维度标签

### 9.2 新建标签表单规则

| 字段 | 规则 |
|------|------|
| 归属维度 | 下拉选择五大维度之一，必填 |
| 标签名称 | 文本输入，≤ 16 字符，不允许纯数字，不允许含特殊字符 `<>"'&` |
| 补充说明 | 文本输入，≤ 256 字符，说明标签含义/适用场景 |
| 来源素材 | 自动关联当前复审的素材 ID（如有） |

### 9.3 新建提交流程

```
复审人员填写新标签表单
    → 前端校验：同名标签在归属维度下是否已存在
    → 通过 → 写入 label_new_request 表（status=pending）
    → 写入 label_system_config 表（is_active=1, source='manual_add'）
    → 更新全局 labelSystem 常量缓存
    → 同步至 AI 打标模型标签集合（异步，24h 内生效）
    → 记录操作日志：action='tag_create'
```

### 9.4 标签同步规则

| 同步目标 | 同步方式 | 延迟 |
|----------|----------|------|
| 全局标签库（label_system_config） | 写入即生效 | 实时 |
| AI 打标模型标签集 | 异步推送新标签至模型 prompt 约束 | ≤ 24h |
| 前端 labelSystem 常量 | 页面刷新 / API 重新获取 | 实时 |
| 爆款趋势聚合维度 | 每日凌晨重算时自动纳入 | ≤ 24h |

### 9.5 重复标签校验

- **前端**：输入框失焦时检查 `label_system_config` 当前维度下是否存在同名标签
- **后端**：写入前检查唯一约束 `uq_dim_value`，冲突返回错误码 `LABEL_DUPLICATE`，提示「标签已存在，请重新选择」
- **交互**：冲突时输入框标红，下拉列表中高亮已存在标签

---

## 10. 跨模块数据同步

### 10.1 同步关系总览

```
xhs_external_material (站外素材)
    │
    ├──(approved)→ tryon_material_pool (AI试戴素材池)
    │                  └→ 用户端 AI 试戴功能可用
    │
    ├──(approved)→ trending_material_library (爆款素材库)
    │                  └→ MaterialGenerate.vue「站外热门素材」展陈
    │
    ├──(approved)→ label_heat_counter (标签热度计数)
    │                  └→ 每日凌晨重算 → dimensionHeat 更新
    │
    ├──(approved)→ xhs_tag_trend (站外标签趋势)
    │                  └→ TrendAnalysis.vue 站外趋势数据
    │
    └──(any status)→ hot_tags (站内标签热度交叉分析)
                       └→ 同质对比模块可引用站外热度作为参考基准
```

### 10.2 各同步链路详细

#### 链路 1：站外标签热度 → TrendAnalysis 趋势图

| 环节 | 说明 |
|------|------|
| 数据来源 | `xhs_tag_trend` 表，近 7 天审核通过的素材标签聚合 |
| 聚合维度 | 五维标签组合，按出现频次排序 |
| 同步周期 | 每日 02:00 执行 |
| 前端展示 | TrendAnalysis.vue「站外趋势」区域可切换查看 |
| 数据字段 | `tags(json)`, `material_count`, `avg_heat_score`, `trend_direction(up/flat/down)` |

#### 链路 2：站外热度数据 → 同质店铺对比

| 环节 | 说明 |
|------|------|
| 数据来源 | `xhs_tag_trend` + 平台 endel 已有标签数据 |
| 对比逻辑 | 本店标签组合 vs 站外热门标签组合，识别本店缺失的站外热门款 |
| 同步周期 | 每日 02:00 |
| 前端展示 | TrendAnalysis.vue「缺失热门标签」区域 |

#### 链路 3：审核通过素材 → MaterialGenerate 站外精选

| 环节 | 说明 |
|------|------|
| 数据来源 | `xhs_external_material`（`review_status=approved`, `is_deleted=0`） |
| 排序规则 | 按 `heat_score` 降序，取 TOP 6 |
| 刷新周期 | 实时（审核通过即出现在列表中） |
| 前端展示 | MaterialGenerate.vue「站外热门素材」卡片区域，点击「填入此标签」将标签填入自定义选择器 |

### 10.3 同步一致性保障

| 机制 | 说明 |
|------|------|
| 事务保证 | 审核通过操作 + 分流入库在同一数据库事务中完成 |
| 失败补偿 | `sync_status` 标记，定时任务扫描 `sync_status IN ('pending','partial','failed')` 补偿重试 |
| 数据校验 | 每日凌晨校验 `xhs_external_material` 与各目标表的素材数量一致性 |
| 幂等写入 | 所有同步操作使用 `source_id` / `material_id` 唯一键保证幂等 |

---

## 11. 全量异常与边界处理

### 11.1 抓取阶段异常

| 异常场景 | 处理方式 | 用户感知 |
|----------|----------|----------|
| OpenClaw 服务不可达（连接超时） | 间隔 1h 重试 1 次，仍失败标记批次 `failed`，次日补跑 | 后台任务日志可见；前端无直接影响 |
| 单次抓取返回空结果 | 批次标记 `completed`，`total_scraped=0`，不阻塞后续周期 | 无感知 |
| 抓取返回量超过 `max_per_batch` | OpenClaw 侧分批推送，每批 ≤ `max_per_batch` | 无感知 |
| 关键词配置为空 | 拒绝启动抓取，记录日志 `config_error` | 后台提示「请先配置抓取关键词」 |

### 11.2 图片处理异常

| 异常场景 | 处理方式 | 用户感知 |
|----------|----------|----------|
| 原始图片 URL 失效（404/403） | 重试 2 次，仍失败标记 `image_status=failed` | 复审时该图片显示占位图「图片加载失败」 |
| 图片下载超时 | 单张 15s 超时，重试 2 次，仍失败标记 `failed` | 同上 |
| 图片格式不支持（GIF/BMP等） | 尝试转码为 JPG，失败则标记 `failed` | 复审时显示「格式不支持」 |
| 图片大小超限（>10MB） | 等比压缩至 10MB 以内，若压缩后质量 < 60% 则保留压缩版 + 标注 | 复审时可查看压缩后图片 |
| 去水印失败（水印面积过大） | 标记 `watermark_failed`，保留原图，增加「含水印」标识 | 复审时显示「含水印」标签，可手动驳回 |
| 合规拦截（NSFW/违规） | 图片标记 `compliance_blocked`，素材整体标记为 `rejected` | 不入待审库，记录拦截日志 |
| 无法检测到美甲区域 | 标记 `crop_failed`，保留原图 | 复审时显示原图，可手动判断 |
| 人脸脱敏失败 | 标记 `privacy_failed`，素材仍入待审库但显示「隐私风险」警告 | 复审时明显标红提示 |

### 11.3 AI 预打标异常

| 异常场景 | 处理方式 | 用户感知 |
|----------|----------|----------|
| AI 服务超时（>10s） | 重试 1 次，仍失败标记 `tag_status=unlabeled` | 复审时标签区域显示「AI 标待标注」，需人工完整打标 |
| AI 返回标签不在枚举范围内 | 回退到最相近的已存在标签值（编辑距离最小匹配） | 标签旁显示「AI推断」小字提示 |
| 所有维度置信度均 < 0.5 | 全部留空，标记 `confidence=low` | 复审时标签区域空白，需人工逐维选择 |
| 部分维度未识别（如无法判断工艺） | 该维度留空，其余维度正常写入 | 复审时该维度显示「—」，点击可选择 |

### 11.4 复审阶段异常

| 异常场景 | 处理方式 | 用户感知 |
|----------|----------|----------|
| 驳回未填原因 | 前端校验拦截，按钮置灰 | Toast 提示「请填写驳回原因」 |
| 并发复审同一素材 | 乐观锁（`updated_at` 版本号校验），后提交者提示「素材已被他人处理」 | 弹窗提示，刷新列表 |
| 复审过程中素材被删除 | 操作时校验 `is_deleted=0`，已删除则提示「素材不存在」 | 弹窗提示，返回列表 |
| 新建标签与已有标签同名 | 唯一约束拦截，返回 `LABEL_DUPLICATE` | 输入框标红，提示「标签已存在」 |

### 11.5 分流同步异常

| 异常场景 | 处理方式 | 用户感知 |
|----------|----------|----------|
| 部分分流目标写入失败 | `sync_status=partial`，`sync_error` 记录失败目标 | 后台日志告警；定时补偿任务自动重试 |
| 全部目标写入失败 | `sync_status=failed`，事务回滚，素材状态保持 `approved` | 后台日志严重告警；人工介入 |
| 重复分流（同一素材已同步） | `source_id` 唯一键去重，UPDATE 而非 INSERT | 无感知 |
| 同步时目标表结构变更 | 捕获异常，记录错误详情，暂停该目标同步 | 后台监控告警 |

### 11.6 定时任务异常

| 异常场景 | 处理方式 | 用户感知 |
|----------|----------|----------|
| 上次任务未完成（分布式锁未释放） | 跳过本次触发，记录日志 | 后台日志可见 |
| 任务执行超过 30min | 超时自动终止，标记 `timeout`，记录已入库的素材 | 后台告警；次日补跑 |
| 连续 3 次执行失败 | 自动停用配置 `schedule_enabled=0`，发送通知 | 平台运营收到停用通知，需手动排查后重新启用 |
| Redis 锁服务不可用 | 降级为数据库行级锁（`SELECT ... FOR UPDATE` 查 `xhs_scrape_batch` 最新记录） | 降级保护，可能重复执行但幂等兜底 |

### 11.7 数据边界场景

| 场景 | 处理规则 |
|------|----------|
| 单素材多图片，部分图片处理成功部分失败 | 以成功处理的图片为准，失败图片显示占位图；不影响素材整体审核 |
| 素材来源已被小红书删除（后续访问 404） | 保留已入库素材和图片，`source_url` 访问时显示「原文已删除」 |
| 同一素材被多次抓取（跨批次重复） | `source_id` 唯一约束，后续推送自动跳过；若标签有更新则更新 `material_tags` 新版本 |
| 素材标签全为空（AI 未识别 + 复审未补充） | 复审时不允许通过，前端校验「请至少完成核心三维标签」 |
| 仅有封面图无内容图 | 封面图作为唯一图片处理，`seq=1, is_cover=1` |
| 图片 hash 相同但 URL 不同 | 复用已处理图片，不重复下载处理 |

---

## 附录 A：全局状态枚举汇总

### A.1 素材复审状态 `review_status`

```
pending    — 待复审
approved   — 已通过
rejected   — 已驳回
deferred   — 暂存
```

### A.2 图片处理状态 `image_status`

```
pending            — 待处理
processing         — 处理中
processed          — 处理完成
watermark_failed   — 去水印失败
crop_failed        — 裁剪失败
privacy_failed     — 脱敏失败
compliance_blocked — 合规拦截
failed             — 处理失败
```

### A.3 同步状态 `sync_status`

```
pending  — 待同步
syncing  — 同步中
synced   — 同步完成
partial  — 部分失败
failed   — 同步失败
```

### A.4 批次状态 `batch_status`

```
pending   — 待执行
running   — 执行中
completed — 已完成
failed    — 失败
timeout   — 超时
```

### A.5 标签来源 `tag_source`

```
ai_prescan     — AI 预打标
manual_review  — 人工复审修正
manual_create  — 人工新建
```

### A.6 驳回原因分类 `reject_reason_category`

```
quality_issue     — 图片质量不合格
tag_mismatch      — AI 标签与实物不符
duplicate_content — 与已有素材重复
content_policy    — 内容不合规
other             — 其他
```

---

## 附录 B：全局错误码补充

| 错误码 | HTTP 状态 | 说明 |
|--------|-----------|------|
| `AUTH_SIGN_INVALID` | 401 | OpenClaw 签名验证失败 |
| `AUTH_TIMESTAMP_EXPIRED` | 401 | 请求时间戳过期 |
| `BATCH_DUPLICATE` | 200 | 批次重复推送（幂等返回） |
| `MATERIAL_DUPLICATE` | 200 | 素材已存在（幂等跳过） |
| `MATERIAL_NOT_FOUND` | 404 | 素材不存在或已删除 |
| `MATERIAL_CONCURRENT_MODIFIED` | 409 | 素材已被他人修改 |
| `LABEL_DUPLICATE` | 409 | 标签已存在 |
| `LABEL_INVALID_CHARS` | 422 | 标签名含非法字符 |
| `IMAGE_PROCESS_FAILED` | 500 | 图片处理失败 |
| `AI_TAG_TIMEOUT` | 500 | AI 打标超时 |
| `SYNC_PARTIAL_FAILED` | 500 | 部分同步目标失败 |
| `SCRAPE_CONFIG_EMPTY` | 422 | 抓取关键词未配置 |
| `TASK_LOCK_CONFLICT` | 409 | 定时任务执行中，跳过本次 |

---

## 附录 C：接口清单汇总

| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| `POST` | `/api/common/openclaw/xhs/push` | OpenClaw 素材推送 | 外部（OpenClaw） |
| `GET` | `/api/merchant/openclaw/config` | 查询抓取配置 | 平台运营 |
| `PUT` | `/api/merchant/openclaw/config` | 更新抓取配置 | 平台运营 |
| `POST` | `/api/merchant/openclaw/config/trigger` | 手动触发抓取 | 平台运营 |
| `GET` | `/api/merchant/material/xhs/list` | 待审素材列表（支持状态筛选） | 平台运营 |
| `GET` | `/api/merchant/material/xhs/{id}` | 素材详情（含图片+标签+日志） | 平台运营 |
| `POST` | `/api/merchant/material/xhs/{id}/review` | 提交复审结果 | 平台运营 |
| `PUT` | `/api/merchant/material/xhs/{id}/tags` | 修正素材标签 | 平台运营 |
| `DELETE` | `/api/merchant/material/xhs/batch` | 批量删除素材（V2.0新增） | 平台运营 |
| `POST` | `/api/merchant/label/create` | 新建标签 | 平台运营 |
| `GET` | `/api/merchant/label/system` | 获取全局标签体系 | 全部 |
| `GET` | `/api/merchant/material/xhs/logs/{id}` | 素材操作日志 | 平台运营 |
| `GET` | `/api/merchant/xhs/trend` | 站外标签趋势数据 | 商家/平台运营 |
| `POST` | `/api/internal/ai/tag-nail-image` | AI 打标（内部） | 内部服务 |
| `POST` | `/api/internal/ai/process-image` | 图片处理 pipeline（内部） | 内部服务 |
