// ═══════════════════════════════════════════
// 全局标签体系（五维 — 与 merchant 端统一）
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// 预约状态枚举（与 merchant 端统一）
// ═══════════════════════════════════════════
export const appointmentStatus = {
  PENDING: { value: 'pending', label: '待确认', color: 'warning' },
  CONFIRMED: { value: 'confirmed', label: '已确认', color: 'primary-600' },
  COMPLETED: { value: 'completed', label: '已完成', color: 'success' },
  CHANGED: { value: 'changed', label: '已变更', color: 'cocoa' },
  CANCELLED: { value: 'cancelled', label: '已取消', color: 'error' }
}

export const nailArtists = [
  {
    id: 1,
    name: 'Luna',
    title: '高级美甲师',
    avatarBg: 'linear-gradient(135deg, #D9B8A0, #B98D72)',
    reviews: 512,
    rating: 4.9,
    specialty: '日式 / 法式',
    salonId: 1,
    salonName: 'Nail Moment',
    badge: { text: '上次美甲师', style: 'last' },
    bio: '从业 8 年，擅长日式精细美甲与法式经典系列，注重每一处细节与质感，曾获省级美甲大赛金奖。',
    tags: ['日式', '法式', '精细', '花卉'],
    certificates: ['高级美甲师认证', '日式美甲资质证书'],
    works: [
      '/images/nails/nail-01.jpg',
      '/images/nails/nail-02.png',
      '/images/nails/nail-03.png',
      '/images/nails/nail-05.png'
    ],
    availability: '周一至周五 10:00–20:00，周末 10:00–19:00',
    reviewList: [
      { name: '小美', rating: 5, content: '手法非常细腻，做出来的款式和参考图一模一样！', date: '3天前', styleImage: '/images/nails/nail-01.jpg', resultImage: '/images/nails/nail-03.png' },
      { name: '花花', rating: 5, content: 'Luna 姐人超好，会根据手型推荐合适款式，非常专业。', date: '1周前', styleImage: '/images/nails/nail-03.png', resultImage: '/images/nails/nail-01.jpg' },
      { name: '娜娜', rating: 5, content: '每次来都很放心，效果稳定，已经做了半年了。', date: '2周前', styleImage: '/images/nails/nail-02.png', resultImage: '/images/nails/nail-02.png' }
    ]
  },
  {
    id: 2,
    name: '小雨',
    title: '资深美甲师',
    avatarBg: 'linear-gradient(135deg, #c4a882, #9c725a)',
    reviews: 289,
    rating: 4.8,
    specialty: '渐变 / 闪粉',
    salonId: 1,
    salonName: 'Nail Moment',
    badge: { text: '最近空闲', style: 'available' },
    bio: '从业 5 年，色彩感极强，尤擅渐变晕染与闪粉叠层工艺，作品在小红书获超 10 万收藏。',
    tags: ['渐变', '闪粉', '延长甲', '创意'],
    certificates: ['美甲设计师认证', '光疗甲专项证书'],
    works: [
      '/images/nails/nail-04.png',
      '/images/nails/nail-06.png',
      '/images/nails/nail-01.jpg',
      '/images/nails/nail-02.png'
    ],
    availability: '周二至周日 11:00–21:00',
    reviewList: [
      { name: '晴晴', rating: 5, content: '渐变做得超好看，颜色过渡自然，朋友都问我在哪做的！', date: '2天前', styleImage: '/images/nails/nail-04.png', resultImage: '/images/nails/nail-06.png' },
      { name: '小橙', rating: 4, content: '闪粉款很闪耀，就是等了一会儿，效果值得等。', date: '5天前', styleImage: '/images/nails/nail-06.png', resultImage: '/images/nails/nail-04.png' },
      { name: '白白', rating: 5, content: '第二次来找小雨，手艺稳定，很满意！', date: '3周前', styleImage: '/images/nails/nail-01.jpg', resultImage: '/images/nails/nail-01.jpg' }
    ]
  },
  {
    id: 3,
    name: 'Nicole',
    title: '美甲设计师',
    avatarBg: 'linear-gradient(135deg, #bfa98e, #8B6D5A)',
    reviews: 356,
    rating: 4.9,
    specialty: '复古 / 艺术',
    salonId: 1,
    salonName: 'Nail Moment',
    badge: { text: '好评率高', style: 'top' },
    bio: '毕业于设计专业，将插画艺术融入美甲创作，专精复古色调与几何线条设计，每款均为定制。',
    tags: ['复古', '艺术', '几何', '定制'],
    certificates: ['国际美甲设计师认证', '美甲艺术创作证书'],
    works: [
      '/images/nails/nail-05.png',
      '/images/nails/nail-03.png',
      '/images/nails/nail-06.png',
      '/images/nails/nail-04.png'
    ],
    availability: '周三至周日 10:00–20:00',
    reviewList: [
      { name: '艾米', rating: 5, content: '太有艺术感了！每次看到自己的指甲都很开心。', date: '1天前', styleImage: '/images/nails/nail-05.png', resultImage: '/images/nails/nail-03.png' },
      { name: '橙子', rating: 5, content: 'Nicole 很有耐心听我描述想法，做出来比想象中还美。', date: '1周前', styleImage: '/images/nails/nail-03.png', resultImage: '/images/nails/nail-05.png' },
      { name: '果果', rating: 4, content: '创意十足，就是预约需要提前一周，很火爆。', date: '2周前', styleImage: '/images/nails/nail-06.png', resultImage: '/images/nails/nail-06.png' }
    ]
  },
  {
    id: 4,
    name: 'Mia',
    title: '美甲师',
    avatarBg: 'linear-gradient(135deg, #e0cfc4, #C4A882)',
    reviews: 198,
    rating: 4.7,
    specialty: '延长 / 修型',
    salonId: 1,
    salonName: 'Nail Moment',
    badge: { text: '性价比高', style: 'value' },
    bio: '专攻甲型修正与延长甲工艺，手法轻柔不伤甲床，适合需要纠正甲型或做延长甲的客户。',
    tags: ['延长甲', '修型', '光疗', '温柔'],
    certificates: ['美甲师初级认证', '光疗延长甲专项证书'],
    works: [
      '/images/nails/nail-02.png',
      '/images/nails/nail-04.png',
      '/images/nails/nail-01.jpg',
      '/images/nails/nail-03.png'
    ],
    availability: '周一至周六 10:00–19:00',
    reviewList: [
      { name: '糖糖', rating: 5, content: '手很轻，全程不疼，延长甲做完很自然！', date: '4天前', styleImage: '/images/nails/nail-02.png', resultImage: '/images/nails/nail-04.png' },
      { name: '豆豆', rating: 4, content: '修型很专业，甲型变好看了很多。', date: '2周前', styleImage: '/images/nails/nail-04.png', resultImage: '/images/nails/nail-02.png' },
      { name: '小鹿', rating: 5, content: '第一次做延长，Mia 讲解很详细，很有安全感。', date: '3周前', styleImage: '/images/nails/nail-01.jpg', resultImage: '/images/nails/nail-03.png' }
    ]
  }
]

