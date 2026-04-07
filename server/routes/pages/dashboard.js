const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const simplePassword = require('../../middlewares/simplePassword');


router.get('/', authenticate, simplePassword, (req, res) => {
  console.log('📦 Dashboard (equipment) for:', req.user.email);

  res.render('dashboard', {
    title: 'Dashboard',
    user: req.user
  });
});

module.exports = router;