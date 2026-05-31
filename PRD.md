# 妙手 美甲平台 PRD（产品需求文档）

> 版本：v1.0 | 日期：2026-05-31 | 分支：customer / merchant

---

## 一、产品概述

妙手 是一个 AI 美甲试戴 + 店铺预约的一站式平台，包含 **用户端（C端）** 与 **商家端（B端）** 两端应用。用户端提供 AI 智能试戴、款式发现、店铺浏览、美甲师选择、在线预约等功能；商家端提供经营数据分析、爆款标签追踪、素材生成、货架管理、预约管理、客户消息等运营工具。两端通过共享数据层实现顾客-商家联动闭环。

### 1.1 技术栈

- **前端框架**：Vue 3 + Vite
- **路由**：Vue Router 4（History 模式）
- **样式**：Tailwind CSS 3 + 自定义设计系统
- **数据**：Mock 数据驱动（待接入真实 API）

### 1.2 设计语言

- **配色**：奶白(#F8F6F4) + 浅棕(#D9B8A0) 为主色调，墨色(#2F2A26) 为正文色
- **圆角**：卡片 2xl/3xl，按钮 full/xl
- **阴影**：soft(0 4px 20px rgba/0.04)、card(0 8px 24px rgba/0.06)、glow(0 8px 24px rgba/185,141,114/0.18)
- **字体**：PingFang SC / HarmonyOS Sans SC
- **布局**：用户端 max-w-md 手机竖屏（9:16）；商家端 全宽桌面后台

---

## 二、用户端（C端）详细设计

### 2.1 页面清单（17 个路由）

| 路由 | 页面 | 功能描述 |
|---|---|---|
| `/` | Discovery（灵感发现） | 首页，款式推荐、分类筛选、搜索、AI试戴入口 |
| `/tryon` | TryOn（智能试戴） | 上传手照+选款式 → AI生成试戴效果 → 一键预约 |
| `/tryon-history` | TryOnHistory | 历史试戴记录 |
| `/salon` | Salon（店铺广场） | 店铺列表、筛选排序、作品缩略图预览 |
| `/salon-detail/:id` | SalonDetail | 店铺详情：头图/信息/服务商品列表/美甲师/灵感库/评价 |
| `/nail-detail/:id` | NailDetail | 单款美甲详情：大图、标签、场景、相似推荐、试戴入口 |
| `/artist-detail/:id` | ArtistDetail | 美甲师详情：头像/评分/作品对比/评价/预约 |
| `/booking/:salonId` | Booking（确认预约） | 选日期/时间/联系方式，展示试戴款式图 |
| `/chat/:id` | ChatDetail（群聊） | 商家+美甲师+客户三方群聊 |
| `/messages` | Messages（消息列表） | 系统消息置顶 + 群聊列表 + 进店快捷入口 |
| `/reservations` | Reservations（预约记录） | 列表/日历双视图，状态筛选，取消/重约/评价 |
| `/orders` | Orders（订单） | 已完成/待服务/已取消订单列表 |
| `/profile` | Profile（我的） | 个人中心：试戴/预约/收藏统计，快捷入口 |
| `/search` | SearchResult | 搜索结果列表 |
| `/coupons` | Coupons | 优惠券列表 |
| `/settings` | Settings | 设置页 |
| `/about` | About | 关于页 |

### 2.2 底部导航栏（NavBar.vue）

| Tab | 图标 | 路由 | 功能 |
|---|---|---|---|
| 灵感 | 📋 | `/` | 款式发现首页 |
| 试戴 | ✨ | `/tryon` | AI 智能试戴 |
| 店铺 | 🏪 | `/salon` | 美甲店铺广场 |
| 消息 | 💬 | `/messages` | 群聊消息 |
| 我的 | 👤 | `/profile` | 个人中心 |

### 2.3 核心交互流程

#### 2.3.1 试戴 → 预约闭环（主流程）
```
灵感发现(/)
  → 点击款式 → NailDetail → "AI试戴此款"
  → 或直接进入 TryOn(/tryon)
  
TryOn 页：
  1. 上传手部照片（拍照/相册）
  2. 选择美甲款式（拍照/相册/款式库/灵感合集/美甲师作品）
  3. 点击"开始AI试戴" → 2秒模拟生成
  4. 结果展示：左图(试戴效果) + 右栏(保存/分享/款式信息/一键预约)
  5. 点击"一键预约" → 弹窗选择店铺 → 选择美甲师 → 跳转 Booking

Booking 页(/booking/:salonId)：
  1. 展示店铺信息 + 已选美甲师 + 试戴款式预览图
  2. 选择日期(7天滚轮) + 时间(9个时段)
  3. 填写姓名 + 手机号 + 备注(自动填入款式信息)
  4. 确认预约 → 成功弹窗 → 查看订单/返回
```

#### 2.3.2 店铺浏览 → 预约流程
```
店铺广场(/salon)
  → 点击店铺 → SalonDetail(/salon-detail/:id)
  
SalonDetail 页：
  1. 头图 + 名称 + 评分 + 评价数 + 距离
  2. 服务项目（竖向商品卡片：图+名称+原价/折扣价+折扣标签+抢购按钮）
  3. 美甲师团队（横向滑动：头像+昵称+职称+好评数）→ 点击进入 ArtistDetail
  4. 灵感合集（2列网格）→ 点击进入 TryOn
  5. 店铺介绍 + 用户评价
  6. 底部：合计金额 + 立即预约按钮
```

#### 2.3.3 美甲师发现流程
```
SalonDetail → 美甲师卡片 → ArtistDetail(/artist-detail/:id)

ArtistDetail 页：
  1. 头像 + 昵称 + 职称 + 从业年限 + 所属店铺
  2. 三维评分（态度/效果/形象）+ 服务人次
  3. 擅长项目标签 + 从业简介
  4. 作品展示：左右对比（参考图 | 实际效果），点击 → TryOn
  5. 网友点评列表
  6. 底部：立即预约按钮
```

#### 2.3.4 群聊消息流程
```
消息列表(/messages)
  → 系统消息（置顶）
  → 群聊列表（店铺·美甲师 群聊 + "进店"按钮）
  → 点击群聊 → ChatDetail(/chat/:id)
  
ChatDetail 页：
  - 三种角色：🏪商家(白底) / 💅美甲师(粉底) / 我(棕底)
  - 点击商家名 → SalonDetail
  - 点击美甲师名 → ArtistDetail
  - 输入框 + 发送按钮，模拟自动回复
```

### 2.4 用户端组件

| 组件 | 文件 | 功能 |
|---|---|---|
| NavBar | `components/NavBar.vue` | 底部5Tab导航栏（灵感/试戴/店铺/消息/我的） |

### 2.5 数据模型（mockData.js）

#### 2.5.1 全局共享
| 导出 | 类型 | 用途 |
|---|---|---|
| `labelSystem` | `{ shape[6], tone[7], craft[7], decor[8], style[7] }` | 五维标签体系 |
| `labelDimensions` | `[{ key, name }]` | 标签维度元数据 |
| `appointmentStatus` | `{ PENDING, CONFIRMED, COMPLETED, CHANGED, CANCELLED }` | 预约状态枚举 |

#### 2.5.2 业务数据
| 导出 | 字段 |
|---|---|
| `nailArtists` | id, name, title, avatarBg, reviews, rating, specialty, salonId, salonName, badge, bio, tags, certificates, works[], availability, reviewList[{name,rating,content,date,styleImage,resultImage}] |
| `nailStyles` | id, name, description, image, category, labels{shape,tone,craft,decor,style}, likes, isNew |
| `salons` | id, name, rating, reviews, services[], image, location, distance, works[] |
| `messages` | id, name, avatar, content, time, unread, salonId, artistId, artistName, type |
| `chatMessages` | { chatId: [{ id, sender(salon/artist/user), senderName, text, time }] } |
| `reservations` | id, customer, phone, salonId, salonName, chatId, artistId, artistName, artistAvatar, nailStyleId, nailStyleName, nailImage, service, price, date, time, status, statusText, location, remark, labels, cancelReason/changeReason |
| `orders` | id, orderNo, customerName, salonName, artistName, service, price, actualReceivable, status, statusText, date, createdAt, image, labels |
| `inspirationThemes` | id, name, coverImage, count, category, labels |
| `userData` | name, avatar, tryonCount, recordCount, favoriteCount, reservationCount, tryonHistory[], actualWorks[], favorites[] |
| `coupons` | id, title, discount, condition, expireDate, amount, used |
| `categories` | 字符串数组（款式分类） |

---

## 三、商家端（B端）详细设计

### 3.1 页面清单（13 个商家路由 + 6 个复用用户端路由）

#### 3.1.1 商家专属页面

| 路由 | 页面 | 功能描述 |
|---|---|---|
| `/merchant` | Home（首页） | 占位页 |
| `/merchant/daily-report` | Dashboard（经营日报） | 核心指标卡 + 标签营收TOP10 + 趋势图 + 异常预警 |
| `/merchant/trend-analysis` | TrendAnalysis（爆款报告） | 站内标签热度排行、趋势分析 |
| `/merchant/operation-advice` | OperationAdvice（运营建议） | 优势标签/缺口标签分析，补货建议 |
| `/merchant/revenue-calc` | RevenueCalc（营收计算器） | 营收预估工具 |
| `/merchant/material-generate` | MaterialGenerate（爆款素材生成） | 站内爆款标签 + 小红书素材 → AI生成款式上架 |
| `/merchant/material-library` | MaterialLibrary（素材库） | 素材管理 |
| `/merchant/appointment` | Appointment（预约管理） | 列表/日历双视图，创建/确认/变更/取消预约 |
| `/merchant/product-manage` | ProductManage（货架管理） | 款式上下架、排序、编辑、新增、预览 |
| `/merchant/product-manage/:id` | ProductDetail（款式详情编辑） | 单款式信息编辑 |
| `/merchant/messages` | Messages（消息管理） | 对话列表+聊天面板左右分栏 |
| `/merchant/profile` | Profile（商家主页） | 店铺信息编辑 |
| `/merchant/order-history` | OrderHistory（订单记录） | 已完成订单列表，标签展示，营收汇总 |

#### 3.1.2 复用的用户端页面（商家端也会加载）
`/`, `/tryon`, `/salon`, `/messages`, `/profile`, `/salon-detail/:id`

### 3.2 侧边导航栏（Sidebar.vue）

三组菜单结构：

| 分组 | 菜单项 | 路由 |
|---|---|---|
| **数据小二** | 经营日报 | `/merchant/daily-report` |
| | 爆款报告 | `/merchant/trend-analysis` |
| | 运营建议 | `/merchant/operation-advice` |
| **运营小二** | 营收计算器 | `/merchant/revenue-calc` |
| | 爆款素材生成 | `/merchant/material-generate` |
| | 货架管理 | `/merchant/product-manage` |
| | 订单记录 | `/merchant/order-history` |
| **客服小二** | 消息管理 | `/merchant/messages` |
| | 预约管理 | `/merchant/appointment` |

### 3.3 商家端组件（7个）

| 组件 | 功能 |
|---|---|
| `Sidebar.vue` | 左侧56px宽导航栏，品牌logo + 三组菜单 + 底部账号 |
| `TopBar.vue` | 顶部栏 |
| `MetricCard.vue` | 经营指标卡：当前值/环比变化/趋势方向 |
| `TrendChart.vue` | 近7天试戴/订单趋势折线图 |
| `TagBadge.vue` | 五维标签徽章可视化组件 |
| `AnomalyAlert.vue` | 异常预警卡片 |
| `ReviewModal.vue` | 评价弹窗 |

### 3.4 数据模型（merchantMockData.js）

| 导出 | 核心字段 | 用途 |
|---|---|---|
| `storeInfo` | id, name, city, district, scale, avatar | 当前店铺信息 |
| `peerStores` | [{ id, name, city, district, scale }] | 同质竞品列表 |
| `dailyReportData` | revenue/traffic/avgTicket/completionRate {current, previous} | 日报核心指标 |
| `weeklyReportData` | 同上 | 周报 |
| `tagRevenueRanking` | [{ tags{5维}, revenue, orders, share }] | 标签营收TOP10 |
| `tryOnData` | totalOrders, totalTryOns, conversionRate | 试戴转化数据 |
| `anomalyAlerts` | [{ id, metric, change%, period, reason, link }] | 异常预警 |
| `dimensionHeat` | { shape/tone/craft/decor/style: { key: score } } | 各维度单项热度 |
| `styleRecommendMap` | { "shape\|tone\|craft": [{style, confidence}] } | AI风格推荐映射 |
| `hotTags` | [{ tags{5维}, tryOnCount, orderCount }] | 站内爆款标签 |
| `calcHeatScore` | function(item) → number | 综合热度计算公式 |
| `trendData` | [{ day, tryOn, order }] | 7天趋势数据 |
| `peerComparison` | { myStore, peerAvg, myAdvantageTags, myMissingTags } | 竞品对比 |
| `xhsPendingMaterials` | [{ id, image, source, likes, collects, comments, aiTags, status }] | 小红书待审素材 |
| `advantageAdvice` | [{ type, tags, conversionRate, platformAvg, action }] | 优势标签运营建议 |
| `gapAdvice` | [{ type, tags, heatRise, platformOrders, action }] | 缺口标签补货建议 |
| `appointments` | [{ id, customer, phone, time, nailArtist, project, status }] | 商家端预约列表 |
| `nailArtists` | ['Luna','小雨','Amy','Coco'] | 美甲师名字列表（待升级） |
| `serviceItems` | [{ id, name, price }] | 服务项目列表 |

---

## 四、全局标签体系（五维）

### 4.1 维度定义

| 维度 | 字段 key | 枚举值 | 权重 |
|---|---|---|---|
| 甲型 | `shape` | 圆甲, 方圆甲, 尖甲, 梯形甲, 杏仁甲, 建构延长 | 30% |
| 色调 | `tone` | 裸色, 红色系, 亮色, 冷色, 金属, 魔镜粉, 透色 | 30% |
| 工艺 | `craft` | 纯色, 跳色, 渐变, 晕染, 手绘, 猫眼, 魔镜粉 | 15% |
| 装饰元素 | `decor` | 无装饰, 碎钻, 珍珠/铆钉, 贴纸, 立体雕花, 波点, 手绘, 金/银碎箔 | 15% |
| 风格 | `style` | 简约风, 法式, ins风, 甜酷风, 温柔风, 日式, 欧美风 | 10% |

### 4.2 标签应用范围

| 数据实体 | 是否含 labels | 说明 |
|---|---|---|
| nailStyles (6条) | ✅ | 每条款式带完整5维标签 |
| inspirationThemes (8条) | ✅ | 每个主题带完整5维标签 |
| reservations (5条) | ✅ | 每条预约记录关联款式标签 |
| orders (4条) | ✅ | 每条订单关联款式标签 |
| nailArtists (4条) | ⚠️ 部分 | 有 tags 字段，待升级为 labels |
| salons (6条) | ❌ 无 | 店铺级不需要标签 |

---

## 五、预约状态流转

```
  用户提交预约
       ↓
  [pending] 待确认 ──→ 商家确认 ──→ [confirmed] 已确认
       ↓                    ↓
  商家拒绝/超时          客户/商家变更时间
       ↓                    ↓
  [cancelled] 已取消    [changed] 已变更
                           ↓
                      重新确认
                           ↓
                      [confirmed]
                           ↓
                      服务完成
                           ↓
                    [completed] 已完成
```

| 状态值 | 显示文本 | 颜色 | 触发方 | 触发动作 |
|---|---|---|---|---|
| `pending` | 待确认 | warning | 用户 | 提交预约 |
| `confirmed` | 已确认 | primary-600 | 商家 | 确认预约 |
| `changed` | 已变更 | cocoa | 任一方 | 修改时间/内容 |
| `completed` | 已完成 | success | 商家 | 标记完成 |
| `cancelled` | 已取消 | error | 任一方 | 取消预约 |

---

## 六、交互规范

### 6.1 通用交互
- **卡片点击**：`active:scale-[0.97/0.98]` 按压反馈
- **按钮禁用**：`opacity-40 cursor-not-allowed` + 灰度
- **加载状态**：SVG 旋转动画 `animate-spin`
- **弹窗**：`z-[60]` 覆盖底部 NavBar(z-50)，底部滑入 sheet 动画
- **Toast**：alert() 占位，待替换为 Toast 组件

### 6.2 手机端适配
- 用户端：`max-w-md mx-auto`，模拟手机竖屏
- 底部留白：`pb-28`(112px) 避开 NavBar
- 横向滚动：`overflow-x-auto scrollbar-hide`
- 图片比例：`aspect-[3/4]` 竖版

### 6.3 商家端适配
- 侧边栏：`fixed w-56 h-screen`，z-50
- 主内容区：`ml-56` 避开侧边栏
- 数据卡片：`grid grid-cols-2 lg:grid-cols-4`
- 图表区域：`lg:grid-cols-[1fr_340px]` 左右分栏

---

## 七、联动清单（待实现）

### 7.1 已对齐
- [x] 五维标签体系 `labelSystem` / `labelDimensions`
- [x] 预约状态枚举 `appointmentStatus`（含 CHANGED）
- [x] nailStyles / inspirationThemes / reservations / orders 全部含 `labels`
- [x] reservations 含 `customer` / `phone` 字段

### 7.2 待实现

| 优先级 | 联动项 | 说明 |
|---|---|---|
| P0 | 路由合并 | 两端路由合并到一个 router，按角色加载不同导航 |
| P0 | 统一 App Shell | 用户端 TabBar vs 商家端 Sidebar，按路由切换 |
| P0 | 数据层统一 | mockData + merchantMockData → 单一数据源 |
| P1 | 美甲师数据对齐 | merchant nailArtists 从名字数组升级为完整对象 |
| P1 | 实时消息 | ChatDetail ↔ merchant Messages 双向同步 |
| P1 | 预约状态同步 | 商家操作(确认/变更/取消) → 用户端实时更新 |
| P2 | 试戴转化追踪 | 用户端每次试戴记录埋点 → 商家端 tryOnData |
| P2 | 货架→店铺联动 | 商家 ProductManage 上架 → 用户 SalonDetail 可见 |
| P2 | 素材→灵感联动 | 商家 MaterialGenerate 生成 → 用户 inspirationThemes 更新 |
| P3 | 评价闭环 | 用户订单完成后评价 → 商家端查看 → 美甲师评分更新 |
| P3 | 优惠券联动 | 商家发放优惠券 → 用户端领取使用 |

---

## 八、文件目录结构

```
nailia-app/
├── src/
│   ├── App.vue                          # 根组件
│   ├── main.js                          # 入口
│   ├── style.css                        # 全局样式 + Tailwind + 组件类
│   ├── components/
│   │   ├── NavBar.vue                   # 用户端底部导航
│   │   └── merchant/                    # 商家端组件（待迁移）
│   │       ├── AnomalyAlert.vue
│   │       ├── MetricCard.vue
│   │       ├── ReviewModal.vue
│   │       ├── Sidebar.vue
│   │       ├── TagBadge.vue
│   │       ├── TopBar.vue
│   │       └── TrendChart.vue
│   ├── views/
│   │   ├── Discovery.vue                # 灵感发现
│   │   ├── TryOn.vue                    # AI试戴
│   │   ├── TryOnHistory.vue             # 试戴历史
│   │   ├── Salon.vue                    # 店铺广场
│   │   ├── SalonDetail.vue              # 店铺详情
│   │   ├── NailDetail.vue               # 款式详情
│   │   ├── ArtistDetail.vue             # 美甲师详情
│   │   ├── Booking.vue                  # 确认预约
│   │   ├── ChatDetail.vue               # 群聊详情
│   │   ├── Messages.vue                 # 消息列表
│   │   ├── Reservations.vue             # 预约记录
│   │   ├── Orders.vue                   # 订单
│   │   ├── Profile.vue                  # 我的
│   │   ├── SearchResult.vue             # 搜索结果
│   │   ├── Coupons.vue                  # 优惠券
│   │   ├── Settings.vue                 # 设置
│   │   ├── About.vue                    # 关于
│   │   ├── Design.vue                   # 设计页
│   │   └── merchant/                    # 商家端页面（待迁移）
│   │       ├── Home.vue
│   │       ├── Dashboard.vue
│   │       ├── TrendAnalysis.vue
│   │       ├── OperationAdvice.vue
│   │       ├── RevenueCalc.vue
│   │       ├── MaterialGenerate.vue
│   │       ├── MaterialLibrary.vue
│   │       ├── Appointment.vue
│   │       ├── ProductManage.vue
│   │       ├── ProductDetail.vue
│   │       ├── Messages.vue
│   │       ├── Profile.vue
│   │       └── OrderHistory.vue
│   ├── data/
│   │   ├── mockData.js                  # 用户端数据（含共享标签体系）
│   │   ├── merchantMockData.js          # 商家端数据（待合并）
│   │   └── api.js                       # API 接口
│   └── router/
│       └── index.js                     # 路由配置
├── tailwind.config.js
├── vite.config.js
├── package.json
└── PRD.md                              # 本文档
```
