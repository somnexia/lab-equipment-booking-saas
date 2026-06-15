const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const simplePassword = require('../../middlewares/simplePassword');
const { CAN_ACCESS_ADMIN_UI } = require('../../config/roles');

router.get('/', authenticate, simplePassword, (req, res) => {
  if (!CAN_ACCESS_ADMIN_UI.includes(req.user.role)) {
    return res.status(403).send('Access denied');
  }
  res.render('admin', { title: 'Admin' });
});

module.exports = router;
