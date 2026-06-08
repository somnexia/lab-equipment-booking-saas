// server/services/mysqlAuthService.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { DEFAULT_REGISTER_ROLE } = require('../config/roles');

const mysqlAuthService = {

  async register({ name, email, password, organization_id, role = DEFAULT_REGISTER_ROLE }) {

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (organization_id, name, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [organization_id, name, email, passwordHash, role]
    );

    return {
      id: result.insertId,
      organization_id,
      name,
      email,
      role,
    };
  },

  async login(email, password) {

    const [rows] = await db.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    const user = rows[0];
    if (!user) throw new Error('User not found');

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new Error('Invalid password');

    return user;
  }

};

module.exports = mysqlAuthService;