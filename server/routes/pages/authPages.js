const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const OrganizationsService = require('../../services/organizationsService');

router.get('/register', async (req, res, next) => {
  try {
    const organizations = await OrganizationsService.listForRegistration();
    res.render('register', { title: 'Регистрация', organizations });
  } catch (err) {
    next(err);
  }
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.get('/dashboard', authenticate, (req, res) => {
  res.render('dashboard', { title: 'Каталог оборудования' });
});

module.exports = router;
