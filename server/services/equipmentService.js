// services/equipmentService.js
const db = require('../config/db'); // твой файл подключения к MySQL

const EquipmentService = {
  // Получить все оборудование
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM equipment');
    return rows;
  },

  // Получить оборудование по ID
  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM equipment WHERE id = ?', [id]);
    return rows[0];
  },

  // Создать новое оборудование
  create: async (equipment) => {
    const { name, category_id, description } = equipment;
    const [result] = await db.query(
      'INSERT INTO equipment (name, category_id, description) VALUES (?, ?, ?)',
      [name, category_id, description]
    );
    return { id: result.insertId, ...equipment };
  },

  // Обновить оборудование
  update: async (id, equipment) => {
    const { name, category_id, description } = equipment;
    await db.query(
      'UPDATE equipment SET name = ?, category_id = ?, description = ? WHERE id = ?',
      [name, category_id, description, id]
    );
    return { id, ...equipment };
  },

  // Удалить оборудование
  delete: async (id) => {
    await db.query('DELETE FROM equipment WHERE id = ?', [id]);
    return { message: `Equipment with id ${id} deleted` };
  }
};

module.exports = EquipmentService;