export const nailStyles = [
  {
    id: 1,
    name: '春日新款',
    description: '温柔气质，粉嫩花卉',
    image: '/images/nails/nail-01.jpg',
    category: '春日',
    labels: { shape: '杏仁甲', tone: '裸色', craft: '手绘', decor: '立体雕花', style: '温柔风' },
    likes: 2341,
    isNew: true
  },
  {
    id: 2,
    name: '冰透裸色',
    description: '自然百搭，通勤首选',
    image: '/images/nails/nail-02.png',
    category: '裸色',
    labels: { shape: '方圆甲', tone: '裸色', craft: '纯色', decor: '无装饰', style: '简约风' },
    likes: 1892,
    isNew: false
  },
  {
    id: 3,
    name: '奶油法式',
    description: '经典优雅，法式白边',
    image: '/images/nails/nail-03.png',
    category: '法式',
    labels: { shape: '方圆甲', tone: '裸色', craft: '纯色', decor: '无装饰', style: '法式' },
    likes: 3421,
    isNew: false
  },
  {
    id: 4,
    name: '渐变闪粉',
    description: '闪耀夺目，派对必备',
    image: '/images/nails/nail-04.png',
    category: '闪粉',
    labels: { shape: '杏仁甲', tone: '亮色', craft: '渐变', decor: '碎钻', style: '甜酷风' },
    likes: 1567,
    isNew: true
  },
  {
    id: 5,
    name: '复古红棕',
    description: '显白气质，秋冬经典',
    image: '/images/nails/nail-05.png',
    category: '红色',
    labels: { shape: '梯形甲', tone: '红色系', craft: '纯色', decor: '金/银碎箔', style: '法式' },
    likes: 2156,
    isNew: false
  },
  {
    id: 6,
    name: '清新薄荷',
    description: '清凉夏日，绿意盎然',
    image: '/images/nails/nail-06.png',
    category: '绿色',
    labels: { shape: '圆甲', tone: '冷色', craft: '纯色', decor: '无装饰', style: '简约风' },
    likes: 1432,
    isNew: true
  }
]

