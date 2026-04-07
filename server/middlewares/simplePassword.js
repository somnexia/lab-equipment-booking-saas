// middlewares/simplePassword.js
module.exports = (req, res, next) => {
  // Можно брать пароль из query, body или header — пример через query
  const password = req.query.simplePassword || req.headers['x-simple-password'];

  if (!password || password !== process.env.SIMPLE_PASSWORD) {
    console.log('❌ Simple password check failed');
    return res.status(401).send('Доступ запрещен: неверный простой пароль');
  }

  console.log('✅ Simple password passed');
  next();
};