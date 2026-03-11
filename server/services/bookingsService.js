const db = require('../config/db');

const BookingsService = {
  // Получить все бронирования
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM bookings');
    return rows;
  },

  // Получить бронирование по ID
  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
    return rows[0];
  },

  // Создать новое бронирование
  create: async (booking) => {
    const { equipment_id, user_id, start_time, end_time, status } = booking;
    const [result] = await db.query(
      'INSERT INTO bookings (equipment_id, user_id, start_time, end_time, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [equipment_id, user_id, start_time, end_time, status || 'active']
    );
    return { id: result.insertId, ...booking };
  },

  // Обновить бронирование
  update: async (id, booking) => {
    const { start_time, end_time, status } = booking;
    await db.query(
      'UPDATE bookings SET start_time = ?, end_time = ?, status = ? WHERE id = ?',
      [start_time, end_time, status, id]
    );S
    return { id, ...booking };
  },

  // Удалить бронирование
  delete: async (id) => {
    await db.query('DELETE FROM bookings WHERE id = ?', [id]);
    return { message: `Booking with id ${id} deleted` };
  },
};

module.exports = BookingsService;