export const categories = ['推荐', '春日', '简约', '法式', '显白', '有设计']

export const salons = [
  {
    id: 1,
    name: 'Nail Moment',
    rating: 4.9,
    reviews: 1280,
    services: ['日式美甲', '芭比美甲', '延长甲', '美甲款式'],
    image: 'https://picsum.photos/seed/salon1/400/300',
    location: '朝阳区',
    distance: '1.2km',
    works: [
      '/images/nails/nail-01.jpg',
      '/images/nails/nail-02.png',
      '/images/nails/nail-03.png'
    ]
  },
  {
    id: 2,
    name: 'Her Nail Studio',
    rating: 4.8,
    reviews: 960,
    services: ['法式美甲', '轻奢风格', '定制款'],
    image: 'https://picsum.photos/seed/salon2/400/300',
    location: '海淀区',
    distance: '2.5km',
    works: [
      '/images/nails/nail-04.png',
      '/images/nails/nail-05.png',
      '/images/nails/nail-06.png'
    ]
  },
  {
    id: 3,
    name: 'Mia Nails',
    rating: 4.7,
    reviews: 780,
    services: ['蛋白矫正', '鎏金美甲', '新娘美甲'],
    image: 'https://picsum.photos/seed/salon3/400/300',
    location: '西城区',
    distance: '3.1km',
    works: [
      '/images/nails/nail-07.png',
      '/images/nails/nail-08.png',
      '/images/nails/nail-09.png'
    ]
  },
  {
    id: 4,
    name: '指尖花语 Nail Art',
    rating: 4.9,
    reviews: 1560,
    services: ['春日花语', '猫眼美甲', '法式美甲', '定制手绘'],
    image: 'https://picsum.photos/seed/salon4/400/300',
    location: '东城区',
    distance: '2.8km',
    works: [
      '/images/nails/nail-10.png',
      '/images/nails/nail-11.png',
      '/images/nails/nail-12.png'
    ]
  },
  {
    id: 5,
    name: '闪耀美甲坊',
    rating: 4.6,
    reviews: 620,
    services: ['闪粉美甲', '延长甲', '足部美甲', '手部护理'],
    image: 'https://picsum.photos/seed/salon5/400/300',
    location: '丰台区',
    distance: '4.5km',
    works: [
      '/images/nails/nail-01.jpg',
      '/images/nails/nail-04.png',
      '/images/nails/nail-07.png'
    ]
  },
  {
    id: 6,
    name: 'J&J Nail Lounge',
    rating: 4.8,
    reviews: 890,
    services: ['轻奢美甲', '新娘甲', '芭比美甲', '日式美甲'],
    image: 'https://picsum.photos/seed/salon6/400/300',
    location: '朝阳区',
    distance: '1.8km',
    works: [
      '/images/nails/nail-02.png',
      '/images/nails/nail-05.png',
      '/images/nails/nail-08.png'
    ]
  }
]

