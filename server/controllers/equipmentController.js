const EquipmentService = require('../services/equipmentService');

function httpStatus(err) {
  if (err.status) return err.status;
  const msg = err.sqlMessage || err.message || '';
  if (msg.includes('not found') || msg.includes('Equipment not found')) return 404;
  if (
    msg.includes('denied') ||
    msg.includes('cannot') ||
    msg.includes('Cannot') ||
    msg.includes('Only') ||
    msg.includes('Role') ||
    msg.includes('Technician') ||
    msg.includes('another organization')
  ) {
    return 403;
  }
  if (msg.includes('required') || msg.includes('invalid')) return 400;
  if (
    msg.includes('related bookings') ||
    msg.includes('active bookings') ||
    msg.includes('booking history')
  ) {
    return 409;
  }
  return 500;
}

const EquipmentController = {
  getAll: async (req, res) => {
    try {
      const equipments = await EquipmentService.getAll(req.user, req.query);
      res.json(equipments);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  getAvailable: async (req, res) => {
    try {
      const equipments = await EquipmentService.getAvailable(req.user, req.query);
      res.json(equipments);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const equipment = await EquipmentService.getById(req.params.id, req.user);
      res.json(equipment);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const newEquipment = await EquipmentService.create(req.body, req.user);
      res.status(201).json(newEquipment);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
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
      res.status(httpStatus(err)).json({ error: err.sqlMessage || err.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const updatedEquipment = await EquipmentService.updateStatus(
        req.params.id,
        req.body.status,
        req.user
      );
      res.json(updatedEquipment);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.sqlMessage || err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const result = await EquipmentService.delete(req.params.id, req.user);
      res.json(result);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },
};

module.exports = EquipmentController;
