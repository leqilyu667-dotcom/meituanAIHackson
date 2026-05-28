import { Router } from 'express'
import db from '../db.js'

const router = Router()

/**
 * GET /api/merchant/order/list
 * List all orders
 */
router.get('/list', (req, res) => {
  const { offset = 0, limit = 20 } = req.query
  const orders = db.prepare(
    'SELECT * FROM nail_order WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(Number(limit), Number(offset))

  const total = db.prepare('SELECT COUNT(*) as c FROM nail_order WHERE is_deleted = 0').get()?.c || 0

  const totalRevenue = db.prepare(
    'SELECT SUM(actual_receivable) as s FROM nail_order WHERE is_deleted = 0'
  ).get()?.s || 0

  return res.json({
    code: 0,
    data: {
      orders: orders.map(formatOrder),
      total,
      totalRevenue
    }
  })
})

/**
 * GET /api/merchant/order/:id
 * Single order detail
 */
router.get('/:id', (req, res) => {
  const order = db.prepare(
    'SELECT * FROM nail_order WHERE id = ? AND is_deleted = 0'
  ).get(req.params.id)

  if (!order) {
    return res.status(404).json({ code: 'ORDER_NOT_FOUND', message: '订单不存在' })
  }

  return res.json({ code: 0, data: formatOrder(order) })
})

/**
 * POST /api/merchant/order
 * Create order from revenue calculator
 */
router.post('/', (req, res) => {
  const {
    orderNo, customerName, customerPhone, appointmentId, nailArtist, serviceItem,
    price, quantity, discountType, discount, subtotal,
    workImage, tags, confidence,
    paymentCash, paymentCard,
    totalReceivable, totalDiscount, actualReceivable, changeAmount
  } = req.body

  if (!orderNo) {
    return res.status(422).json({ code: 'INVALID_PARAMS', message: '订单号不能为空' })
  }

  const result = db.prepare(`INSERT INTO nail_order
    (order_no, customer_name, customer_phone, appointment_id, nail_artist, service_item,
     price, quantity, discount_type, discount, subtotal,
     work_image, tags_json, confidence_json,
     payment_cash, payment_card,
     total_receivable, total_discount, actual_receivable, change_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    orderNo, customerName || '', customerPhone || '', appointmentId || null, nailArtist || '', serviceItem || '',
    price || 0, quantity || 1, discountType || 'amount', discount || 0, subtotal || 0,
    workImage || null, tags ? JSON.stringify(tags) : '{}', confidence ? JSON.stringify(confidence) : '{}',
    paymentCash || 0, paymentCard || 0,
    totalReceivable || 0, totalDiscount || 0, actualReceivable || 0, changeAmount || 0
  )

  return res.json({ code: 0, message: 'ok', data: { id: Number(result.lastInsertRowid) } })
})

/**
 * PUT /api/merchant/order/:id
 * Update order tags, nail artist, etc.
 */
router.put('/:id', (req, res) => {
  const order = db.prepare(
    'SELECT * FROM nail_order WHERE id = ? AND is_deleted = 0'
  ).get(req.params.id)

  if (!order) {
    return res.status(404).json({ code: 'ORDER_NOT_FOUND', message: '订单不存在' })
  }

  const { tags, nailArtist } = req.body

  if (tags) {
    db.prepare(`UPDATE nail_order SET tags_json = ? WHERE id = ?`)
      .run(JSON.stringify(tags), req.params.id)
  }

  if (nailArtist) {
    db.prepare(`UPDATE nail_order SET nail_artist = ? WHERE id = ?`)
      .run(nailArtist, req.params.id)
  }

  return res.json({ code: 0, message: 'ok' })
})

/**
 * DELETE /api/merchant/order/:id
 * Soft-delete an order
 */
router.delete('/:id', (req, res) => {
  const order = db.prepare(
    'SELECT * FROM nail_order WHERE id = ? AND is_deleted = 0'
  ).get(req.params.id)

  if (!order) {
    return res.status(404).json({ code: 'ORDER_NOT_FOUND', message: '订单不存在' })
  }

  db.prepare(`UPDATE nail_order SET is_deleted = 1 WHERE id = ?`).run(req.params.id)

  return res.json({ code: 0, message: 'ok' })
})

function formatOrder(o) {
  return {
    id: o.id,
    orderNo: o.order_no,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    appointmentId: o.appointment_id,
    serviceItem: o.service_item,
    price: o.price,
    quantity: o.quantity,
    discountType: o.discount_type,
    discount: o.discount,
    subtotal: o.subtotal,
    workImage: o.work_image,
    tags: o.tags_json ? JSON.parse(o.tags_json) : {},
    confidence: o.confidence_json ? JSON.parse(o.confidence_json) : {},
    paymentCash: o.payment_cash,
    paymentCard: o.payment_card,
    totalReceivable: o.total_receivable,
    totalDiscount: o.total_discount,
    actualReceivable: o.actual_receivable,
    changeAmount: o.change_amount,
    nailArtist: o.nail_artist || '',
    createdAt: o.created_at
  }
}

export default router
