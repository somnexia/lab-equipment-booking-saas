// server/routes/api/auth.js

const express = require('express');
const router = express.Router();

const authController = require('../../controllers/authController');
const { authenticate } = require('../../middlewares/authMiddleware');

// 🔹 login / register
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

// 🔹 ВОТ ЭТО ТЫ ИСКАЛ
router.post('/simple-password', authenticate, authController.simplePassword);

module.exports = router;