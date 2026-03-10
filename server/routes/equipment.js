const express = require('express');
const router = express.Router();
const EquipmentController = require('../controllers/equipmentController');

// Прямое подключение контроллера к маршрутам
router.get('/', EquipmentController.getAll);
router.get('/:id', EquipmentController.getById);
router.post('/', EquipmentController.create);
router.put('/:id', EquipmentController.update);
router.delete('/:id', EquipmentController.delete);

module.exports = router;
