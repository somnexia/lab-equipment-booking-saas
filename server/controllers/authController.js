
// server\controllers\authController.js
const AuthService = require('../services/authService');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {

  try {

    
    const userData = req.body;
    const user = await AuthService.register(userData); // пока можно верн

    res.status(201).json({
      message: "User created",
      user
    });
S
  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await AuthService.login(email, password);

    const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role }, // <-- добавили роль
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {

    res.status(401).json({ error: err.message });

  }

};