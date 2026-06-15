// server/services/userService.js
const mysqlAuthService = require('./mysqlAuthService');
const pbAuthService = require('./pbAuthService');

const userService = {

  async register(data) {

    const user = await mysqlAuthService.register(data);

    try {
      await pbAuthService.register(data);
    } catch (err) {
      console.error("PB error:", err.message);
    }

    return user;
  },

  async login(email, password) {
    return mysqlAuthService.login(email, password);
  }

};

module.exports = userService;
