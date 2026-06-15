// server/routes/api/auth.js

const express = require('express');
const router = express.Router();

const authController = require('../../controllers/authController');
const { authenticate } = require('../../middlewares/authMiddleware');

// Browser may open GET — API accepts POST only; redirect to the form
router.get('/login', (req, res) => {
  res.redirect('/auth/login');
});

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

router.post('/simple-password', authenticate, authController.simplePassword);

module.exports = router;
