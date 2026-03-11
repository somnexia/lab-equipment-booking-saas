var express = require('express');
var router = express.Router();

const authRoutes = require('./auth');
const equipmentRoutes = require('./equipment');
const bookingsRoutes = require('./bookings');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/api/auth', authRoutes);
router.use('/api/equipment', equipmentRoutes);
router.use('/api/bookings', bookingsRoutes);

module.exports = router;
