const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');

// регистрация и логин остаются доступными
// страница регистрации
router.get('/register', (req, res) => {
  console.log('Render register page');
  res.render('register', { title: 'Регистрация' });
});

// страница логина
router.get('/login', (req, res) => {
  console.log('Render login page');
  res.render('login', { title: 'Login' });
});

// защищённая страница dashboard
router.get('/dashboard', authenticate, (req, res) => {
  console.log('Render dashboard page, user:', req.user);
  res.render('dashboard', { title: 'Каталог оборудования' });
});

module.exports = router;