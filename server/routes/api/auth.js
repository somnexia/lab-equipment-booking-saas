// server/routes/api/auth.js

const express = require('express');
const router = express.Router();

const authController = require('../../controllers/authController');
const { authenticate } = require('../../middlewares/authMiddleware');

// В браузере открывают GET — API принимает только POST; перенаправляем на форму
router.get('/login', (req, res) => {
  res.redirect('/auth/login');
});

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

// 🔹 ВОТ ЭТО ТЫ ИСКАЛ
router.post('/simple-password', authenticate, authController.simplePassword);

module.exports = router;