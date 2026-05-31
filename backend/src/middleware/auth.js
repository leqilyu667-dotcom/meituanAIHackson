import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'miaoshou-dev-secret-2026';

export function authRequired(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '请先登录' });
  }
  try {
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.user_id;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ code: 401, message: '登录已过期' });
  }
}

export function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(auth.split(' ')[1], JWT_SECRET);
      req.userId = payload.user_id;
      req.userRole = payload.role;
    } catch {}
  }
  next();
}

export function merchantOnly(req, res, next) {
  if (req.userRole !== 'merchant' && req.userRole !== 'admin') {
    return res.status(403).json({ code: 403, message: '需要商家权限' });
  }
  next();
}

export { JWT_SECRET };
