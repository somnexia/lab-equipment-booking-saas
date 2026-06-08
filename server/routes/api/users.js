const express = require('express');
const router = express.Router();
const UsersController = require('../../controllers/usersController');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');
const {
  CAN_LIST_USERS,
  CAN_CREATE_USERS,
  CAN_UPDATE_USERS,
  CAN_DELETE_USERS,
} = require('../../config/roles');

router.get(
  '/me',
  authenticate,
  UsersController.getMe
);

router.get(
  '/',
  authenticate,
  authorize(CAN_LIST_USERS),
  UsersController.getAll
);

router.get(
  '/:id',
  authenticate,
  UsersController.getById
);

router.post(
  '/',
  authenticate,
  authorize(CAN_CREATE_USERS),
  UsersController.create
);

router.put(
  '/:id',
  authenticate,
  authorize(CAN_UPDATE_USERS),
  UsersController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize(CAN_DELETE_USERS),
  UsersController.delete
);

module.exports = router;
