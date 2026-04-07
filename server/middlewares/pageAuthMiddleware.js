// middlewares/pageAuthMiddleware.js
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  
  const token = req.cookies.token;
  console.log('Cookies received:', req.cookies);

  if (!token) {
    console.log('No token found, redirect to login');
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT verified:', decoded);
    req.user = decoded;
    
    next();
  } catch (err) {
    console.log('JWT verify failed:', err.message);
    res.clearCookie('token'); // очистить невалидный токен
    return res.redirect('/auth/login');
  
  }
}

module.exports = requireAuth;