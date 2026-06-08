const UsersService = require('../services/usersService');

function httpStatus(err) {
  if (err.status) return err.status;
  const msg = err.sqlMessage || err.message || '';
  if (msg.includes('not found')) return 404;
  if (msg.includes('denied') || msg.includes('Cannot')) return 403;
  if (msg.includes('required')) return 400;
  if (msg.includes('already exists')) return 409;
  return 500;
}

const UsersController = {
  getAll: async (req, res) => {
    try {
      const users = await UsersService.getAll(req.user);
      res.json(users);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  getMe: async (req, res) => {
    try {
      const user = await UsersService.getMe(req.user);
      res.json(user);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const user = await UsersService.getById(req.params.id, req.user);
      res.json(user);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const user = await UsersService.create(req.body, req.user);
      res.status(201).json(user);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const user = await UsersService.update(req.params.id, req.body, req.user);
      res.json(user);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const result = await UsersService.delete(req.params.id, req.user);
      res.json(result);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },
};

module.exports = UsersController;
