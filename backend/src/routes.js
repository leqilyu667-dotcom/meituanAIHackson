import { Router } from 'express';
import jwt from 'jsonwebtoken';
import db from './database.js';
import { authRequired, optionalAuth, merchantOnly, JWT_SECRET } from './middleware/auth.js';

const router = Router();

const ok = (res, data) => res.json({ code: 0, message: 'ok', data });
const created = (res, data) => res.status(201).json({ code: 0, message: 'created', data });
const fail = (res, code, msg) => res.status(code).json({ code, message: msg });
const page = (res, list, total, p, ps) => res.json({ code: 0, message: 'ok', data: { list, total, page: p, page_size: ps } });

const labelSystem = {
  shape: ['圆甲','方圆甲','尖甲','梯形甲','杏仁甲','建构延长'],
  tone: ['裸色','红色系','亮色','冷色','金属','魔镜粉','透色'],
  craft: ['纯色','跳色','渐变','晕染','手绘','猫眼','魔镜粉'],
  decor: ['无装饰','碎钻','珍珠/铆钉','贴纸','立体雕花','波点','手绘','金/银碎箔'],
  style: ['简约风','法式','ins风','甜酷风','温柔风','日式','欧美风'],
};

// ═══ Auth ═══
router.post('/v1/auth/send-code', (req, res) => ok(res, { code: '000000', message: '验证码已发送（演示：000000）' }));

router.post('/v1/auth/login', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || code?.length !== 6) return fail(res, 400, '手机号或验证码错误');
  let user = db.get('users', { phone });
  if (!user) {
    user = db.insert('users', { phone, nickname: '用户'+phone.slice(-4), role: 'customer', tryon_count: 0, reservation_count: 0, favorite_count: 0, record_count: 0, avatar_url: '' });
  }
  const token = jwt.sign({ user_id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  ok(res, { token, user });
});

router.get('/v1/auth/profile', authRequired, (req, res) => {
  const u = db.get('users', req.userId);
  u ? ok(res, u) : fail(res, 404, '用户不存在');
});

// ═══ Labels / Config ═══
router.get('/v1/labels/system', (_, res) => ok(res, labelSystem));
router.get('/v1/labels/dimensions', (_, res) => ok(res, [
  { key: 'shape', name: '甲型' }, { key: 'tone', name: '色调' }, { key: 'craft', name: '工艺' },
  { key: 'decor', name: '装饰元素' }, { key: 'style', name: '风格' }
]));
router.get('/v1/appointment-status', (_, res) => ok(res, {
  PENDING: { value:'pending',label:'待确认',color:'warning' },
  CONFIRMED: { value:'confirmed',label:'已确认',color:'primary-600' },
  COMPLETED: { value:'completed',label:'已完成',color:'success' },
  CHANGED: { value:'changed',label:'已变更',color:'cocoa' },
  CANCELLED: { value:'cancelled',label:'已取消',color:'error' },
}));
router.get('/v1/categories', (_, res) => ok(res, ['推荐','春日','简约','法式','显白','有设计']));

// ═══ Products ═══
router.get('/v1/products', (req, res) => {
  const { category, label_shape, label_tone, label_style, search, sort = 'likes', page: p = 1, page_size: ps = 20 } = req.query;
  let list = db.all('products', { shelf_status: 'active' });
  if (category && category !== '推荐') list = list.filter(r => r.category === category);
  if (label_shape) list = list.filter(r => r.label_shape === label_shape);
  if (label_tone) list = list.filter(r => r.label_tone === label_tone);
  if (label_style) list = list.filter(r => r.label_style === label_style);
  if (search) list = list.filter(r => r.name.includes(search) || r.description.includes(search));
  list.sort((a, b) => sort === 'new' ? 0 : (b.likes || 0) - (a.likes || 0));
  const total = list.length;
  list = list.slice((+p - 1) * +ps, +p * +ps);
  page(res, list, total, +p, +ps);
});

router.get('/v1/products/:id', (req, res) => {
  const p = db.get('products', +req.params.id);
  p ? ok(res, p) : fail(res, 404, '款式不存在');
});

// ═══ Inspiration ═══
router.get('/v1/inspiration-themes', (_, res) => ok(res, db.all('inspiration_themes')));

