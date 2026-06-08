const express = require('express');
const router = express.Router();
const BookingsController = require('../../controllers/bookingsController');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');
const {
  CAN_VIEW_BOOKINGS,
  CAN_MANAGE_BOOKINGS,
  CAN_DELETE_BOOKINGS,
} = require('../../config/roles');

router.get(
  '/me',
  authenticate,
  authorize(CAN_VIEW_BOOKINGS),
  BookingsController.getMine
);
router.get(
  '/upcoming',
  authenticate,
  authorize(CAN_VIEW_BOOKINGS),
  BookingsController.getUpcoming
);
router.get('/', authenticate, authorize(CAN_VIEW_BOOKINGS), BookingsController.getAll);

router.post('/', authenticate, authorize(CAN_MANAGE_BOOKINGS), BookingsController.create);

router.patch(
  '/:id/cancel',
  authenticate,
  authorize(CAN_MANAGE_BOOKINGS),
  BookingsController.cancel
);
router.patch(
  '/:id/complete',
  authenticate,
  authorize(CAN_MANAGE_BOOKINGS),
  BookingsController.complete
);

router.get('/:id', authenticate, authorize(CAN_VIEW_BOOKINGS), BookingsController.getById);
router.put('/:id', authenticate, authorize(CAN_MANAGE_BOOKINGS), BookingsController.update);
router.delete(
  '/:id',
  authenticate,
  authorize(CAN_DELETE_BOOKINGS),
  BookingsController.delete
);

module.exports = router;
