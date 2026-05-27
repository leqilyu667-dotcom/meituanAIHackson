// 全局标签体系（五大维度）
export const labelSystem = {
  shape: ['圆甲', '方圆甲', '尖甲', '梯形甲', '杏仁甲', '建构延长'],
  tone: ['裸色', '红色系', '亮色', '冷色', '金属', '魔镜粉', '透色'],
  craft: ['纯色', '跳色', '渐变', '晕染', '手绘', '猫眼', '魔镜粉'],
  decor: ['无装饰', '碎钻', '珍珠/铆钉', '贴纸', '立体雕花', '波点', '手绘', '金/银碎箔'],
  style: ['简约风', '法式', 'ins风', '甜酷风', '温柔风', '日式', '欧美风']
}

export const labelDimensions = [
  { key: 'shape', name: '甲型' },
  { key: 'tone', name: '色调' },
  { key: 'craft', name: '工艺' },
  { key: 'decor', name: '装饰元素' },
  { key: 'style', name: '风格' }
]

// 店铺信息
export const storeInfo = {
  id: 1,
  name: 'Nail Moment 美甲坊',
  city: '北京',
  district: '朝阳区',
  scale: '中型店',
  avatar: 'N'
}

// 同质店铺列表
export const peerStores = [
  { id: 2, name: 'Her Nail Studio', city: '北京', district: '海淀区', scale: '中型店' },
  { id: 3, name: 'Mia Nails', city: '北京', district: '西城区', scale: '中型店' },
  { id: 4, name: 'Luna Nail', city: '北京', district: '东城区', scale: '中型店' }
]

// 经营日报数据
export const dailyReportData = {
  revenue: { current: 8600, previous: 7200, unit: '元' },
  traffic: { current: 48, previous: 42, unit: '人' },
  avgTicket: { current: 179, previous: 171, unit: '元' },
  completionRate: { current: 92, previous: 88, unit: '%' }
}

export const weeklyReportData = {
  revenue: { current: 56200, previous: 48100, unit: '元' },
  traffic: { current: 312, previous: 285, unit: '人' },
  avgTicket: { current: 180, previous: 169, unit: '元' },
  completionRate: { current: 90, previous: 86, unit: '%' }
}

// 标签营收TOP10
export const tagRevenueRanking = [
  { tags: { shape: '杏仁甲', tone: '裸色', craft: '渐变', decor: '碎钻', style: '温柔风' }, revenue: 12800, orders: 64, share: 22.8 },
  { tags: { shape: '方圆甲', tone: '红色系', craft: '纯色', decor: '无装饰', style: '法式' }, revenue: 9600, orders: 52, share: 17.1 },
  { tags: { shape: '梯形甲', tone: '冷色', craft: '猫眼', decor: '金/银碎箔', style: 'ins风' }, revenue: 8200, orders: 41, share: 14.6 },
  { tags: { shape: '圆甲', tone: '亮色', craft: '手绘', decor: '贴纸', style: '甜酷风' }, revenue: 6500, orders: 35, share: 11.6 },
  { tags: { shape: '尖甲', tone: '金属', craft: '魔镜粉', decor: '立体雕花', style: '欧美风' }, revenue: 5400, orders: 28, share: 9.6 },
  { tags: { shape: '杏仁甲', tone: '透色', craft: '晕染', decor: '珍珠/铆钉', style: '日式' }, revenue: 4800, orders: 24, share: 8.5 },
  { tags: { shape: '方圆甲', tone: '裸色', craft: '跳色', decor: '波点', style: '简约风' }, revenue: 3600, orders: 20, share: 6.4 },
  { tags: { shape: '建构延长', tone: '魔镜粉', craft: '建构延长', decor: '碎钻', style: 'ins风' }, revenue: 2800, orders: 16, share: 5.0 },
  { tags: { shape: '梯形甲', tone: '红色系', craft: '渐变', decor: '金/银碎箔', style: '温柔风' }, revenue: 1500, orders: 9, share: 2.7 },
  { tags: { shape: '圆甲', tone: '冷色', craft: '纯色', decor: '无装饰', style: '简约风' }, revenue: 900, orders: 6, share: 1.6 }
]

// AI试戴引流数据
export const tryOnData = {
  totalOrders: 186,
  totalTryOns: 620,
  conversionRate: 30.0
}

// 异常预警
export const anomalyAlerts = [
  { id: 1, metric: '营收总额', change: -35, period: '本周 vs 上周', reason: '本周工作日订单量下滑明显，热门标签「猫眼」款式转化率下降12%', link: '/merchant/operation-advice' },
  { id: 2, metric: '预约爽约率', change: 42, period: '本周 vs 上周', reason: '近7天爽约率从8%升至11.4%，主要集中在周末时段', link: '/merchant/appointment' }
]

