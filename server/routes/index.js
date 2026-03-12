var express = require('express');
var router = express.Router();

const authRoutes = require('./auth');
const equipmentRoutes = require('./equipment');
const bookingsRoutes = require('./bookings');
const authPagesRoutes = require('./authPages');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
// главная страница 
router.get('/dashboard', (req,res)=>{
  res.render('dashboard',{title:'Dashboard'})
})

router.use('/api/auth', authRoutes);
router.use('/api/equipment', equipmentRoutes);
router.use('/api/bookings', bookingsRoutes);

// страницы
router.use('/auth', authPagesRoutes);


module.exports = router;
