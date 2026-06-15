// server/controllers/authController.js
const AuthService = require('../services/mysqlAuthService');
const jwt = require('jsonwebtoken');
const { DEFAULT_REGISTER_ROLE } = require('../config/roles');

const JWT_EXPIRES_IN = '24h';
const TOKEN_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

function tokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_COOKIE_MAX_AGE,
    sameSite: 'lax',
  };
}

function issueToken(res, user, simpleAuth = false) {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || DEFAULT_REGISTER_ROLE,
      organization_id: user.organization_id,
      simpleAuth,
    },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  res.cookie('token', token, tokenCookieOptions());
}

exports.register = async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const userData = req.body;
    const user = await AuthService.register(userData);
    console.log('User created in MySQL & PB:', user);

    issueToken(res, user, false);

    res.status(201).json({
      message: 'User created',
      user,
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

    issueToken(res, user, false);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || DEFAULT_REGISTER_ROLE,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(401).json({ error: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out' });
};

exports.simplePassword = (req, res) => {
  const { password } = req.body;

  if (password !== process.env.SIMPLE_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);

  issueToken(
    res,
    {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      organization_id: decoded.organization_id,
    },
    true
  );

  return res.json({ success: true });
};
