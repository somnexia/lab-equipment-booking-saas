const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const OrganizationsService = require('../../services/organizationsService');

router.get('/register', async (req, res, next) => {
  try {
    const organizations = await OrganizationsService.listForRegistration();
    res.render('register', { title: 'Register', organizations });
  } catch (err) {
    next(err);
  }
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Log in' });
});

router.get('/dashboard', authenticate, (req, res) => {
  res.render('dashboard', { title: 'Equipment catalog' });
});

module.exports = router;
