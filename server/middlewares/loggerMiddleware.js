// server/middlewares/loggerMiddleware.js

module.exports = (req, res, next) => {
  const ip =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress;

  const user = req.user ? req.user.email : 'Guest';

  console.log(`🌍 VISIT: ${req.method} ${req.originalUrl}`);
  console.log(`👤 User: ${user}`);
  console.log(`📍 IP: ${ip}`);
  console.log('-----------------------------');

  next();
};