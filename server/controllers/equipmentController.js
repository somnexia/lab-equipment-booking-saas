// controllers/equipmentController.js
const EquipmentService = require('../services/equipmentService');

const EquipmentController = {
  getAll: async (req, res) => {
    try {
      const equipments = await EquipmentService.getAll();
      res.json(equipments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getById: async (req, res) => {
    try {
      const equipment = await EquipmentService.getById(req.params.id);
      if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
      res.json(equipment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  create: async (req, res) => {
    try {
      const newEquipment = await EquipmentService.create(req.body);
      res.status(201).json(newEquipment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const updatedEquipment = await EquipmentService.update(
        req.params.id,
        req.body,
        req.user
      );
      res.json(updatedEquipment);
    } catch (err) {
      console.error(err);
      const msg = err.sqlMessage || err.message;
      const status = msg.includes('not found') ? 404 : msg.includes('cannot') ? 403 : 500;
      res.status(status).json({ error: msg });
    }
  },

  delete: async (req, res) => {
    try {
      const result = await EquipmentService.delete(req.params.id);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = EquipmentController;