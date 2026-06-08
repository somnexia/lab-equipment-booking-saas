const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const simplePassword = require('../../middlewares/simplePassword');
const {
  CAN_MANAGE_BOOKINGS,
  CAN_MANAGE_EQUIPMENT,
  CAN_UPDATE_EQUIPMENT_STATUS,
} = require('../../config/roles');

router.get('/', authenticate, simplePassword, (req, res) => {
  res.render('dashboard', {
    title: 'Каталог оборудования',
    uiPerms: {
      canBook: CAN_MANAGE_BOOKINGS.includes(req.user.role),
      canManageEquipment: CAN_MANAGE_EQUIPMENT.includes(req.user.role),
      canUpdateStatus: CAN_UPDATE_EQUIPMENT_STATUS.includes(req.user.role),
    },
  });
});

module.exports = router;