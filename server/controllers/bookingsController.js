const BookingsService = require('../services/bookingsService');

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
      const booking = await BookingsService.create(req.body);
      res.status(201).json({ message: 'Booking created', booking });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const booking = await BookingsService.update(req.params.id, req.body);
      res.json({ message: 'Booking updated', booking });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const result = await BookingsService.delete(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = BookingsController;