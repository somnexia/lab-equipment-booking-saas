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
    const {
      name,
      category_id,
      description,
      organization_id,
      status = 'available',
    } = equipment;
    const [result] = await db.query(
      `INSERT INTO equipment (organization_id, name, category_id, description, status)
       VALUES (?, ?, ?, ?, ?)`,
      [organization_id, name, category_id, description, status]
    );
    return { id: result.insertId, ...equipment };
  },

  update: async (id, equipment) => {
    const { name, category_id, description, status } = equipment;
    await db.query(
      `UPDATE equipment
       SET name = COALESCE(?, name),
           category_id = COALESCE(?, category_id),
           description = COALESCE(?, description),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [name, category_id, description, status, id]
    );
    return { id: Number(id), ...equipment };
  },

  // Удалить оборудование
  delete: async (id) => {
    await db.query('DELETE FROM equipment WHERE id = ?', [id]);
    return { message: `Equipment with id ${id} deleted` };
  }
};

module.exports = EquipmentService;