// ═══ Salons ═══
router.get('/v1/salons', (req, res) => {
  const { location, search, sort = 'rating' } = req.query;
  let list = db.all('salons', { status: 'active' });
  if (location && location !== '全部区域') list = list.filter(s => s.location === location);
  if (search) list = list.filter(s => s.name.includes(search));
  list.sort((a, b) => sort === 'distance' ? parseFloat(a.distance) - parseFloat(b.distance) : sort === 'reviews' ? (b.review_count||0) - (a.review_count||0) : (b.rating||0) - (a.rating||0));

  const salonWorks = { 1: ['/images/nails/nail-01.jpg','/images/nails/nail-02.png','/images/nails/nail-03.png'], 2: ['/images/nails/nail-04.png','/images/nails/nail-05.png','/images/nails/nail-06.png'], 3: ['/images/nails/nail-07.png','/images/nails/nail-08.png','/images/nails/nail-09.png'], 4: ['/images/nails/nail-10.png','/images/nails/nail-11.png','/images/nails/nail-12.png'], 5: ['/images/nails/nail-01.jpg','/images/nails/nail-04.png','/images/nails/nail-07.png'], 6: ['/images/nails/nail-02.png','/images/nails/nail-05.png','/images/nails/nail-08.png'] };
  page(res, list.map(s => ({ ...s, works: salonWorks[s.id] || [] })), list.length, 1, list.length);
});

router.get('/v1/salons/:id', (req, res) => {
  const salon = db.get('salons', +req.params.id);
  if (!salon) return fail(res, 404, '店铺不存在');
  const services = db.all('service_items', { salon_id: +req.params.id, status: 'active' });
  const works = ['/images/nails/nail-01.jpg','/images/nails/nail-02.png','/images/nails/nail-03.png'];
  ok(res, { salon, services, works });
});

router.get('/v1/salons/:id/artists', (req, res) => ok(res, db.all('artists', { salon_id: +req.params.id, status: 'active' })));

// ═══ Artists ═══
router.get('/v1/artists', (req, res) => {
  let list = db.all('artists', { status: 'active' });
  if (req.query.salon_id) list = list.filter(a => a.salon_id === +req.query.salon_id);
  page(res, list, list.length, 1, list.length);
});

router.get('/v1/artists/:id', (req, res) => {
  const artist = db.get('artists', +req.params.id);
  if (!artist) return fail(res, 404, '美甲师不存在');
  const works = db.all('artist_works', { artist_id: +req.params.id });
  const reviews = db.all('reviews', { artist_id: +req.params.id });
  const salon = db.get('salons', artist.salon_id);
  ok(res, { artist, works, reviews, salon });
});
router.get('/v1/artists/:id/works', (req, res) => ok(res, db.all('artist_works', { artist_id: +req.params.id })));
router.get('/v1/artists/:id/reviews', (req, res) => ok(res, db.all('reviews', { artist_id: +req.params.id })));

// ═══ Reservations ═══
router.post('/v1/reservations', authRequired, (req, res) => {
  const { salon_id, artist_id, service_name, service_price, date, time, nail_style_id, design_image_url, remark, contact_name, contact_phone } = req.body;
  if (!salon_id || !date || !time) return fail(res, 400, '参数不完整');

  const salon = db.get('salons', +salon_id);
  let artistName = '', artistAvatar = '';
  if (artist_id) { const a = db.get('artists', +artist_id); if (a) { artistName = a.name; artistAvatar = a.avatar; } }

  const r = db.insert('reservations', {
    user_id: req.userId, salon_id: +salon_id, artist_id: artist_id ? +artist_id : null, customer: contact_name || '', phone: contact_phone || '',
    salon_name: salon?.name || '', artist_name: artistName, artist_avatar: artistAvatar, chat_id: null,
    nail_style_id: nail_style_id || null, nail_style_name: '', nail_image_url: '',
    service_name: service_name || '', service_price: service_price || 0, date, time,
    status: 'pending', status_text: '待确认', location: salon?.location || '', remark: remark || '', design_image_url: design_image_url || '',
  });

  const user = db.get('users', req.userId);
  if (user) db.update('users', req.userId, { reservation_count: (user.reservation_count || 0) + 1 });

  created(res, r);
});

router.get('/v1/reservations', authRequired, (req, res) => {
  let list = db.all('reservations', { user_id: req.userId });
  if (req.query.status && req.query.status !== 'all') list = list.filter(r => r.status === req.query.status);
  list.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.time || '').localeCompare(a.time || ''));
  ok(res, list);
});

router.get('/v1/reservations/:id', authRequired, (req, res) => {
  const r = db.get('reservations', +req.params.id);
  r ? ok(res, r) : fail(res, 404, '预约不存在');
});

