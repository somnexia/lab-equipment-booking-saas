const express = require('express');
const router = express.Router();
const BookingsController = require('../controllers/bookingsController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Все маршруты бронирований защищены авторизацией
router.get('/', authenticate, BookingsController.getAll);
router.get('/:id', authenticate, BookingsController.getById);

// Создать и обновить бронирование могут только менеджер и админ
router.post('/', authenticate, authorize(['admin', 'manager']), BookingsController.create);
router.put('/:id', authenticate, authorize(['admin', 'manager']), BookingsController.update);

// Удаление — только админ
router.delete('/:id', authenticate, authorize('admin'), BookingsController.delete);

module.exports = router;