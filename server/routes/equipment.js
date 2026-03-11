const express = require('express');
const router = express.Router();
const EquipmentController = require('../controllers/equipmentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');


// Использование в маршрутах middleware для аутентификации и авторизации: 

// 🔹 Любой авторизованный пользователь может просматривать оборудование
router.get('/', authenticate, EquipmentController.getAll);
router.get('/:id', authenticate, EquipmentController.getById);

// 🔹 Только админ и менеджер могут создавать, обновлять и удалять оборудование
router.post('/', authenticate, authorize(['admin', 'manager']), EquipmentController.create);
router.put('/:id', authenticate, authorize(['admin', 'manager']), EquipmentController.update);
router.delete('/:id', authenticate, authorize(['admin', 'manager']), EquipmentController.delete);

module.exports = router;