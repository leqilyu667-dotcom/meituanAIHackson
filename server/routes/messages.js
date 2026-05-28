import { Router } from 'express'
import db from '../db.js'

const router = Router()

/**
 * GET /api/merchant/messages/conversations
 * List all conversations, newest first
 */
router.get('/conversations', (req, res) => {
  const conversations = db.prepare(`
    SELECT * FROM customer_conversation
    WHERE is_deleted = 0
    ORDER BY last_message_at DESC
  `).all()

  return res.json({
    code: 0,
    data: conversations.map(c => ({
      id: c.id,
      customerName: c.customer_name,
      customerPhone: c.customer_phone,
      lastMessage: c.last_message,
      lastMessageAt: c.last_message_at,
      unreadCount: c.unread_count
    }))
  })
})

/**
 * GET /api/merchant/messages/:conversationId
 * Get messages for a conversation
 */
router.get('/:conversationId', (req, res) => {
  const conv = db.prepare(
    'SELECT * FROM customer_conversation WHERE id = ? AND is_deleted = 0'
  ).get(req.params.conversationId)

  if (!conv) {
    return res.status(404).json({ code: 'CONV_NOT_FOUND', message: '对话不存在' })
  }

  // Mark as read
  db.prepare('UPDATE customer_conversation SET unread_count = 0 WHERE id = ?').run(req.params.conversationId)

  // Fetch active appointment for this customer
  const activeApt = db.prepare(`
    SELECT * FROM appointment
    WHERE customer_phone = ? AND is_deleted = 0 AND status != 'cancelled'
    ORDER BY created_at DESC LIMIT 1
  `).get(conv.customer_phone)

  const messages = db.prepare(`
    SELECT * FROM customer_message
    WHERE conversation_id = ?
    ORDER BY created_at ASC
  `).all(req.params.conversationId)

  return res.json({
    code: 0,
    data: {
      id: conv.id,
      customerName: conv.customer_name,
      customerPhone: conv.customer_phone,
      appointment: activeApt ? {
        appointmentId: activeApt.id,
        customerName: activeApt.customer_name,
        nailArtist: activeApt.nail_artist,
        appointmentTime: activeApt.appointment_time,
        serviceItem: activeApt.service_item || '',
        notes: activeApt.notes || '',
        status: activeApt.status
      } : null,
      messages: messages.map(m => ({
        id: m.id,
        sender: m.sender,
        content: m.content,
        createdAt: m.created_at
      }))
    }
  })
})

/**
 * POST /api/merchant/messages/:conversationId/send
 * Send a message as merchant
 */
router.post('/:conversationId/send', (req, res) => {
  const { content } = req.body
  if (!content || !content.trim()) {
    return res.status(422).json({ code: 'EMPTY_MESSAGE', message: '消息不能为空' })
  }

  const conv = db.prepare(
    'SELECT * FROM customer_conversation WHERE id = ? AND is_deleted = 0'
  ).get(req.params.conversationId)

  if (!conv) {
    return res.status(404).json({ code: 'CONV_NOT_FOUND', message: '对话不存在' })
  }

  db.prepare(`INSERT INTO customer_message (conversation_id, sender, content) VALUES (?, 'merchant', ?)`)
    .run(req.params.conversationId, content.trim())

  db.prepare(`UPDATE customer_conversation SET
    last_message = ?, last_message_at = datetime('now','localtime'),
    updated_at = datetime('now','localtime')
    WHERE id = ?`).run(content.trim(), req.params.conversationId)

  return res.json({ code: 0, message: 'ok' })
})

/**
 * POST /api/merchant/messages/:conversationId/appointment
 * Create appointment directly from conversation
 */
