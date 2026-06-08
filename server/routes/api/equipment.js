const express = require('express');
const router = express.Router();
const EquipmentController = require('../../controllers/equipmentController');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');
const {
  CAN_VIEW_EQUIPMENT,
  CAN_MANAGE_EQUIPMENT,
  CAN_UPDATE_EQUIPMENT_STATUS,
} = require('../../config/roles');

const CAN_EDIT_EQUIPMENT = [
  ...new Set([...CAN_MANAGE_EQUIPMENT, ...CAN_UPDATE_EQUIPMENT_STATUS]),
];

router.get(
  '/available',
  authenticate,
  authorize(CAN_VIEW_EQUIPMENT),
  EquipmentController.getAvailable
);
router.get('/', authenticate, authorize(CAN_VIEW_EQUIPMENT), EquipmentController.getAll);

router.post('/', authenticate, authorize(CAN_MANAGE_EQUIPMENT), EquipmentController.create);

router.patch(
  '/:id/status',
  authenticate,
  authorize(CAN_UPDATE_EQUIPMENT_STATUS),
  EquipmentController.updateStatus
);

router.get('/:id', authenticate, authorize(CAN_VIEW_EQUIPMENT), EquipmentController.getById);
router.put('/:id', authenticate, authorize(CAN_EDIT_EQUIPMENT), EquipmentController.update);
router.delete('/:id', authenticate, authorize(CAN_MANAGE_EQUIPMENT), EquipmentController.delete);

module.exports = router;