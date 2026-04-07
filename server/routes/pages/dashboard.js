const express = require('express');
const router = express.Router();
const requireAuth = require('../../middlewares/pageAuthMiddleware');
const pbService = require('../../services/pbAuthService');

router.get('/', requireAuth, async (req, res) => {
  console.log('Accessing dashboard for user:', req.user.email);
  try {
    const classes = await pbService.getClasses();
    console.log('Classes loaded:', classes);
    res.render('dashboard', { title: 'Dashboard', classes, user: req.user });
  } catch (err) {
    console.error('Dashboard load error:', err);
    res.render('dashboard', { title: 'Dashboard', classes: [], error: 'Ошибка загрузки данных', user: req.user });
  }
});

module.exports = router;