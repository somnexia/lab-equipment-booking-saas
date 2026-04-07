// server/controllers/authController.js
const AuthService = require('../services/mysqlAuthService');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const userData = req.body;
    const user = await AuthService.register(userData);
    console.log('User created in MySQL & PB:', user);

    // Генерация JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role:  user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Ставим HttpOnly cookie
    res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // false на dev
  maxAge: 1000 * 60 * 60 * 24 // 1 день
});

    res.status(201).json({
      message: 'User created',
      user
    });

  } catch (err) {
    console.error('Register error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;
    const user = await AuthService.login(email, password);
    console.log('User found in MySQL:', user);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Ставим HttpOnly cookie
    res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // false на dev
  maxAge: 1000 * 60 * 60 * 24 // 1 день
});

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(401).json({ error: err.message });
  }
};