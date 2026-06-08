const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const simplePassword = require('../../middlewares/simplePassword');
const {
  CAN_MANAGE_BOOKINGS,
  CAN_VIEW_BOOKINGS,
} = require('../../config/roles');

router.get(
  '/',
  authenticate,
  simplePassword,
  (req, res) => {
    if (!CAN_VIEW_BOOKINGS.includes(req.user.role)) {
      return res.status(403).send('Доступ запрещён');
    }
    res.render('bookings', { title: 'Мои бронирования' });
  }
);

router.get(
  '/new',
  authenticate,
  simplePassword,
  (req, res) => {
    if (!CAN_MANAGE_BOOKINGS.includes(req.user.role)) {
      return res.status(403).send('Доступ запрещён');
    }
    res.render('booking-new', {
      title: 'Новая бронь',
      equipmentId: req.query.equipment_id || '',
    });
  }
);

module.exports = router;
