const BookingsService = require('../services/bookingsService');

function httpStatusFromSql(err) {
  const msg = err.sqlMessage || err.message || '';
  if (msg.includes('not found')) return 404;
  if (msg.includes('cannot') || msg.includes('only') || msg.includes('Role')) return 403;
  if (msg.includes('conflict') || msg.includes('available') || msg.includes('after')) return 400;
  return 500;
}

const BookingsController = {
  getAll: async (req, res) => {
    try {
      const bookings = await BookingsService.getAll();
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const booking = await BookingsService.getById(req.params.id);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const booking = await BookingsService.create(req.body, req.user);
      res.status(201).json({ message: 'Booking created', booking });
    } catch (err) {
      res.status(httpStatusFromSql(err)).json({ error: err.sqlMessage || err.message });
    }
  },

  update: async (req, res) => {
    try {
      const booking = await BookingsService.update(req.params.id, req.body, req.user);
      res.json({ message: 'Booking updated', booking });
    } catch (err) {
      res.status(httpStatusFromSql(err)).json({ error: err.sqlMessage || err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const result = await BookingsService.delete(req.params.id, req.user);
      res.json(result);
    } catch (err) {
      res.status(httpStatusFromSql(err)).json({ error: err.sqlMessage || err.message });
    }
  },
};

module.exports = BookingsController;
