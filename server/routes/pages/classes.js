const express = require('express');
const router = express.Router();

const { authenticate } = require('../../middlewares/authMiddleware');
const pbService = require('../../services/pbAuthService');
const simplePassword = require('../../middlewares/simplePassword');


router.get('/', authenticate, simplePassword, async (req, res) => {
  console.log('📚 Accessing classes page:', req.user.email);

  try {
    const classes = await pbService.getClasses();
    console.log('📦 Classes loaded:', classes);

    res.render('classes', {
      title: 'Classes',
      classes,
      user: req.user
    });

  } catch (err) {
    console.error('❌ Classes load error:', err);

    res.render('classes', {
      title: 'Classes',
      classes: [],
      error: 'Ошибка загрузки данных',
      user: req.user
    });
  }
});

module.exports = router;