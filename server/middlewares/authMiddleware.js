// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Проверка токена JWT
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Токен обычно приходит как "Bearer <token>"
  const parts  = authHeader.split(' ');//[1]
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Malformed token' });
  }
  const token = parts[1];
  
//   const token  = authHeader.split(' ')[1];//[1]
//   if (!token) {
//     return res.status(401).json({ message: 'Malformed token' });
//   }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // сохраняем данные пользователя в req
    next(); // пропускаем к следующему middleware или маршруту
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware для проверки роли пользователя
const authorize = (roles = []) => {
  // roles может быть строкой или массивом
  if (typeof roles === 'string') roles = [roles];

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};

module.exports = { authenticate, authorize };