router.put('/v1/reservations/:id/:action', authRequired, (req, res) => {
  const r = db.get('reservations', +req.params.id);
  if (!r) return fail(res, 404, '预约不存在');

  const statusMap = { confirm: ['confirmed','已确认'], cancel: ['cancelled','已取消'], complete: ['completed','已完成'] };
  if (statusMap[req.params.action]) {
    const [status, text] = statusMap[req.params.action];
    db.update('reservations', +req.params.id, { status, status_text: text, cancel_reason: req.params.action === 'cancel' ? (req.body.reason || '') : '' });
  } else if (req.params.action === 'change') {
    const updates = { status: 'changed', status_text: '已变更', change_reason: req.body.reason || '' };
    if (req.body.date) updates.date = req.body.date;
    if (req.body.time) updates.time = req.body.time;
    db.update('reservations', +req.params.id, updates);
  } else { return fail(res, 400, '不支持的操作'); }

  ok(res, db.get('reservations', +req.params.id));
});

// ═══ Orders ═══
router.get('/v1/orders', authRequired, (req, res) => {
  ok(res, db.all('orders', { user_id: req.userId }).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')));
});
router.get('/v1/orders/:id', authRequired, (req, res) => {
  const o = db.get('orders', +req.params.id);
  o ? ok(res, o) : fail(res, 404, '订单不存在');
});

// ═══ Reviews ═══
router.post('/v1/reviews', authRequired, (req, res) => {
  const { artist_id, salon_id, rating, content } = req.body;
  if (!artist_id || !rating) return fail(res, 400, '参数错误');
  const review = db.insert('reviews', { artist_id: +artist_id, salon_id: +salon_id, user_id: req.userId, name: '', rating: +rating, content: content || '', date: '刚刚', status: 'approved' });
  const all = db.all('reviews', { artist_id: +artist_id });
  const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
  db.update('artists', +artist_id, { rating: Math.round(avg * 10) / 10, review_count: all.length });
  created(res, review);
});

// ═══ Favorites ═══
router.get('/v1/users/me/favorites', authRequired, (req, res) => {
  const favs = db.all('favorites', { user_id: req.userId });
  const ids = favs.map(f => f.product_id);
  ok(res, ids.length ? db._data.products.filter(p => ids.includes(p.id)) : []);
});

router.post('/v1/users/me/favorites', authRequired, (req, res) => {
  const { product_id } = req.body;
  const existing = db.get('favorites', { user_id: req.userId, product_id: +product_id });
  if (existing) {
    db.delete('favorites', existing.id);
    const u = db.get('users', req.userId);
    db.update('users', req.userId, { favorite_count: Math.max((u?.favorite_count || 1) - 1, 0) });
    ok(res, { favorited: false });
  } else {
    db.insert('favorites', { user_id: req.userId, product_id: +product_id });
    const u = db.get('users', req.userId);
    db.update('users', req.userId, { favorite_count: (u?.favorite_count || 0) + 1 });
    created(res, { favorited: true });
  }
});

// ═══ Coupons ═══
router.get('/v1/users/me/coupons', authRequired, (_, res) => ok(res, db.all('coupons')));
router.get('/v1/coupons', (_, res) => ok(res, db.all('coupons')));

// ═══ User Profile ═══
router.get('/v1/users/me', authRequired, (req, res) => {
  const u = db.get('users', req.userId);
  ok(res, { name: u.nickname, avatar: u.avatar_url, tryon_count: u.tryon_count, record_count: u.record_count, favorite_count: u.favorite_count, reservation_count: u.reservation_count });
});

// ═══ TryOn ═══
router.post('/v1/tryon/generate', authRequired, (req, res) => {
  ok(res, { result_url: req.body.design_image_url || '/images/nails/nail-01.jpg', match_score: 96, message: '试戴生成成功（演示模式）' });
});

router.post('/v1/tryon/log', authRequired, (req, res) => {
  db.insert('tryon_logs', { user_id: req.userId, hand_image_url: req.body.hand_image_url || '', design_image_url: req.body.design_image_url || '', result_image_url: req.body.result_image_url || '', labels_json: JSON.stringify(req.body.labels || {}), source: req.body.source || '', match_score: req.body.match_score || 0 });
  const u = db.get('users', req.userId);
  db.update('users', req.userId, { tryon_count: (u?.tryon_count || 0) + 1 });
  created(res, { logged: true });
});

router.get('/v1/tryon/history', authRequired, (req, res) => ok(res, db.all('tryon_logs', { user_id: req.userId }).slice(-20).reverse()));

// ═══ Chat ═══
router.get('/v1/conversations', authRequired, (req, res) => ok(res, db.all('conversations', { user_id: req.userId }).sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))));