export const messages = [
  {
    id: 1,
    name: 'Nail Moment · Luna 群聊',
    avatar: 'N',
    content: 'Luna：您的预约已通过，明天下午2点见~',
    time: '09:21',
    unread: true,
    salonId: 1,
    artistId: 1,
    artistName: 'Luna',
    type: 'group'
  },
  {
    id: 2,
    name: 'Her Nail Studio · 小雨 群聊',
    avatar: 'H',
    content: '小雨：您好，请问有什么可以帮您？',
    time: '昨天',
    unread: false,
    salonId: 2,
    artistId: 2,
    artistName: '小雨',
    type: 'group'
  },
  {
    id: 3,
    name: 'Mia Nails · Nicole 群聊',
    avatar: 'M',
    content: 'Nicole：感谢您的光临，期待下次再见~',
    time: '04/10',
    unread: false,
    salonId: 3,
    artistId: 3,
    artistName: 'Nicole',
    type: 'group'
  },
  {
    id: 4,
    name: 'Nail Moment · 小雨 群聊',
    avatar: 'N',
    content: '小雨：您选的款式我已经记下了，明天见！',
    time: '04/10',
    unread: false,
    salonId: 1,
    artistId: 2,
    artistName: '小雨',
    type: 'group'
  }
]

export const userData = {
  name: '小亲亲',
  avatar: 'Q',
  tryonCount: 12,
  recordCount: 8,
  favoriteCount: 36,
  reservationCount: 3,
  tryonHistory: [
    { id: 1, image: '/images/nails/nail-10.png' },
    { id: 2, image: '/images/nails/nail-11.png' },
    { id: 3, image: '/images/nails/nail-12.png' }
  ],
  actualWorks: [
    { id: 1, image: '/images/nails/nail-10.png' },
    { id: 2, image: '/images/nails/nail-11.png' },
    { id: 3, image: '/images/nails/nail-12.png' }
  ],
  favorites: [
    { id: 1, image: '/images/nails/nail-07.png' },
    { id: 2, image: '/images/nails/nail-08.png' },
    { id: 3, image: '/images/nails/nail-09.png' }
  ]
}

