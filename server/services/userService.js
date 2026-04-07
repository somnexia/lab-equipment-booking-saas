// server/services/userService.js
const mysqlAuthService = require('./mysqlAuthService');
const pbAuthService = require('./pbAuthService');

const userService = {

  async register(data) {

    // 1. создаём в MySQL
    const user = await mysqlAuthService.register(data);

    // 2. создаём в PocketBase
    try {
      await pbAuthService.register(data);
    } catch (err) {
      console.error("PB error:", err.message);
      // можно не падать, если PB упал
    }

    return user;
  },

  async login(email, password) {
    return mysqlAuthService.login(email, password);
  }

};

module.exports = userService;