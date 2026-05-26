export const nailStyles = [
  {
    id: 1,
    name: '春日新款',
    description: '温柔气质款',
    image: '/images/nails/nail-01.jpg',
    category: '春日',
    likes: 2341,
    isNew: true
  },
  {
    id: 2,
    name: '冰透裸色',
    description: '自然百搭',
    image: '/images/nails/nail-02.png',
    category: '裸色',
    likes: 1892,
    isNew: false
  },
  {
    id: 3,
    name: '奶油法式',
    description: '经典优雅',
    image: '/images/nails/nail-03.png',
    category: '法式',
    likes: 3421,
    isNew: false
  },
  {
    id: 4,
    name: '渐变闪粉',
    description: '闪耀夺目',
    image: '/images/nails/nail-04.png',
    category: '闪粉',
    likes: 1567,
    isNew: true
  },
  {
    id: 5,
    name: '复古红棕',
    description: '显白气质',
    image: '/images/nails/nail-05.png',
    category: '红色',
    likes: 2156,
    isNew: false
  },
  {
    id: 6,
    name: '清新薄荷',
    description: '清凉夏日',
    image: '/images/nails/nail-06.png',
    category: '绿色',
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
    image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=luxury%20nail%20salon%20interior%20modern%20elegant%20pink%20decor%20comfortable&image_size=landscape_4_3',
    location: '朝阳区',
    distance: '1.2km'
  },
  {
    id: 2,
    name: 'Her Nail Studio',
    rating: 4.8,
    reviews: 960,
    services: ['法式美甲', '轻奢风格', '定制款'],
    image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=cozy%20nail%20studio%20warm%20lighting%20elegant%20design%20salon&image_size=landscape_4_3',
    location: '海淀区',
    distance: '2.5km'
  },
  {
    id: 3,
    name: 'Mia Nails',
    rating: 4.7,
    reviews: 780,
    services: ['蛋白矫正', '鎏金美甲', '新娘美甲'],
    image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=modern%20nail%20salon%20minimalist%20white%20interior%20professional&image_size=landscape_4_3',
    location: '西城区',
    distance: '3.1km'
  }
]

export const messages = [
  {
    id: 1,
    name: 'Nail Moment 美甲坊',
    avatar: 'N',
    content: '您好，您的预约已通过，明天下午2点见~',
    time: '09:21',
    unread: true
  },
  {
    id: 2,
    name: '美甲师 Luna',
    avatar: 'L',
    content: '您好，请问有什么可以帮您？',
    time: '昨天',
    unread: false
  },
  {
    id: 3,
    name: 'Her Nail Studio',
    avatar: 'H',
    content: '感谢您的光临，期待下次再见~',
    time: '04/10',
    unread: false
  },
  {
    id: 4,
    name: '美甲师小雨',
    avatar: 'Y',
    content: '您选的款式我已经记下了，明天见！',
    time: '04/10',
    unread: false
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
    { id: 1, sender: 'salon', text: '您好，感谢预约 Nail Moment 美甲坊！', time: '09:15' },
    { id: 2, sender: 'salon', text: '您的预约已通过，明天下午2点见~', time: '09:15' },
    { id: 3, sender: 'user', text: '好的，谢谢！我想问一下可以改款式吗？', time: '09:18' },
    { id: 4, sender: 'salon', text: '当然可以，到店后和美甲师沟通就行~', time: '09:20' },
    { id: 5, sender: 'user', text: '太好了，明天见！', time: '09:21' }
  ],
  2: [
    { id: 1, sender: 'salon', text: '您好，我是美甲师 Luna，很高兴为您服务！', time: '昨天 14:30' },
    { id: 2, sender: 'user', text: '你好！我想做一个法式美甲', time: '昨天 14:32' },
    { id: 3, sender: 'salon', text: '好的，法式美甲很经典，我们有几种款式可以选', time: '昨天 14:33' },
    { id: 4, sender: 'salon', text: '请问您方便什么时候过来呢？', time: '昨天 14:33' },
    { id: 5, sender: 'user', text: '这周末下午可以吗？', time: '昨天 14:35' },
    { id: 6, sender: 'salon', text: '可以的，周六下午2点有空位，帮您预约？', time: '昨天 14:36' },
    { id: 7, sender: 'user', text: '好的，就这个时间', time: '昨天 14:38' },
    { id: 8, sender: 'salon', text: '已为您预约成功，周六下午2点见！', time: '昨天 14:40' }
  ],
  3: [
    { id: 1, sender: 'salon', text: '感谢您的光临！您做的款式真好看~', time: '04/10 16:20' },
    { id: 2, sender: 'user', text: '谢谢！你们服务很好，我很满意', time: '04/10 16:22' },
    { id: 3, sender: 'salon', text: '期待下次再见~ 我们会持续上新款式的', time: '04/10 16:25' }
  ],
  4: [
    { id: 1, sender: 'salon', text: '您好，我是美甲师小雨', time: '04/10 10:00' },
    { id: 2, sender: 'user', text: '你好小雨！上次你帮我做的渐变款很好看', time: '04/10 10:05' },
    { id: 3, sender: 'salon', text: '谢谢喜欢！这次想做什么款式呢？', time: '04/10 10:06' },
    { id: 4, sender: 'user', text: '我想试试那个春日新款', time: '04/10 10:08' },
    { id: 5, sender: 'salon', text: '好的，您选的款式我已经记下了，明天见！', time: '04/10 10:10' }
  ]
}