export const chatMessages = {
  1: [
    { id: 1, sender: 'salon', senderName: 'Nail Moment', text: '欢迎光临 Nail Moment 美甲坊！我是店长，已为您安排美甲师 Luna 为您服务~', time: '09:15' },
    { id: 2, sender: 'artist', senderName: 'Luna', text: '您好，我是美甲师 Luna，很高兴为您服务！请问有什么偏好的款式吗？', time: '09:16' },
    { id: 3, sender: 'salon', senderName: 'Nail Moment', text: '您的预约已通过，明天下午2点见~', time: '09:17' },
    { id: 4, sender: 'user', text: '好的，谢谢！我想做一款日式美甲', time: '09:18' },
    { id: 5, sender: 'artist', senderName: 'Luna', text: '日式美甲很适合您！到店后我给您看一些款式参考~', time: '09:20' },
    { id: 6, sender: 'user', text: '太好了，明天见！', time: '09:21' }
  ],
  2: [
    { id: 1, sender: 'artist', senderName: '小雨', text: '您好，我是美甲师小雨！欢迎来到 Her Nail Studio~', time: '昨天 14:30' },
    { id: 2, sender: 'user', text: '你好！我想做一个法式美甲', time: '昨天 14:32' },
    { id: 3, sender: 'salon', senderName: 'Her Nail Studio', text: '法式美甲是我们店的热门项目，小雨老师很擅长哦~', time: '昨天 14:33' },
    { id: 4, sender: 'artist', senderName: '小雨', text: '好的，法式美甲很经典，我们有几种款式可以选，请问您方便什么时候过来呢？', time: '昨天 14:33' },
    { id: 5, sender: 'user', text: '这周末下午可以吗？', time: '昨天 14:35' },
    { id: 6, sender: 'salon', senderName: 'Her Nail Studio', text: '可以的，周六下午2点有空位，帮您预约？', time: '昨天 14:36' },
    { id: 7, sender: 'user', text: '好的，就这个时间', time: '昨天 14:38' },
    { id: 8, sender: 'artist', senderName: '小雨', text: '已为您预约成功，周六下午2点见！记得带上您喜欢的参考图哦~', time: '昨天 14:40' }
  ],
  3: [
    { id: 1, sender: 'salon', senderName: 'Mia Nails', text: '感谢您的光临！您做的款式真好看~', time: '04/10 16:20' },
    { id: 2, sender: 'user', text: '谢谢！Nicole老师服务很好，我很满意', time: '04/10 16:22' },
    { id: 3, sender: 'artist', senderName: 'Nicole', text: '谢谢夸奖！期待下次再见~ 我们会持续上新款式的', time: '04/10 16:25' },
    { id: 4, sender: 'salon', senderName: 'Mia Nails', text: '下次可以试试我们新到的鎏金系列，很适合您~', time: '04/10 16:26' }
  ],
  4: [
    { id: 1, sender: 'artist', senderName: '小雨', text: '您好，我是美甲师小雨，很高兴在 Nail Moment 为您服务！', time: '04/10 10:00' },
    { id: 2, sender: 'user', text: '你好小雨！上次你帮我做的渐变款很好看', time: '04/10 10:05' },
    { id: 3, sender: 'salon', senderName: 'Nail Moment', text: '小雨老师是我们店的高级美甲师，渐变款是她的招牌~', time: '04/10 10:06' },
    { id: 4, sender: 'artist', senderName: '小雨', text: '谢谢喜欢！这次想做什么款式呢？', time: '04/10 10:06' },
    { id: 5, sender: 'user', text: '我想试试那个春日新款', time: '04/10 10:08' },
    { id: 6, sender: 'artist', senderName: '小雨', text: '好的，您选的款式我已经记下了，明天见！', time: '04/10 10:10' }
  ]
}

export const orders = [
  {
    id: 1,
    orderNo: 'NM20260408001',
    customerName: '小美',
    salonName: 'Nail Moment 美甲坊',
    artistName: 'Luna',
    service: '日式美甲',
    price: 168,
    actualReceivable: 168,
    status: 'completed',
    statusText: '已完成',
    date: '2026-04-08',
    createdAt: '2026-04-08 14:30',
    image: '/images/nails/nail-02.png',
    labels: { shape: '杏仁甲', tone: '裸色', craft: '手绘', decor: '立体雕花', style: '温柔风' }
  },
  {
    id: 2,
    orderNo: 'HS20260325002',
    customerName: '花花',
    salonName: 'Her Nail Studio',
    artistName: '小雨',
    service: '法式美甲',
    price: 128,
    actualReceivable: 128,
    status: 'completed',
    statusText: '已完成',
    date: '2026-03-25',
    createdAt: '2026-03-25 11:00',
    image: '/images/nails/nail-03.png',
    labels: { shape: '方圆甲', tone: '裸色', craft: '纯色', decor: '无装饰', style: '法式' }
  },
  {
    id: 3,
    orderNo: 'NM20260515003',
    customerName: '娜娜',
    salonName: 'Nail Moment 美甲坊',
    artistName: 'Luna',
    service: '芭比美甲',
    price: 198,
    actualReceivable: 198,
    status: 'upcoming',
    statusText: '待服务',
    date: '2026-05-15',
    createdAt: '2026-05-10 09:00',
    image: '/images/nails/nail-04.png',
    labels: { shape: '杏仁甲', tone: '亮色', craft: '渐变', decor: '碎钻', style: '甜酷风' }
  },
  {
    id: 4,
    orderNo: 'MN20260310004',
    customerName: '婷婷',
    salonName: 'Mia Nails',
    artistName: 'Nicole',
    service: '鎏金美甲',
    price: 268,
    actualReceivable: 268,
    status: 'cancelled',
    statusText: '已取消',
    date: '2026-03-10',
    createdAt: '2026-03-05 15:00',
    image: '/images/nails/nail-05.png',
    labels: { shape: '梯形甲', tone: '红色系', craft: '纯色', decor: '金/银碎箔', style: '法式' }
  }
]

