const EquipmentCategoriesService = require('../services/equipmentCategoriesService');

function httpStatus(err) {
  if (err.status) return err.status;
  const msg = err.sqlMessage || err.message || '';
  if (msg.includes('not found')) return 404;
  if (msg.includes('denied') || msg.includes('Only')) return 403;
  if (msg.includes('required')) return 400;
  return 500;
}

const EquipmentCategoriesController = {
  getAll: async (req, res) => {
    try {
      const categories = await EquipmentCategoriesService.getAll(req.user);
      res.json(categories);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const category = await EquipmentCategoriesService.getById(
        req.params.id,
        req.user
      );
      res.json(category);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const category = await EquipmentCategoriesService.create(req.body, req.user);
      res.status(201).json(category);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const category = await EquipmentCategoriesService.update(
        req.params.id,
        req.body,
        req.user
      );
      res.json(category);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const result = await EquipmentCategoriesService.delete(
        req.params.id,
        req.user
      );
      res.json(result);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },
};

module.exports = EquipmentCategoriesController;
