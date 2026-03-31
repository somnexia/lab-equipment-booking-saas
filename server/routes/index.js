// server/routes/index.js
var express = require('express');
var router = express.Router();

const authRoutes = require('./auth');
const equipmentRoutes = require('./equipment');
const bookingsRoutes = require('./bookings');
const authPagesRoutes = require('./authPages');
const pocketbaseRoutes = require('./pocketbase');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// API маршруты
router.use('/api/auth', authRoutes);
router.use('/api/equipment', equipmentRoutes);
router.use('/api/bookings', bookingsRoutes);

// Страницы
router.use('/auth', authPagesRoutes);

// Dashboard через PocketBase
router.use('/', pocketbaseRoutes);

module.exports = router;