const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  console.log('--- AUTH MIDDLEWARE ---');

  let token = null;

  // 1. Пытаемся взять из cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log('Token from COOKIE');
  }

  // 2. Если нет — пробуем из header
  else if (req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
      console.log('Token from HEADER');
    }
  }

  if (!token) {
    console.log('❌ No token');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT OK:', decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ JWT ERROR:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const authorize = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};

module.exports = { authenticate, authorize };