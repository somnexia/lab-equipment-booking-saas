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

  update: async (id, equipment, actor = null) => {
    const { name, category_id, description, status } = equipment;

    if (status && actor) {
      await db.query('CALL sp_update_equipment_status(?, ?, ?, ?)', [
        id,
        status,
        actor.id,
        actor.role,
      ]);
    }

    if (name !== undefined || category_id !== undefined || description !== undefined) {
      await db.query(
        `UPDATE equipment
         SET name = COALESCE(?, name),
             category_id = COALESCE(?, category_id),
             description = COALESCE(?, description)
         WHERE id = ?`,
        [name, category_id, description, id]
      );
    } else if (!status || !actor) {
      await db.query(
        `UPDATE equipment
         SET name = COALESCE(?, name),
             category_id = COALESCE(?, category_id),
             description = COALESCE(?, description),
             status = COALESCE(?, status)
         WHERE id = ?`,
        [name, category_id, description, status, id]
      );
    }

    const updated = await EquipmentService.getById(id);
    return updated || { id: Number(id), ...equipment };
  },

  // Удалить оборудование
  delete: async (id) => {
    await db.query('DELETE FROM equipment WHERE id = ?', [id]);
    return { message: `Equipment with id ${id} deleted` };
  }
};

module.exports = EquipmentService;