router.post('/:conversationId/appointment', (req, res) => {
  const conv = db.prepare(
    'SELECT * FROM customer_conversation WHERE id = ? AND is_deleted = 0'
  ).get(req.params.conversationId)

  if (!conv) {
    return res.status(404).json({ code: 'CONV_NOT_FOUND', message: '对话不存在' })
  }

  const { nailArtist, appointmentTime, serviceItem, notes } = req.body

  if (!nailArtist || !appointmentTime) {
    return res.status(422).json({ code: 'INVALID_PARAMS', message: '美甲师和预约时间为必填项' })
  }

  // Check if appointment table exists, create if not
  db.exec(`
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
    )
  `)

  const result = db.prepare(`INSERT INTO appointment
    (customer_name, customer_phone, nail_artist, appointment_time, service_item, notes)
    VALUES (?, ?, ?, ?, ?, ?)`).run(
    conv.customer_name, conv.customer_phone || '', nailArtist, appointmentTime,
    serviceItem || '', notes || ''
  )

  // Send confirmation message
  const aptMsg = `已为您预约：${nailArtist}老师 · ${appointmentTime}${serviceItem ? ' · ' + serviceItem : ''}，预约ID: ${result.lastInsertRowid}`
  db.prepare(`INSERT INTO customer_message (conversation_id, sender, content) VALUES (?, 'merchant', ?)`)
    .run(req.params.conversationId, aptMsg)

  db.prepare(`UPDATE customer_conversation SET
    last_message = ?, last_message_at = datetime('now','localtime'),
    updated_at = datetime('now','localtime')
    WHERE id = ?`).run(aptMsg, req.params.conversationId)

  return res.json({
    code: 0,
    message: 'ok',
    data: {
      appointmentId: Number(result.lastInsertRowid),
      customerName: conv.customer_name,
      nailArtist,
      appointmentTime
    }
  })
})

/**
 * PUT /api/merchant/messages/:conversationId/appointment/:appointmentId
 * Modify an appointment from conversation
 */
router.put('/:conversationId/appointment/:appointmentId', (req, res) => {
  const apt = db.prepare(
    'SELECT * FROM appointment WHERE id = ? AND is_deleted = 0'
  ).get(req.params.appointmentId)

  if (!apt) {
    return res.status(404).json({ code: 'APPOINTMENT_NOT_FOUND', message: '预约不存在' })
  }

  const { nailArtist, appointmentTime, serviceItem, notes } = req.body

  if (!nailArtist || !appointmentTime) {
    return res.status(422).json({ code: 'INVALID_PARAMS', message: '美甲师和预约时间为必填项' })
  }

  db.prepare(`UPDATE appointment SET
    nail_artist = ?, appointment_time = ?, service_item = ?, notes = ?,
    status = 'changed', updated_at = datetime('now','localtime')
    WHERE id = ?`).run(nailArtist, appointmentTime, serviceItem || '', notes || '', req.params.appointmentId)

  const changeMsg = `预约已变更：${nailArtist}老师 · ${appointmentTime}${serviceItem ? ' · ' + serviceItem : ''}`
  db.prepare(`INSERT INTO customer_message (conversation_id, sender, content) VALUES (?, 'merchant', ?)`)
    .run(req.params.conversationId, changeMsg)

  db.prepare(`UPDATE customer_conversation SET
    last_message = ?, last_message_at = datetime('now','localtime'),
    updated_at = datetime('now','localtime')
    WHERE id = ?`).run(changeMsg, req.params.conversationId)

  return res.json({
    code: 0,
    message: 'ok',
    data: { appointmentId: Number(req.params.appointmentId) }
  })
})

/**
 * POST /api/merchant/messages/:conversationId/appointment/:appointmentId/cancel
 * Cancel an appointment from conversation (reason required)
 */
router.post('/:conversationId/appointment/:appointmentId/cancel', (req, res) => {
  const apt = db.prepare(
    'SELECT * FROM appointment WHERE id = ? AND is_deleted = 0'
  ).get(req.params.appointmentId)

  if (!apt) {
    return res.status(404).json({ code: 'APPOINTMENT_NOT_FOUND', message: '预约不存在' })
  }

  const { reason } = req.body

  if (!reason || !reason.trim()) {
    return res.status(422).json({ code: 'CANCEL_REASON_REQUIRED', message: '取消预约必须填写原因' })
  }

  db.prepare(`UPDATE appointment SET
    status = 'cancelled', cancel_reason = ?, updated_at = datetime('now','localtime')
    WHERE id = ?`).run(reason.trim(), req.params.appointmentId)

  const cancelMsg = `预约已取消（原因：${reason.trim()}）`
  db.prepare(`INSERT INTO customer_message (conversation_id, sender, content) VALUES (?, 'merchant', ?)`)
    .run(req.params.conversationId, cancelMsg)

  db.prepare(`UPDATE customer_conversation SET
    last_message = ?, last_message_at = datetime('now','localtime'),
    updated_at = datetime('now','localtime')
    WHERE id = ?`).run(cancelMsg, req.params.conversationId)

  return res.json({ code: 0, message: 'ok' })
})

export default router
