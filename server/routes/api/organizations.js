const express = require('express');
const router = express.Router();
const OrganizationsController = require('../../controllers/organizationsController');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');
const {
  CAN_VIEW_ORGANIZATIONS,
  CAN_CREATE_ORGANIZATIONS,
  CAN_UPDATE_ORGANIZATIONS,
  CAN_DELETE_ORGANIZATIONS,
} = require('../../config/roles');

router.get(
  '/',
  authenticate,
  authorize(CAN_VIEW_ORGANIZATIONS),
  OrganizationsController.getAll
);
router.get(
  '/:id',
  authenticate,
  authorize(CAN_VIEW_ORGANIZATIONS),
  OrganizationsController.getById
);

router.post(
  '/',
  authenticate,
  authorize(CAN_CREATE_ORGANIZATIONS),
  OrganizationsController.create
);
router.put(
  '/:id',
  authenticate,
  authorize(CAN_UPDATE_ORGANIZATIONS),
  OrganizationsController.update
);
router.delete(
  '/:id',
  authenticate,
  authorize(CAN_DELETE_ORGANIZATIONS),
  OrganizationsController.delete
);

module.exports = router;
