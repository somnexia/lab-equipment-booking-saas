const jwt = require('jsonwebtoken');
const {
  ROLE_LABELS,
  CAN_VIEW_EQUIPMENT,
  CAN_VIEW_BOOKINGS,
  CAN_MANAGE_BOOKINGS,
  CAN_ACCESS_ADMIN_UI,
} = require('../config/roles');

function buildNavPerms(role) {
  if (!role) {
    return {
      showCatalog: false,
      showBookings: false,
      showNewBooking: false,
      showAdmin: false,
    };
  }

  return {
    showCatalog: CAN_VIEW_EQUIPMENT.includes(role),
    showBookings: CAN_VIEW_BOOKINGS.includes(role),
    showNewBooking: CAN_MANAGE_BOOKINGS.includes(role),
    showAdmin: CAN_ACCESS_ADMIN_UI.includes(role),
  };
}

/** Подставляет user в res.locals для Jade (без обязательной авторизации). */
module.exports = (req, res, next) => {
  res.locals.user = null;
  res.locals.roleLabel = null;
  res.locals.currentPath = req.path;
  res.locals.navPerms = buildNavPerms(null);

  const token = req.cookies?.token;
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.user = decoded;
    res.locals.roleLabel = ROLE_LABELS[decoded.role] || decoded.role;
    res.locals.navPerms = buildNavPerms(decoded.role);
  } catch (_) {
    res.locals.user = null;
  }

  next();
};
