// server/middlewares/simplePassword.js
module.exports = (req, res, next) => {
  console.log('--- SIMPLE PASSWORD MIDDLEWARE ---');

  // req.user уже должен быть после authenticate
  if (!req.user) {
    console.log('❌ No user in request');
    return res.redirect('/auth/login');
  }

  // если пользователь уже прошёл simpleAuth → пускаем
  if (req.user.simpleAuth) {
    console.log('✅ Simple password already passed');
    return next();
  }

  console.log('🔐 Simple password required');

  // показываем страницу ввода пароля
  return res.render('simplePassword');
};