// server/routes/pocketbase.js
const express = require('express');
const router = express.Router();
const pbController = require('../controllers/pocketbaseController');

// Главная страница с таблицей
router.get('/dashboard', pbController.getClasses);

module.exports = router;