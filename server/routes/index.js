var express = require('express');
var router = express.Router();

const equipmentRouter = require('./equipment');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.use('/api/equipment', equipmentRouter);

module.exports = router;