router.get('/v1/conversations/:id/messages', authRequired, (req, res) => ok(res, db.all('chat_messages', { conversation_id: +req.params.id })));

router.post('/v1/conversations/:id/messages', authRequired, (req, res) => {
  const { content, message_type, image_url } = req.body;
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const msgContent = content || (image_url ? '[图片]' : '');

  const msg = db.insert('chat_messages', { conversation_id: +req.params.id, sender_type: 'user', sender_name: '', content: msgContent, image_url: image_url || '', time });

  const conv = db.get('conversations', +req.params.id);
  if (conv) db.update('conversations', +req.params.id, { last_message: msgContent, time, updated_at: now.toISOString() });

  // Auto-reply
  setTimeout(() => {
    const c = db.get('conversations', +req.params.id);
    if (!c) return;
    const sender = ['artist','salon'][Math.floor(Math.random()*2)];
    const replies = ['好的，收到~','没问题，我帮您安排','感谢您的回复！','明白了，稍等哦~'];
    const replyTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()+1).padStart(2,'0')}`;
    const senderName = sender === 'artist' ? c.artist_name : (c.name?.split(' · ')[0] || '');
    db.insert('chat_messages', { conversation_id: +req.params.id, sender_type: sender, sender_name: senderName, content: replies[Math.floor(Math.random()*4)], time: replyTime });
  }, 1000);

  created(res, msg);
});

// ═══ Merchant ═══
router.get('/v1/merchant/daily-report', authRequired, merchantOnly, (_, res) => ok(res, {
  revenue: { current:8600,previous:7200,unit:'元' }, traffic: { current:48,previous:42,unit:'人' },
  avg_ticket: { current:179,previous:171,unit:'元' }, completion_rate: { current:92,previous:88,unit:'%' },
  tag_revenue_ranking: [{ tags:{shape:'杏仁甲',tone:'裸色',craft:'渐变',decor:'碎钻',style:'温柔风'},revenue:12800,orders:64,share:22.8}],
  tryon_data: { total_orders:186,total_tryons:620,conversion_rate:30.0 },
}));

router.get('/v1/merchant/appointments', authRequired, merchantOnly, (req, res) => {
  let list = db._data.reservations;
  if (req.query.status) list = list.filter(r => r.status === req.query.status);
  if (req.query.artist) list = list.filter(r => r.artist_name === req.query.artist);
  page(res, list.sort((a, b) => (b.date||'').localeCompare(a.date||'')), list.length, 1, list.length);
});

router.get('/v1/merchant/orders', authRequired, merchantOnly, (_, res) => ok(res, db._data.orders));
router.get('/v1/merchant/stats', authRequired, merchantOnly, (_, res) => {
  const rev = db._data.orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.actual_receivable||0), 0);
  ok(res, { total_revenue: rev, total_orders: db._data.orders.length, total_customers: db._data.users.filter(u => u.role === 'customer').length, pending_approvals: db._data.reservations.filter(r => ['pending','confirmed'].includes(r.status)).length });
});

router.get('/v1/merchant/hot-tags', authRequired, merchantOnly, (_, res) => ok(res, [
  { tags:{shape:'杏仁甲',tone:'裸色',craft:'渐变',decor:'碎钻',style:'温柔风'},try_on_count:520,order_count:64 },
  { tags:{shape:'方圆甲',tone:'裸色',craft:'纯色',decor:'无装饰',style:'简约风'},try_on_count:420,order_count:42 },
]));

// ═══ Mock data dump ═══
router.get('/v1/mock/all', (_, res) => {
  const convs = db._data.conversations;
  const chatMsgs = {}; convs.forEach(c => { chatMsgs[c.id] = db.all('chat_messages', { conversation_id: c.id }); });
  ok(res, { label_system: labelSystem, salons: db._data.salons, artists: db._data.artists, nail_styles: db._data.products, categories: ['推荐','春日','简约','法式','显白','有设计'], inspiration_themes: db._data.inspiration_themes, reservations: db._data.reservations, orders: db._data.orders, conversations: convs, chat_messages: chatMsgs, coupons: db._data.coupons });
});

router.get('/health', (_, res) => res.send('OK'));

export default router;
