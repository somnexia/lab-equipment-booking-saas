const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const simplePassword = require('../../middlewares/simplePassword');
const {
  ROLES,
  CAN_MANAGE_BOOKINGS,
  CAN_VIEW_BOOKINGS,
} = require('../../config/roles');

const CAN_COMPLETE_BOOKINGS = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.RESEARCHER,
  ROLES.STUDENT,
];

router.get('/', authenticate, simplePassword, (req, res) => {
  if (!CAN_VIEW_BOOKINGS.includes(req.user.role)) {
    return res.status(403).send('Доступ запрещён');
  }

  const useOrgList = req.user.role !== ROLES.STUDENT;

  res.render('bookings', {
    title: useOrgList ? 'Бронирования' : 'Мои бронирования',
    uiPerms: {
      useOrgList,
      canCreate: CAN_MANAGE_BOOKINGS.includes(req.user.role),
      canCancel: CAN_MANAGE_BOOKINGS.includes(req.user.role),
      canComplete: CAN_COMPLETE_BOOKINGS.includes(req.user.role),
      defaultStatusFilter: useOrgList ? 'active' : '',
    },
  });
});

router.get('/new', authenticate, simplePassword, (req, res) => {
  if (!CAN_MANAGE_BOOKINGS.includes(req.user.role)) {
    return res.status(403).send('Доступ запрещён');
  }
  res.render('booking-new', {
    title: 'Новая бронь',
    equipmentId: req.query.equipment_id || '',
  });
});

module.exports = router;
