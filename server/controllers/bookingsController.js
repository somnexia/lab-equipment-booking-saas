const BookingsService = require('../services/bookingsService');

function httpStatus(err) {
  if (err.status) return err.status;
  const msg = err.sqlMessage || err.message || '';
  if (msg.includes('not found') || msg.includes('Booking not found')) return 404;
  if (
    msg.includes('denied') ||
    msg.includes('cannot') ||
    msg.includes('Cannot') ||
    msg.includes('Only') ||
    msg.includes('Role') ||
    msg.includes('Student') ||
    msg.includes('Actor')
  ) {
    return 403;
  }
  if (
    msg.includes('conflict') ||
    msg.includes('available') ||
    msg.includes('after') ||
    msg.includes('required') ||
    msg.includes('invalid') ||
    msg.includes('active bookings')
  ) {
    return 400;
  }
  return 500;
}

const BookingsController = {
  getAll: async (req, res) => {
    try {
      const bookings = await BookingsService.getAll(req.user, req.query);
      res.json(bookings);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  getMine: async (req, res) => {
    try {
      const bookings = await BookingsService.getMine(req.user);
      res.json(bookings);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  getUpcoming: async (req, res) => {
    try {
      const bookings = await BookingsService.getUpcoming(req.user, req.query);
      res.json(bookings);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const booking = await BookingsService.getById(req.params.id, req.user);
      res.json(booking);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const booking = await BookingsService.create(req.body, req.user);
      res.status(201).json(booking);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.sqlMessage || err.message });
    }
  },

  update: async (req, res) => {
    try {
      const booking = await BookingsService.update(
        req.params.id,
        req.body,
        req.user
      );
      res.json(booking);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.sqlMessage || err.message });
    }
  },

  cancel: async (req, res) => {
    try {
      const booking = await BookingsService.cancel(req.params.id, req.user);
      res.json(booking);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.sqlMessage || err.message });
    }
  },

  complete: async (req, res) => {
    try {
      const booking = await BookingsService.complete(req.params.id, req.user);
      res.json(booking);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.sqlMessage || err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const result = await BookingsService.delete(req.params.id, req.user);
      res.json(result);
    } catch (err) {
      res.status(httpStatus(err)).json({ error: err.sqlMessage || err.message });
    }
  },
};

module.exports = BookingsController;