export const reservations = [
  {
    id: 1,
    customer: '小美',
    phone: '138****6789',
    salonId: 1,
    salonName: 'Nail Moment 美甲坊',
    chatId: 1,
    artistId: 1,
    artistName: 'Luna',
    artistAvatar: 'L',
    nailStyleId: 3,
    nailStyleName: '奶油法式',
    nailImage: '/images/nails/nail-03.png',
    service: '法式美甲',
    price: 128,
    date: '2026-05-28',
    time: '14:00',
    status: 'confirmed',
    statusText: '已确认',
    location: '朝阳区 · 1.2km',
    remark: '想做温柔一点的款式',
    labels: { shape: '方圆甲', tone: '裸色', craft: '纯色', decor: '无装饰', style: '法式' }
  },
  {
    id: 2,
    customer: '花花',
    phone: '139****8901',
    salonId: 2,
    salonName: 'Her Nail Studio',
    chatId: 2,
    artistId: 2,
    artistName: '小雨',
    artistAvatar: 'Y',
    nailStyleId: 1,
    nailStyleName: '春日新款',
    nailImage: '/images/nails/nail-01.jpg',
    service: '日式美甲',
    price: 168,
    date: '2026-06-02',
    time: '10:00',
    status: 'pending',
    statusText: '待确认',
    location: '海淀区 · 2.5km',
    remark: '',
    labels: { shape: '杏仁甲', tone: '裸色', craft: '手绘', decor: '立体雕花', style: '温柔风' }
  },
  {
    id: 3,
    customer: '娜娜',
    phone: '136****0123',
    salonId: 1,
    salonName: 'Nail Moment 美甲坊',
    chatId: 1,
    artistId: 1,
    artistName: 'Luna',
    artistAvatar: 'L',
    nailStyleId: 4,
    nailStyleName: '渐变闪粉',
    nailImage: '/images/nails/nail-04.png',
    service: '芭比美甲',
    price: 198,
    date: '2026-06-15',
    time: '15:30',
    status: 'changed',
    statusText: '已变更',
    location: '朝阳区 · 1.2km',
    remark: '闺蜜推荐的颜色，改到16:00',
    changeReason: '客户要求调整时间',
    labels: { shape: '杏仁甲', tone: '亮色', craft: '渐变', decor: '碎钻', style: '甜酷风' }
  },
  {
    id: 4,
    customer: '婷婷',
    phone: '135****7890',
    salonId: 3,
    salonName: 'Mia Nails',
    chatId: 3,
    artistId: 3,
    artistName: 'Nicole',
    artistAvatar: 'N',
    nailStyleId: 5,
    nailStyleName: '复古红棕',
    nailImage: '/images/nails/nail-05.png',
    service: '鎏金美甲',
    price: 268,
    date: '2026-05-20',
    time: '11:00',
    status: 'completed',
    statusText: '已完成',
    location: '西城区 · 3.1km',
    remark: '',
    labels: { shape: '梯形甲', tone: '红色系', craft: '纯色', decor: '金/银碎箔', style: '法式' }
  },
  {
    id: 5,
    customer: '思思',
    phone: '137****4567',
    salonId: 2,
    salonName: 'Her Nail Studio',
    chatId: 4,
    artistId: 2,
    artistName: '小雨',
    artistAvatar: 'Y',
    nailStyleId: 2,
    nailStyleName: '冰透裸色',
    nailImage: '/images/nails/nail-02.png',
    service: '轻奢风格',
    price: 258,
    date: '2026-05-18',
    time: '16:00',
    status: 'cancelled',
    statusText: '已取消',
    location: '海淀区 · 2.5km',
    remark: '',
    cancelReason: '客户临时有事',
    labels: { shape: '方圆甲', tone: '裸色', craft: '纯色', decor: '无装饰', style: '简约风' }
  }
]


