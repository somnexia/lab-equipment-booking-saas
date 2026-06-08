// SIMPLE_PASSWORD_MODE=off в .env — отключить; иначе обычный режим (один раз после login).

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

  return res.render('simplePassword', { title: 'Дополнительный пароль' });
};