// 各维度单项热度（用于综合热度分计算）
export const dimensionHeat = {
  shape: { '杏仁甲': 88, '方圆甲': 78, '梯形甲': 72, '圆甲': 68, '尖甲': 60, '建构延长': 52 },
  tone: { '裸色': 92, '红色系': 82, '冷色': 75, '亮色': 70, '金属': 62, '魔镜粉': 56, '透色': 55 },
  craft: { '渐变': 75, '猫眼': 70, '纯色': 88, '手绘': 58, '晕染': 52, '跳色': 48, '魔镜粉': 42 },
  decor: { '碎钻': 62, '金/银碎箔': 55, '立体雕花': 42, '珍珠/铆钉': 38, '贴纸': 35, '波点': 30, '手绘': 28 },
  style: { '温柔风': 78, '法式': 72, 'ins风': 68, '日式': 65, '甜酷风': 55, '简约风': 50, '欧美风': 42, '未标注风格': 0 }
}

// 爆款趋势 - 站内标签热度（含基础款：工艺/装饰为空）
export const hotTags = [
  { tags: { shape: '杏仁甲', tone: '裸色', craft: '渐变', decor: '碎钻', style: '温柔风' }, tryOnCount: 520, orderCount: 64 },
  { tags: { shape: '方圆甲', tone: '红色系', craft: '纯色', decor: '', style: '法式' }, tryOnCount: 480, orderCount: 52 },
  { tags: { shape: '梯形甲', tone: '冷色', craft: '猫眼', decor: '金/银碎箔', style: 'ins风' }, tryOnCount: 430, orderCount: 41 },
  { tags: { shape: '圆甲', tone: '裸色', craft: '', decor: '', style: '未标注风格' }, tryOnCount: 380, orderCount: 36 },
  { tags: { shape: '建构延长', tone: '魔镜粉', craft: '魔镜粉', decor: '立体雕花', style: '欧美风' }, tryOnCount: 360, orderCount: 34 },
  { tags: { shape: '杏仁甲', tone: '亮色', craft: '手绘', decor: '贴纸', style: '甜酷风' }, tryOnCount: 350, orderCount: 35 },
  { tags: { shape: '方圆甲', tone: '裸色', craft: '', decor: '', style: '简约风' }, tryOnCount: 310, orderCount: 28 },
  { tags: { shape: '尖甲', tone: '金属', craft: '纯色', decor: '金/银碎箔', style: 'ins风' }, tryOnCount: 300, orderCount: 30 },
  { tags: { shape: '梯形甲', tone: '红色系', craft: '', decor: '', style: '未标注风格' }, tryOnCount: 260, orderCount: 22 },
  { tags: { shape: '圆甲', tone: '冷色', craft: '纯色', decor: '', style: '简约风' }, tryOnCount: 240, orderCount: 20 },
  { tags: { shape: '杏仁甲', tone: '透色', craft: '晕染', decor: '珍珠/铆钉', style: '日式' }, tryOnCount: 280, orderCount: 24 },
  { tags: { shape: '方圆甲', tone: '亮色', craft: '跳色', decor: '波点', style: '简约风' }, tryOnCount: 250, orderCount: 20 }
]

// 计算综合热度分
export const calcHeatScore = (item) => {
  const { shape, tone, craft, decor, style } = item.tags
  const getHeat = (dim, key) => (dimensionHeat[dim] && dimensionHeat[dim][key]) || 0

  const shapeScore = getHeat('shape', shape) * 0.30
  const toneScore = getHeat('tone', tone) * 0.30
  const craftScore = craft ? getHeat('craft', craft) * 0.20 : 0
  const decorScore = decor ? getHeat('decor', decor) * 0.15 : 0
  const styleScore = getHeat('style', style) * 0.05

  const dimScore = shapeScore + toneScore + craftScore + decorScore + styleScore
  const behaviorScore = item.tryOnCount * 0.6 + item.orderCount * 0.4

  return Math.round(dimScore * behaviorScore)
}

// 近7天趋势数据（用于图表）
export const trendData = [
  { day: '5/21', tryOn: 72, order: 22 },
  { day: '5/22', tryOn: 85, order: 26 },
  { day: '5/23', tryOn: 90, order: 31 },
  { day: '5/24', tryOn: 110, order: 35 },
  { day: '5/25', tryOn: 130, order: 42 },
  { day: '5/26', tryOn: 95, order: 30 },
  { day: '5/27', tryOn: 38, order: 0 }
]

// 同质店铺对比数据
export const peerComparison = {
  myStore: { revenue: 56200, traffic: 312, avgTicket: 180, completionRate: 90 },
  peerAvg: { revenue: 48200, traffic: 268, avgTicket: 179, completionRate: 87 },
  myAdvantageTags: [
    { tags: { shape: '杏仁甲', tone: '裸色', craft: '渐变', decor: '碎钻', style: '温柔风' }, myShare: 22.8, peerShare: 15.2 }
  ],
  myMissingTags: [
    { tags: { shape: '建构延长', tone: '魔镜粉', craft: '魔镜粉', decor: '立体雕花', style: '欧美风' }, peerShare: 12.5, heatRise: 28 }
  ]
}

