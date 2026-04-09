// server/routes/index.js
const express = require('express');
const router = express.Router();

// API
const authRoutes = require('./api/auth');
const equipmentRoutes = require('./api/equipment');
const bookingsRoutes = require('./api/bookings');
const classesApi = require('./api/classes');
// Pages
const authPagesRoutes = require('./pages/authPages');
const dashboardRoutes = require('./pages/dashboard');
const classesRoutes = require('./pages/classes');

router.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// API
router.use('/api/auth', authRoutes);
router.use('/api/equipment', equipmentRoutes);
router.use('/api/bookings', bookingsRoutes);
router.use('/api/classes', classesApi);

// Pages
router.use('/auth', authPagesRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/classes', classesRoutes);

module.exports = router;