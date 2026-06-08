const express = require('express');
const router = express.Router();
const EquipmentCategoriesController = require('../../controllers/equipmentCategoriesController');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');
const {
  CAN_VIEW_EQUIPMENT_CATEGORIES,
  CAN_MANAGE_EQUIPMENT_CATEGORIES,
} = require('../../config/roles');

router.get(
  '/',
  authenticate,
  authorize(CAN_VIEW_EQUIPMENT_CATEGORIES),
  EquipmentCategoriesController.getAll
);
router.get(
  '/:id',
  authenticate,
  authorize(CAN_VIEW_EQUIPMENT_CATEGORIES),
  EquipmentCategoriesController.getById
);

router.post(
  '/',
  authenticate,
  authorize(CAN_MANAGE_EQUIPMENT_CATEGORIES),
  EquipmentCategoriesController.create
);
router.put(
  '/:id',
  authenticate,
  authorize(CAN_MANAGE_EQUIPMENT_CATEGORIES),
  EquipmentCategoriesController.update
);
router.delete(
  '/:id',
  authenticate,
  authorize(CAN_MANAGE_EQUIPMENT_CATEGORIES),
  EquipmentCategoriesController.delete
);

module.exports = router;
