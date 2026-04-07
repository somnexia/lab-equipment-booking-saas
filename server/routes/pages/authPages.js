const express = require('express');
const router = express.Router();
const requireAuth = require('../../middlewares/pageAuthMiddleware');

// регистрация и логин остаются доступными
// страница регистрации
router.get('/register', (req, res) => {
  console.log('Render register page');
  res.render('register', { title: 'Register' });
});

// страница логина
router.get('/login', (req, res) => {
  console.log('Render login page');
  res.render('login', { title: 'Login' });
});

// защищённая страница dashboard
router.get('/dashboard', requireAuth, (req, res) => {
  console.log('Render dashboard page, user:', req.user);
  res.render('dashboard', { title: 'Dashboard', user: req.user });
});

module.exports = router;