export const orders = [
  {
    id: 1,
    salonName: 'Nail Moment 美甲坊',
    service: '日式美甲',
    price: 168,
    status: 'completed',
    statusText: '已完成',
    date: '2024-04-08',
    image: '/images/nails/nail-02.png'
  },
  {
    id: 2,
    salonName: 'Her Nail Studio',
    service: '法式美甲',
    price: 128,
    status: 'completed',
    statusText: '已完成',
    date: '2024-03-25',
    image: '/images/nails/nail-03.png'
  },
  {
    id: 3,
    salonName: 'Nail Moment 美甲坊',
    service: '芭比美甲',
    price: 198,
    status: 'upcoming',
    statusText: '待服务',
    date: '2024-05-15',
    image: '/images/nails/nail-04.png'
  },
  {
    id: 4,
    salonName: 'Mia Nails',
    service: '鎏金美甲',
    price: 268,
    status: 'cancelled',
    statusText: '已取消',
    date: '2024-03-10',
    image: '/images/nails/nail-05.png'
  }
]

export const reservations = [
  {
    id: 1,
    salonId: 1,
    salonName: 'Nail Moment 美甲坊',
    chatId: 1,
    artistName: '美甲师 Luna',
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
    remark: '想做温柔一点的款式'
  },
  {
    id: 2,
    salonId: 2,
    salonName: 'Her Nail Studio',
    chatId: 2,
    artistName: '美甲师小雨',
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
    remark: ''
  },
  {
    id: 3,
    salonId: 1,
    salonName: 'Nail Moment 美甲坊',
    chatId: 1,
    artistName: '美甲师 Luna',
    artistAvatar: 'L',
    nailStyleId: 4,
    nailStyleName: '渐变闪粉',
    nailImage: '/images/nails/nail-04.png',
    service: '芭比美甲',
    price: 198,
    date: '2026-06-15',
    time: '15:30',
    status: 'confirmed',
    statusText: '已确认',
    location: '朝阳区 · 1.2km',
    remark: '闺蜜推荐的颜色'
  },
  {
    id: 4,
    salonId: 3,
    salonName: 'Mia Nails',
    chatId: 3,
    artistName: '美甲师 Nicole',
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
    remark: ''
  },
  {
    id: 5,
    salonId: 2,
    salonName: 'Her Nail Studio',
    chatId: 4,
    artistName: '美甲师小雨',
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
    remark: ''
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
