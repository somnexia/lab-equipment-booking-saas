const db = require('../config/db');

function firstResultSet(rows) {
  if (Array.isArray(rows) && Array.isArray(rows[0])) {
    return rows[0][0];
  }
  return rows[0];
}

const BookingsService = {
  getAll: async () => {
    const [rows] = await db.query(
      'SELECT * FROM v_bookings_detail ORDER BY start_time DESC'
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      'SELECT * FROM v_bookings_detail WHERE booking_id = ?',
      [id]
    );
    return rows[0];
  },

  create: async (booking, actor) => {
    const { equipment_id, user_id, start_time, end_time } = booking;
    const targetUserId = user_id || actor.id;

    const [rows] = await db.query(
      'CALL sp_create_booking(?, ?, ?, ?, ?, ?)',
      [equipment_id, targetUserId, start_time, end_time, actor.id, actor.role]
    );

    const result = firstResultSet(rows);
    return {
      id: result.booking_id,
      equipment_id,
      user_id: targetUserId,
      start_time,
      end_time,
      status: result.status,
    };
  },

  update: async (id, booking, actor) => {
    const { start_time, end_time, status } = booking;

    if (status === 'cancelled') {
      const [rows] = await db.query(
        'CALL sp_cancel_booking(?, ?, ?)',
        [id, actor.id, actor.role]
      );
      return { id: Number(id), ...firstResultSet(rows) };
    }

    if (status === 'completed') {
      const [rows] = await db.query(
        'CALL sp_complete_booking(?, ?, ?)',
        [id, actor.id, actor.role]
      );
      return { id: Number(id), ...firstResultSet(rows) };
    }

    if (start_time && end_time) {
      const [rows] = await db.query(
        'CALL sp_update_booking(?, ?, ?, ?, ?)',
        [id, start_time, end_time, actor.id, actor.role]
      );
      return { id: Number(id), start_time, end_time, ...firstResultSet(rows) };
    }

    const existing = await BookingsService.getById(id);
    return { id: Number(id), ...existing, ...booking };
  },

  delete: async (id, actor) => {
    const [rows] = await db.query(
      'CALL sp_cancel_booking(?, ?, ?)',
      [id, actor.id, actor.role]
    );
    const result = firstResultSet(rows);
    return {
      message: `Booking ${id} cancelled`,
      booking_id: result.booking_id,
      status: result.status,
    };
  },
};

module.exports = BookingsService;
