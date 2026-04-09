const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');

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

router.post('/simple-password', (req, res) => {
  console.log('🔐 Simple password POST:', req.body);

  const { password } = req.body;

  if (password === process.env.SIMPLE_PASSWORD) {
    res.cookie('simplePassword', password, {
      httpOnly: true,
      sameSite: 'lax'
    });

    console.log('✅ Simple password saved');

    return res.redirect('/dashboard');
  }

  console.log('❌ Wrong simple password');
  res.send('Неверный пароль');
});

// защищённая страница dashboard
router.get('/dashboard', authenticate, (req, res) => {
  console.log('Render dashboard page, user:', req.user);
  res.render('dashboard', { title: 'Dashboard', user: req.user });
});

module.exports = router;