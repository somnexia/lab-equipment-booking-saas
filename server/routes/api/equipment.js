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

router.get('/', authenticate, authorize(CAN_VIEW_EQUIPMENT), EquipmentController.getAll);
router.get('/:id', authenticate, authorize(CAN_VIEW_EQUIPMENT), EquipmentController.getById);

router.post('/', authenticate, authorize(CAN_MANAGE_EQUIPMENT), EquipmentController.create);
router.put('/:id', authenticate, authorize(CAN_EDIT_EQUIPMENT), EquipmentController.update);
router.delete('/:id', authenticate, authorize(CAN_MANAGE_EQUIPMENT), EquipmentController.delete);

module.exports = router;