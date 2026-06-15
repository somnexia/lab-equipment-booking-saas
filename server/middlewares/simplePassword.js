// SIMPLE_PASSWORD_MODE=off in .env disables this; otherwise one-time check after login.

function isSimplePasswordEnabled() {
  return (process.env.SIMPLE_PASSWORD_MODE || 'on').toLowerCase() !== 'off';
}

module.exports = (req, res, next) => {
  if (!isSimplePasswordEnabled()) {
    return next();
  }

  if (!req.user) {
    return res.redirect('/auth/login');
  }

  if (req.user.simpleAuth) {
    return next();
  }

  return res.render('simplePassword', { title: 'Additional password' });
};
