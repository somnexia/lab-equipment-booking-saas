const db = require('../config/db');
const bcrypt = require('bcrypt');

const AuthService = {

  async register(userData) {

    const { name, email, password, organization_id } = userData;

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (organization_id, name, email, password_hash, role)
       VALUES (?, ?, ?, ?, 'user')`,
      [organization_id, name, email, passwordHash]
    );

    return {
      id: result.insertId,
      name,
      email,
      
    };
  },

  async login(email, password) {

    const [rows] = await db.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    const user = rows[0];

    if (!user) {
      throw new Error('User not found');
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      throw new Error('Invalid password');
    }

    return user;
  }

};

module.exports = AuthService;