// 小红书待审素材
export const xhsPendingMaterials = [
  {
    id: 1,
    image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=trending%20nail%20art%20design%20spring%20flowers%20elegant%20pink&image_size=square',
    source: 'https://www.xiaohongshu.com/explore/abc123',
    likes: 3200,
    collects: 1800,
    comments: 456,
    aiTags: { shape: '杏仁甲', tone: '裸色', craft: '手绘', decor: '立体雕花', style: '温柔风' },
    status: 'pending'
  },
  {
    id: 2,
    image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=glitter%20nails%20gold%20shimmer%20luxury%20korean%20style&image_size=square',
    source: 'https://www.xiaohongshu.com/explore/def456',
    likes: 5600,
    collects: 3200,
    comments: 890,
    aiTags: { shape: '方圆形', tone: '金属', craft: '魔镜粉', decor: '金/银碎箔', style: 'ins风' },
    status: 'pending'
  },
  {
    id: 3,
    image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=minimalist%20nude%20gel%20nails%20elegant%20japanese%20style&image_size=square',
    source: 'https://www.xiaohongshu.com/explore/ghi789',
    likes: 2100,
    collects: 980,
    comments: 234,
    aiTags: { shape: '圆甲', tone: '透色', craft: '纯色', decor: '无装饰', style: '日式' },
    status: 'pending'
  }
]

// 运营建议
export const advantageAdvice = [
  {
    id: 1,
    type: 'advantage',
    title: '「杏仁甲+裸色+渐变+碎钻+温柔风」组合优势明显',
    tags: { shape: '杏仁甲', tone: '裸色', craft: '渐变', decor: '碎钻', style: '温柔风' },
    conversionRate: 12.3,
    platformAvg: 8.1,
    action: '增加该组合款式曝光位，推荐至店铺首页Top3',
    expectedEffect: '预计营收提升15%-20%',
    link: '/merchant/daily-report'
  },
  {
    id: 2,
    type: 'advantage',
    title: '「方圆甲+红色系+纯色」经典款持续热销',
    tags: { shape: '方圆甲', tone: '红色系', craft: '纯色', decor: '无装饰', style: '法式' },
    conversionRate: 10.8,
    platformAvg: 7.5,
    action: '将该组合设置为门店推荐位，搭配法式风格营销文案',
    expectedEffect: '预计订单量提升10%-15%',
    link: '/merchant/daily-report'
  }
]

export const gapAdvice = [
  {
    id: 1,
    type: 'gap',
    title: '「建构延长+魔镜粉+立体雕花+欧美风」热度上涨28%',
    tags: { shape: '建构延长', tone: '魔镜粉', craft: '魔镜粉', decor: '立体雕花', style: '欧美风' },
    heatRise: 28,
    platformOrders: 156,
    action: '建议使用爆款素材生成工具，快速创建该组合款式并上架',
    link: '/merchant/material-generate'
  },
  {
    id: 2,
    type: 'gap',
    title: '「尖甲+金属+纯色+金/银碎箔+ins风」需求增长22%',
    tags: { shape: '尖甲', tone: '金属', craft: '纯色', decor: '金/银碎箔', style: 'ins风' },
    heatRise: 22,
    platformOrders: 89,
    action: '该标签组合本店尚无对应款式，建议尽快补充',
    link: '/merchant/material-generate'
  }
]

// 预约状态枚举（与 customer 对齐）
export const appointmentStatus = {
  PENDING: { value: 'pending', label: '待确认', color: 'warning' },
  CONFIRMED: { value: 'confirmed', label: '已确认', color: 'primary-600' },
  COMPLETED: { value: 'completed', label: '已完成', color: 'success' },
  CHANGED: { value: 'changed', label: '已变更', color: 'cocoa' },
  CANCELLED: { value: 'cancelled', label: '已取消', color: 'error' }
}

// 预约列表
export const appointments = [
  { id: 1, customer: '小美', phone: '138****6789', time: '2026-05-28 14:00', nailArtist: 'Luna', project: '日式美甲', status: 'confirmed' },
  { id: 2, customer: '花花', phone: '139****8901', time: '2026-05-28 15:30', nailArtist: '小雨', project: '芭比美甲', status: 'pending' },
  { id: 3, customer: '娜娜', phone: '136****0123', time: '2026-05-28 16:00', nailArtist: 'Luna', project: '法式美甲', status: 'completed' },
  { id: 4, customer: '思思', phone: '137****4567', time: '2026-05-29 10:00', nailArtist: '小雨', project: '延长甲', status: 'pending' },
  { id: 5, customer: '婷婷', phone: '135****7890', time: '2026-05-27 11:00', nailArtist: 'Luna', project: '猫眼美甲', status: 'cancelled', cancelReason: '客户临时有事' }
]

// 美甲师列表
export const nailArtists = ['Luna', '小雨', 'Amy', 'Coco']

// 服务项目列表
export const serviceItems = [
  { id: 1, name: '日式美甲', price: 168 },
  { id: 2, name: '芭比美甲', price: 198 },
  { id: 3, name: '延长甲', price: 268 },
  { id: 4, name: '法式美甲', price: 128 },
  { id: 5, name: '猫眼美甲', price: 228 },
  { id: 6, name: '足部美甲', price: 188 }
]
