const MERCHANT_TOKEN = process.env.MERCHANT_API_TOKEN || 'nailia_merchant_2026_prod'

export function requireMerchantAuth(req, res, next) {
  const token = req.headers['x-merchant-token'] || req.query.token

  if (!token || token !== MERCHANT_TOKEN) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: '无效的访问令牌' })
  }

  next()
}
