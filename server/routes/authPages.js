const express = require('express');
const router = express.Router();

// страница регистрации
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// страница логина
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// //главная страница после логина
// router.get('/dashboard', (req,res)=>{
//   res.render('dashboard',{title:'Dashboard'})
// })


module.exports = router;