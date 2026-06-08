const jwt = require('jsonwebtoken');
const { ROLE_LABELS } = require('../config/roles');

/** Подставляет user в res.locals для Jade (без обязательной авторизации). */
module.exports = (req, res, next) => {
  res.locals.user = null;
  res.locals.roleLabel = null;
  res.locals.currentPath = req.path;

  const token = req.cookies?.token;
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.user = decoded;
    res.locals.roleLabel = ROLE_LABELS[decoded.role] || decoded.role;
  } catch (_) {
    res.locals.user = null;
  }

  next();
};