export const inspirationThemes = [
  {
    id: 1,
    name: '春日花语',
    coverImage: '/images/nails/nail-01.jpg',
    count: 24,
    category: '春日',
    labels: { shape: '杏仁甲', tone: '裸色', craft: '手绘', decor: '立体雕花', style: '温柔风' }
  },
  {
    id: 2,
    name: '法式经典',
    coverImage: '/images/nails/nail-03.png',
    count: 18,
    category: '法式',
    labels: { shape: '方圆甲', tone: '裸色', craft: '纯色', decor: '无装饰', style: '法式' }
  },
  {
    id: 3,
    name: '闪粉派对',
    coverImage: '/images/nails/nail-04.png',
    count: 16,
    category: '闪粉',
    labels: { shape: '杏仁甲', tone: '亮色', craft: '渐变', decor: '碎钻', style: '甜酷风' }
  },
  {
    id: 4,
    name: '极简裸色',
    coverImage: '/images/nails/nail-02.png',
    count: 22,
    category: '裸色',
    labels: { shape: '圆甲', tone: '裸色', craft: '纯色', decor: '无装饰', style: '简约风' }
  },
  {
    id: 5,
    name: '渐变星空',
    coverImage: '/images/nails/nail-06.png',
    count: 15,
    category: '渐变',
    labels: { shape: '梯形甲', tone: '冷色', craft: '渐变', decor: '金/银碎箔', style: 'ins风' }
  },
  {
    id: 6,
    name: '复古酒红',
    coverImage: '/images/nails/nail-05.png',
    count: 20,
    category: '红色',
    labels: { shape: '梯形甲', tone: '红色系', craft: '纯色', decor: '金/银碎箔', style: '法式' }
  },
  {
    id: 7,
    name: '几何线条',
    coverImage: '/images/nails/nail-08.png',
    count: 12,
    category: '设计',
    labels: { shape: '尖甲', tone: '金属', craft: '纯色', decor: '金/银碎箔', style: 'ins风' }
  },
  {
    id: 8,
    name: '樱花物语',
    coverImage: '/images/nails/nail-12.png',
    count: 19,
    category: '日式',
    labels: { shape: '杏仁甲', tone: '透色', craft: '晕染', decor: '珍珠/铆钉', style: '日式' }
  }
]

export const coupons = [
  {
    id: 1,
    title: '新人专享券',
    discount: '满100减30',
    condition: '新用户首次下单可用',
    expireDate: '2024-06-30',
    amount: 30,
    used: false
  },
  {
    id: 2,
    title: '春日美甲券',
    discount: '满200减50',
    condition: '限春日系列款式',
    expireDate: '2024-05-31',
    amount: 50,
    used: false
  },
  {
    id: 3,
    title: '会员专属券',
    discount: '8折优惠',
    condition: '全场通用，最高减80元',
    expireDate: '2024-07-15',
    amount: 80,
    used: false
  },
  {
    id: 4,
    title: '好友推荐券',
    discount: '满150减20',
    condition: '全场通用',
    expireDate: '2024-04-30',
    amount: 20,
    used: true
  }
]
