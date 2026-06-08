const OrganizationsService = require('../services/organizationsService');

function httpStatus(err) {
  if (err.status) return err.status;
  const msg = err.sqlMessage || err.message || '';
  if (msg.includes('not found')) return 404;
  if (msg.includes('denied') || msg.includes('Only')) return 403;
  if (msg.includes('required')) return 400;
  if (msg.includes('Cannot delete')) return 409;
  return 500;
}

const OrganizationsController = {
  getAll: async (req, res) => {
    try {
      const organizations = await OrganizationsService.getAll(req.user);
      res.json(organizations);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const organization = await OrganizationsService.getById(
        req.params.id,
        req.user
      );
      res.json(organization);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const organization = await OrganizationsService.create(req.body, req.user);
      res.status(201).json(organization);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const organization = await OrganizationsService.update(
        req.params.id,
        req.body,
        req.user
      );
      res.json(organization);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const result = await OrganizationsService.delete(req.params.id, req.user);
      res.json(result);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },
};

module.exports = OrganizationsController;
